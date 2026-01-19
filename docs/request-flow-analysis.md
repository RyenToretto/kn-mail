# 请求流程分析：商品列表请求全流程

## 概述
本文档以 **分类商品列表页面** (`category/[slug].vue`) 为例，详细说明从用户访问页面到数据渲染的完整请求流程。

---

## 流程图

```
用户访问 URL
    ↓
[1] 页面组件加载 (category/[slug].vue)
    ↓
[2] 初始化分页参数 (usePagination)
    ↓
[3] 发起 GraphQL 请求 (useAsyncGql)
    ↓
[4] GraphQL Client 处理 (nuxt-graphql-client)
    ↓
[5] 添加认证 Headers (useGqlSession)
    ↓
[6] 发送 HTTP POST 请求到 Vendure API
    ↓
[7] Vendure 后端处理并返回数据
    ↓
[8] 响应数据解析和类型转换
    ↓
[9] 组件响应式更新
    ↓
[10] 模板渲染商品列表
```

---

## 详细流程分析

### 【第1步】页面组件初始化

**文件**: `layers/base/app/pages/category/[slug].vue`

```vue
<script setup lang="ts">
import type { MenuCollections, ChildCollection } from "~~/types/collection";

// 获取路由参数
const route = useRoute();
const slug = route.params.slug as string;  // 例如: "electronics"

// 获取当前分类信息（从全局状态）
const menuCollections = useState<MenuCollections>("menuCollections");
const currentCollection = menuItems.find((top) => top.slug === slug);
</script>
```

**关键点**：
- 从 URL 路由参数获取 `slug` (分类标识)
- 使用 `useState` 获取全局菜单数据（在 `app.vue` 中预加载）

---

### 【第2步】初始化分页参数

**文件**: `layers/base/app/composables/usePagination.ts`

```typescript
export function usePagination(take: number) {
  const route = useRoute();
  
  // 从 URL 查询参数获取当前页码，默认为 1
  const page = computed(() => Number(route.query.page) || 1);
  
  // 计算跳过的记录数（用于数据库分页）
  const skip = computed(() => (page.value - 1) * take);
  
  // 生成分页链接的函数
  const to = (newPage: number) => ({
    name: route.name!,
    params: route.params,
    query: { ...route.query, page: newPage },
  });

  return { take, page, skip, to };
}
```

**使用示例**:
```typescript
// 在页面组件中
const { take, page, skip, to } = usePagination(12);
// take = 12 (每页12条)
// page = 1 (第1页)
// skip = 0 (跳过0条)
```

---

### 【第3步】发起 GraphQL 查询请求

**文件**: `layers/base/app/pages/category/[slug].vue`

```typescript
// 使用 useAsyncGql 发起异步 GraphQL 请求
const { data: collectionProducts } = await useAsyncGql(
  "GetCollectionProducts",  // 查询名称
  {
    slug,    // 分类 slug，例如: "electronics"
    skip: skip,  // 分页偏移量，例如: 0
    take: take,  // 每页数量，例如: 12
  },
);

// 响应式计算属性
const products = computed(() => collectionProducts.value?.search?.items ?? []);
const total = computed(() => collectionProducts.value?.search?.totalItems ?? 0);
```

**关键点**：
- `useAsyncGql` 是由 `nuxt-graphql-client` 模块提供的 composable
- 自动处理 SSR（服务端渲染）和 CSR（客户端渲染）
- 返回响应式的 `data` 对象

---

### 【第4步】GraphQL 查询定义

**文件**: `layers/base/gql/queries/collection.gql`

```graphql
query GetCollectionProducts($slug: String!, $skip: Int, $take: Int) {
  search(
    input: {
      collectionSlug: $slug
      groupByProduct: true
      skip: $skip
      take: $take
    }
  ) {
    totalItems
    items {
      ...ProductSearchFragment
    }
  }
}
```

**文件**: `layers/base/gql/fragments/product.gql`

```graphql
fragment ProductSearchFragment on SearchResult {
  productName
  slug
  productAsset {
    id
    preview
  }
  priceWithTax {
    ... on SinglePrice {
      value
    }
    ... on PriceRange {
      min
      max
    }
  }
  currencyCode
}
```

**关键点**：
- 使用 GraphQL Fragment 来复用字段定义
- 支持类型安全（TypeScript 类型会自动生成）
- 查询参数包括：slug（分类）、skip（偏移）、take（数量）

---

### 【第5步】GraphQL Client 配置

