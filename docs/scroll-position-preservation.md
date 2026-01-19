# 滚动位置保持机制分析

## 概述

本项目在刷新后能够巧妙地保持滚动位置不跳动，用户体验非常流畅。这个特性是通过多个技术点共同实现的，本文档详细分析了相关的代码和实现逻辑。

---

## 核心机制

### 1. SSR 预渲染 + 数据预取

**关键技术：** `useAsyncData` + Nuxt 服务端渲染

项目使用 Nuxt 4 的 SSR 能力，所有数据在服务器端就已经获取并渲染到 HTML 中，这避免了客户端加载时的内容闪烁和布局跳动。

#### 示例代码：app.vue

```vue
<script setup lang="ts">
const api = useApi();

// 在服务器端获取菜单数据，并缓存到全局状态
const { data: menuCollections } = await useAsyncData(
  "menuCollections",
  () => api.getMenuCollections()
);
useState("menuCollections", () => menuCollections.value);
</script>
```

**工作原理：**

1. **服务器端执行：**
   - 请求页面时，服务器立即调用 `api.getMenuCollections()`
   - 数据获取完成后渲染到 HTML 中
   - HTML 包含完整的菜单结构和内容

2. **客户端水合：**
   - 浏览器接收到包含数据的 HTML
   - Vue 进行水合（hydration），不需要重新获取数据
   - 页面内容已经存在，不会发生布局跳动

3. **全局状态共享：**
   - 使用 `useState("menuCollections")` 创建全局状态
   - 所有组件可以访问，无需重复请求

---

#### 示例代码：category/[slug].vue

```vue
<script setup lang="ts">
const api = useApi();
const slug = route.params.slug as string;
const { take, page, skip } = usePagination(12);

// SSR 友好的数据获取
const { data: collectionProducts } = await useAsyncData(
  `collection-products-${slug}-${page.value}`,
  () => api.searchProducts({
    collectionSlug: slug,
    skip: skip.value,
    take: take,
  }),
  {
    watch: [page], // 监听分页变化
  }
);

const products = computed(() => collectionProducts.value?.search?.items ?? []);
</script>
```

**关键点：**
- 数据在页面渲染前就已经准备好
- 使用唯一的 key (`collection-products-${slug}-${page.value}`) 进行缓存
- 避免重复请求相同的数据

---

### 2. 布局稳定性设计

**关键技术：** Flexbox + 最小高度约束

#### 代码位置：layouts/default.vue

```vue
<template>
  <div
    :class="{ 'pb-18 sm:pb-0': isPdp }"
    class="flex min-h-svh flex-col"
  >
    <AppHeader class="sticky top-0" />
    <div class="flex-1">
      <slot />
    </div>
    <AppFooter />
  </div>
</template>
```

**布局分析：**

```
┌─────────────────────────────┐
│  AppHeader (sticky top-0)   │ ← 固定在顶部，不随滚动
├─────────────────────────────┤
│                             │
│  <slot /> (flex-1)          │ ← 主内容区，占据剩余空间
│                             │
│  min-h-svh 确保最小高度     │
│                             │
├─────────────────────────────┤
│  AppFooter                  │ ← 始终在底部
└─────────────────────────────┘
```

**技术要点：**

1. **`min-h-svh`（Minimum Height: Small Viewport Height）**
   - 确保容器至少占满整个视口高度
   - 避免内容不足时底部空白
   - SVH 比 VH 更准确（考虑移动端地址栏）

2. **`flex flex-col`**
   - 垂直布局，头部、内容、底部依次排列
   - 内容区 `flex-1` 自动填充剩余空间

3. **`sticky top-0`**
   - 头部固定在顶部，不影响内容区滚动
   - 避免固定定位导致的布局跳动

---

### 3. 图片加载优化

**关键技术：** Nuxt Image + 预加载策略

#### 代码位置：pages/index.vue