**文件**: `layers/base/nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  "graphql-client": {
    codegen: {
      disableOnBuild: false,
      onlyOperationTypes: false,
    },
    documentPaths: [
      "../layers/base/gql/queries",    // 查询文件路径
      "../layers/base/gql/fragments",  // Fragment 路径
    ],
    clients: {
      default: {
        schema: "../graphql.schema.json",
        host: process.env.GQL_HOST!,  // "http://localhost:3000/shop-api"
        token: {
          type: "Bearer",
          name: "Authorization",
          value: "",  // 动态从 authStore 获取
        },
        retainToken: true,
        headers: {
          "vendure-token": process.env.NUXT_PUBLIC_CHANNEL_TOKEN!,
        },
      },
    },
  },
});
```

---

### 【第6步】认证和 Headers 处理

**文件**: `layers/base/app/composables/useGqlSession.ts`

```typescript
export async function useGqlSession(
  locale: string,
  gqlHost: string | undefined,
  channelToken: string,
) {
  const authStore = useAuthStore();
  
  // 构建请求 Headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // 添加认证 Token（如果用户已登录）
  const token = authStore.session?.token;
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  // 添加渠道 Token（多租户支持）
  if (channelToken) {
    headers["vendure-token"] = channelToken;
  }

  // 添加语言标识（国际化）
  if (locale) {
    headers["Accept-Language"] = locale;
  }

  // 发送请求
  const res = await fetch(`${gqlHost}?languageCode=${locale}`, {
    method: "POST",
    credentials: "include",  // 携带 Cookie
    headers: headers,
    body: JSON.stringify({ query, variables }),
  });

  // 更新 GraphQL Client 的全局 Headers
  useGqlHeaders(headers);
  
  return await res.json();
}
```

**实际发送的请求示例**:

```http
POST http://localhost:3000/shop-api?languageCode=en HTTP/1.1
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
vendure-token: your-channel-token
Accept-Language: en

{
  "query": "query GetCollectionProducts($slug: String!, $skip: Int, $take: Int) { ... }",
  "variables": {
    "slug": "electronics",
    "skip": 0,
    "take": 12
  }
}
```

---

### 【第7步】Vendure 后端处理

后端（Vendure）收到请求后：

1. **验证 Token**: 检查 `Authorization` header 中的 Bearer token
2. **识别渠道**: 通过 `vendure-token` header 确定多租户渠道
3. **解析 GraphQL**: 解析查询和变量
4. **数据库查询**: 
   ```sql
   SELECT * FROM product 
   WHERE collection_slug = 'electronics' 
   LIMIT 12 OFFSET 0
   ```
5. **应用权限**: 检查用户权限和商品可见性
6. **构建响应**: 按照 GraphQL Schema 格式化数据

---

### 【第8步】响应数据结构

**响应 JSON**:

```json
{
  "data": {
    "search": {
      "totalItems": 48,
      "items": [
        {
          "productName": "iPhone 15 Pro",
          "slug": "iphone-15-pro",
          "productAsset": {
            "id": "1",
            "preview": "https://cdn.example.com/iphone-15.jpg"
          },
          "priceWithTax": {
            "__typename": "SinglePrice",
            "value": 99900
          },
          "currencyCode": "USD"
        },
        {
          "productName": "MacBook Pro",
          "slug": "macbook-pro",
          "productAsset": {
            "id": "2",
            "preview": "https://cdn.example.com/macbook.jpg"
          },
          "priceWithTax": {
            "__typename": "PriceRange",
            "min": 199900,
            "max": 299900
          },
          "currencyCode": "USD"
        }
        // ... 更多商品
      ]
    }
  }
}
```

---

### 【第9步】类型安全和数据转换

**自动生成的 TypeScript 类型**: `types/default.ts`

```typescript
export type GetCollectionProductsQuery = {
  __typename?: 'Query';
  search: {
    __typename?: 'SearchResponse';
    totalItems: number;
    items: Array<{
      __typename?: 'SearchResult';
      productName: string;
      slug: string;
      productAsset?: {
        __typename?: 'SearchResultAsset';
        id: string;
        preview: string;
      } | null;
      priceWithTax: {
        __typename?: 'SinglePrice';
        value: number;
      } | {
        __typename?: 'PriceRange';
        min: number;
        max: number;
      };
      currencyCode: CurrencyCode;
    }>;
  };
};
```

**在组件中使用**:

```typescript
// 类型安全的数据访问
const products = computed(() => collectionProducts.value?.search?.items ?? []);
const total = computed(() => collectionProducts.value?.search?.totalItems ?? 0);
const totalPages = computed(() => Math.ceil(total.value / take));
```

---

### 【第10步】模板渲染

```vue
<template>
  <main class="container">
    <header class="mt-14">
      <h1 class="text-2xl font-semibold">{{ currentCollection?.name }}</h1>
    </header>

    <!-- 商品列表网格 -->
    <section class="mb-8">
      <div class="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <ProductCard
          v-for="(product, index) in products"
          :key="product.slug"
          :product="product"
          :eager="index < 4"
        />
      </div>
    </section>

    <!-- 分页导航 -->
    <nav v-if="total > take" class="mb-14 flex justify-center">
      <UPagination
        :page="page"
        :total="total"
        :items-per-page="take"
        :to="to"
      />
    </nav>
  </main>
</template>
```