```vue
<NuxtImg
  format="webp"
  class="h-[420px] w-full object-cover lg:h-[560px]"
  :src="bannerUrl"
  alt="Hero image"
  loading="eager"           ← 立即加载，不延迟
  sizes="sm:100vw md:1600px"
  fetchpriority="high"      ← 高优先级加载
  preload                   ← 预加载
  placeholder               ← 显示占位符
  placeholder-class="blur-xl" ← 模糊占位效果
/>
```

**优化策略：**

1. **立即加载关键图片：** `loading="eager"`
   - 英雄图（Hero Image）立即加载
   - 避免图片加载导致的布局偏移

2. **高优先级：** `fetchpriority="high"`
   - 告诉浏览器优先加载此图片
   - 减少关键内容的加载时间

3. **预加载：** `preload`
   - 在 HTML `<head>` 中添加 `<link rel="preload">`
   - 浏览器更早开始下载图片

4. **占位符：** `placeholder` + `placeholder-class="blur-xl"`
   - 显示模糊占位图，避免空白
   - 图片加载完成前保持布局空间

5. **响应式尺寸：** `sizes="sm:100vw md:1600px"`
   - 根据设备尺寸加载合适大小的图片
   - 减少不必要的带宽消耗

---

### 4. Nuxt 4 默认滚动行为

**内置机制：** 浏览器 History API + Nuxt Router

Nuxt 4 默认使用浏览器的原生滚动恢复机制，无需额外配置。

#### 浏览器原生行为

现代浏览器（Chrome 46+, Firefox 46+, Safari 11+）支持 **滚动位置恢复**：

```javascript
// 浏览器自动处理
history.scrollRestoration = 'auto'; // Nuxt 4 默认行为
```

**工作原理：**

1. **前进/后退导航：**
   - 浏览器自动保存每个页面的滚动位置
   - 返回时恢复到上次的位置

2. **刷新页面：**
   - 浏览器记住刷新前的滚动位置
   - 页面加载完成后恢复到该位置

3. **SSR 优势：**
   - 因为内容在服务器端就已经渲染好
   - 浏览器能够准确计算并恢复滚动位置
   - 不会因为内容动态加载而导致位置偏移

---

### 5. 分页滚动处理

**代码位置：** layers/base/app/pages/category/[slug].vue

#### 主动滚动控制

```vue
<script setup lang="ts">
const { page } = usePagination(12);

// 监听分页变化，滚动到顶部
watch(page, () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
</script>
```

**使用场景：**

- 用户点击分页按钮（例如：第 1 页 → 第 2 页）
- 平滑滚动到页面顶部，查看新一页的商品
- 这是**主动的用户操作**，与浏览器的自动恢复不冲突

**注意：** 这段代码只在**主动分页**时触发，不影响浏览器的后退/刷新行为。

---

## 技术对比

### 为什么传统 SPA 会有滚动跳动？

| 传统 SPA (客户端渲染) | 本项目 (SSR + 预渲染) |
|-------------------|-------------------|
| 1. 加载空白 HTML | 1. 加载完整 HTML（含数据） |
| 2. 加载 JavaScript Bundle | 2. 客户端 JS 开始水合 |
| 3. 执行 JS，发起 API 请求 | 3. 直接使用预渲染的数据 |
| 4. 等待数据返回 | 4. 页面已完整渲染 |
| 5. 渲染内容（**布局跳动**） | 5. 无跳动，立即可交互 |
| 6. 图片开始加载（**再次跳动**） | 6. 关键图片已预加载 |

**核心差异：**
- 传统 SPA：内容逐步加载，布局多次重排
- 本项目：内容一次性渲染，布局稳定

---

## 实现要点总结

### ✅ 必须遵循的最佳实践

1. **使用 `useAsyncData` 进行数据获取**
   ```typescript
   const { data } = await useAsyncData(key, fetcher);
   ```
   - 不要使用 `onMounted` 中的 `fetch`
   - 不要在客户端才发起数据请求

2. **关键内容使用 SSR**
   ```typescript
   // ✅ 好的做法
   const { data } = await useAsyncData(...)
   
   // ❌ 避免
   onMounted(async () => {
     data.value = await fetch(...)
   })
   ```

3. **图片优化策略**
   - 首屏图片：`loading="eager"` + `fetchpriority="high"`
   - 非首屏图片：`loading="lazy"`
   - 始终指定图片尺寸（避免布局偏移）

4. **布局稳定性**
   ```css
   /* 容器最小高度 */
   .container {
     min-height: 100svh;
   }
   
   /* 固定头部 */
   .header {
     position: sticky;
     top: 0;
   }
   ```

5. **避免客户端专属代码影响 SSR**
   ```typescript
   // ✅ 安全的客户端代码
   if (import.meta.client) {
     window.scrollTo(...)
   }
   
   // ❌ 直接访问 window（SSR 会报错）
   window.scrollTo(...)
   ```

---

## 相关文件索引

### 核心配置

| 文件 | 说明 |
|-----|------|
| `nuxt.config.ts` | Nuxt 配置，SSR 默认启用 |
| `app/app.vue` | 根组件，全局数据预取 |
| `app/layouts/default.vue` | 布局模板，min-h-svh + flex |

### 数据获取

| 文件 | 数据类型 |
|-----|---------|
| `layers/base/app/composables/useApi.ts` | REST API 封装 |
| `layers/base/app/pages/category/[slug].vue` | 分类商品列表 |
| `layers/base/app/pages/product/[slug].vue` | 商品详情 |
| `app/pages/index.vue` | 首页数据 |

### 组件

| 文件 | 功能 |
|-----|------|
| `layers/base/app/components/AppHeader.vue` | 固定头部，sticky 定位 |
| `layers/base/app/components/home/FeaturedProducts.vue` | 精选商品，SSR 渲染 |

---

## 性能指标

### 布局稳定性指标（CLS - Cumulative Layout Shift）

本项目通过以上优化，能够实现：

- **CLS < 0.1**（优秀标准）
- 首屏内容无偏移
- 图片加载不影响布局
- 滚动位置精确恢复

### 用户体验提升

| 场景 | 传统 SPA | 本项目 |
|-----|---------|--------|
| 刷新页面 | 跳到顶部 | 保持位置 ✅ |
| 后退导航 | 跳到顶部 | 保持位置 ✅ |
| 内容加载 | 布局跳动 | 无跳动 ✅ |
| 图片加载 | 布局跳动 | 占位稳定 ✅ |

---

## 常见问题

### Q1: 如何禁用滚动恢复？

如果某些场景需要禁用（例如：模态框关闭后不希望跳回之前位置）：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  router: {
    options: {
      scrollBehaviorType: 'manual' // 手动控制滚动
    }
  }
})
```

### Q2: 为什么有些页面还是会跳动？

可能的原因：
1. 数据在客户端才加载（未使用 `useAsyncData`）
2. 图片未设置固定尺寸或未使用占位符
3. 动态内容（广告、第三方脚本）影响布局

### Q3: 移动端的效果如何？

移动端同样有效，甚至更重要：
- `min-h-svh` 考虑了移动端地址栏
- 触摸滚动更依赖精确的位置恢复
- 网络较慢时，SSR 预渲染的优势更明显

---

## 扩展阅读

- [Nuxt 4 SSR 文档](https://nuxt.com/docs/guide/concepts/rendering)
- [useAsyncData API 参考](https://nuxt.com/docs/api/composables/use-async-data)
- [Web Vitals - CLS](https://web.dev/cls/)
- [浏览器滚动恢复规范](https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration)

---

## 总结

本项目实现滚动位置保持的核心思想是：

> **让内容在渲染前就准备好，浏览器就能准确恢复滚动位置**

通过 SSR 预渲染、布局稳定性设计、图片优化等多个方面的配合，最终实现了流畅的用户体验。这不是某个单一功能的结果，而是整个架构设计的体现。