**渲染结果**：
- 使用 `v-for` 循环渲染商品卡片
- 响应式布局：移动端1列，平板2列，桌面4列
- 懒加载优化：前4个商品使用 `eager` 加载
- 自动分页：超过12个商品时显示分页器

---

## 核心技术栈

### 1. **Nuxt 4**
- SSR（服务端渲染）支持
- 自动代码分割
- 文件系统路由

### 2. **nuxt-graphql-client**
- 提供 `useAsyncGql` composable
- 自动 TypeScript 类型生成
- SSR/CSR 自动切换

### 3. **Pinia (状态管理)**
```typescript
// stores/useAuthStore.ts
export const useAuthStore = defineStore('auth', () => {
  const session = ref<{ token: string } | null>(null);
  
  function setSession(token: string) {
    session.value = { token };
  }
  
  return { session, setSession };
});
```

### 4. **VueUse (工具库)**
```typescript
import { refDebounced } from "@vueuse/core";

// 搜索防抖示例
const term = ref("");
const debouncedTerm = refDebounced(term, 1000);
```

---

## 性能优化策略

### 1. **SSR 优化**
```typescript
// 在服务端预加载数据
const { data } = await useAsyncGql("GetCollectionProducts", { slug, skip, take });
```

### 2. **图片懒加载**
```vue
<ProductCard
  v-for="(product, index) in products"
  :eager="index < 4"  <!-- 首屏商品立即加载 -->
/>
```

### 3. **分页缓存**
- URL 查询参数 (`?page=2`) 支持浏览器前进/后退
- 可配合 Nuxt `payload` 缓存已访问页面

### 4. **GraphQL Fragment 复用**
```graphql
fragment ProductSearchFragment on SearchResult {
  productName
  slug
  productAsset { id, preview }
  priceWithTax { ... }
}
```

---

## 错误处理

### 1. **GraphQL 错误处理插件**

**文件**: `layers/base/app/plugins/gql-plugin.ts`

```typescript
export default defineNuxtPlugin(() => {
  useGqlError((err: GqlError) => {
    console.error("[GQL Error]", {
      statusCode: err.statusCode,
      operation: err.operationName,
      errors: err.gqlErrors,
    });
  });
});
```

### 2. **组件级错误处理**
```typescript
const { data, error } = await useAsyncGql("GetCollectionProducts", variables);

if (error.value) {
  console.error("Failed to load products:", error.value);
  // 显示错误提示或重定向
}
```

---

## 扩展示例：搜索功能

**文件**: `layers/base/app/composables/useSimpleSearch.ts`

```typescript
export function useSimpleSearch() {
  const term = ref("");
  const debouncedTerm = refDebounced(term, 1000);

  const { data, pending, error, execute } = useAsyncGql(
    "SearchProducts",
    {
      term: debouncedTerm,
      take: 12,
    },
    { immediate: false },  // 不立即执行
  );

  // 当输入达到2个字符时触发搜索
  watch(debouncedTerm, (val) => {
    if (val.length >= 2) execute();
  });

  const results = computed(() => data.value?.search.items ?? []);

  return { term, results, pending, error };
}
```

---

## 总结

### 请求流程关键点：

1. ✅ **类型安全**: GraphQL + TypeScript 全链路类型检查
2. ✅ **性能优化**: SSR、懒加载、分页、缓存
3. ✅ **用户体验**: 响应式设计、SEO 友好、错误处理
4. ✅ **可维护性**: Composables 复用、Fragment 共享、清晰的分层架构

### 数据流向：

```
用户操作 → 路由参数 → usePagination → useAsyncGql 
→ GraphQL Query + Variables → HTTP POST (with Auth Headers) 
→ Vendure API → Database → Response JSON 
→ TypeScript 类型转换 → 响应式数据 → Vue 模板渲染 → 用户界面
```

---

## 相关文件清单

| 文件路径 | 作用 |
|---------|------|
| `pages/category/[slug].vue` | 分类列表页面组件 |
| `composables/usePagination.ts` | 分页逻辑封装 |
| `composables/useGqlSession.ts` | GraphQL 会话管理 |
| `gql/queries/collection.gql` | 分类相关查询 |
| `gql/fragments/product.gql` | 商品字段 Fragment |
| `plugins/gql-plugin.ts` | GraphQL 错误处理插件 |
| `nuxt.config.ts` | GraphQL Client 配置 |
| `types/default.ts` | 自动生成的 TypeScript 类型 |
| `stores/useAuthStore.ts` | 认证状态管理 |

---

生成时间: 2026-01-19
