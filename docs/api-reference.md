# API Reference

本文档描述了 KN-Mail 项目的 REST API 接口。所有接口均由 Nuxt Server 提供，使用 Mock 数据。

## 目录

- [认证](#认证)
- [Collections API](#collections-api)
- [Products API](#products-api)
- [Orders API](#orders-api)
- [Customers API](#customers-api)
- [Config API](#config-api)
- [数据结构](#数据结构)

---

## 认证

大部分接口支持通过 `Authorization` header 传递 session token：

```
Authorization: Bearer <token>
```

登录成功后，服务器会在响应头 `vendure-auth-token` 中返回 token。

### Mock 测试账号

| Email | Password | 说明 |
|-------|----------|------|
| demo@example.com | password123 | 默认测试账号 |
| jane@example.com | password456 | 备用测试账号 |

---

## Collections API

### GET /api/collections

获取菜单集合列表（顶级分类及其子分类）。

**响应示例：**
```json
{
  "collections": {
    "items": [
      {
        "id": "1",
        "name": "Electronics",
        "slug": "electronics",
        "description": "Latest electronic gadgets and devices",
        "parentId": null,
        "featuredAsset": {
          "id": "asset-1",
          "preview": "https://picsum.photos/seed/electronics/400/300"
        },
        "children": [
          {
            "id": "1-1",
            "name": "Smartphones",
            "slug": "smartphones",
            "description": "Latest smartphones from top brands",
            "parentId": "1",
            "featuredAsset": { ... }
          }
        ]
      }
    ]
  }
}
```

### GET /api/collections/:slug

获取单个集合详情。

**路径参数：**
- `slug` - 集合标识

**响应示例：**
```json
{
  "collection": {
    "id": "1",
    "name": "Electronics",
    "slug": "electronics",
    "description": "Latest electronic gadgets and devices",
    "parentId": null,
    "featuredAsset": { ... }
  }
}
```

---

## Products API

### GET /api/products

获取商品列表。

**查询参数：**
- `skip` (number, default: 0) - 跳过的记录数
- `take` (number, default: 12) - 获取的记录数

**响应示例：**
```json
{
  "products": {
    "items": [...],
    "totalItems": 6
  }
}
```

### GET /api/products/:slug

获取商品详情。

**路径参数：**
- `slug` - 商品标识

**响应示例：**
```json
{
  "product": {
    "id": "prod-1",
    "name": "iPhone 15 Pro",
    "slug": "iphone-15-pro",
    "description": "...",
    "featuredAsset": { ... },
    "assets": [...],
    "variants": [...],
    "collections": [...]
  }
}
```

### GET /api/products/search

搜索商品。

**查询参数：**
- `term` (string) - 搜索关键词
- `collectionSlug` (string, optional) - 限定集合
- `skip` (number, default: 0) - 跳过的记录数
- `take` (number, default: 12) - 获取的记录数

**响应示例：**
```json
{
  "search": {
    "items": [
      {
        "productName": "iPhone 15 Pro",
        "slug": "iphone-15-pro",
        "productAsset": { ... },
        "priceWithTax": {
          "__typename": "PriceRange",
          "min": 99900,
          "max": 129900
        },
        "currencyCode": "USD"
      }
    ],
    "totalItems": 4
  }
}
```

### GET /api/products/stock

获取商品变体库存。

**查询参数：**
- `productId` (string, required) - 商品 ID
- `variantId` (string, required) - 变体 ID

**响应示例：**
```json
{
  "product": {
    "variantList": {
      "items": [
        { "stockLevel": "IN_STOCK" }
      ]
    }
  }
}
```

---

## Orders API

### GET /api/orders/active

获取当前会话的活动订单。

**Headers：**
- `Authorization: Bearer <token>` (optional)

**响应示例：**
```json
{
  "activeOrder": {
    "id": "order-123",
    "code": "ORD-ABC123",
    "state": "AddingItems",
    "totalQuantity": 2,
    "totalWithTax": 12980,
    "currencyCode": "USD",
    "lines": [...]
  }
}
```

### GET /api/orders/:code

根据订单号获取订单详情。

**路径参数：**
- `code` - 订单号

### GET /api/orders/history

获取客户订单历史。

**查询参数：**
- `skip` (number, default: 0)
- `take` (number, default: 10)

### POST /api/orders/items

添加商品到购物车。

**请求体：**
```json
{
  "variantId": "var-1-1",
  "quantity": 1,
  "variantInfo": {
    "name": "iPhone 15 Pro 128GB",
    "sku": "IP15P-128-NT",
    "price": 99900,
    "asset": { "id": "...", "preview": "..." }
  }
}
```

### DELETE /api/orders/items

从购物车移除商品。

**请求体：**
```json
{
  "orderLineId": "line-123"
}
```

### PATCH /api/orders/items

调整购物车商品数量。

**请求体：**
```json
{
  "orderLineId": "line-123",
  "quantity": 3
}
```

### POST /api/orders/coupon

应用优惠码。

**请求体：**
```json
{
  "couponCode": "SAVE10"
}
```

**可用优惠码：**
- `SAVE10` - 优惠 $10
- `SAVE20` - 优惠 $20
- `WELCOME` - 优惠 $5

### DELETE /api/orders/coupon

移除优惠码。

**请求体：**
```json
{
  "couponCode": "SAVE10"
}
```

### POST /api/orders/customer

设置订单客户（游客结账）。

**请求体：**
```json
{
  "emailAddress": "guest@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

### POST /api/orders/shipping-address

设置配送地址。

**请求体：**
```json
{
  "fullName": "John Doe",
  "streetLine1": "123 Main St",
  "streetLine2": "Apt 4B",
  "city": "New York",
  "postalCode": "10001",
  "countryCode": "US"
}
```

### POST /api/orders/shipping-method

设置配送方式。

**请求体：**
```json
{
  "shippingMethodId": "ship-1"
}
```

### POST /api/orders/transition

转换订单状态。

**请求体：**
```json
{
  "state": "ArrangingPayment"
}
```

**状态流转：**
```
AddingItems -> ArrangingPayment -> PaymentAuthorized/PaymentSettled -> Shipped -> Delivered
                                                                    -> Cancelled
```

### POST /api/orders/payment

添加支付。

**请求体：**
```json
{
  "method": "credit-card",
  "metadata": {
    "shouldDecline": false,
    "shouldError": false
  }
}
```

### POST /api/orders/custom-fields

设置订单自定义字段。

**请求体：**
```json
{
  "customFields": {
    "paymentProvider": "stripe"
  }
}
```

---

## Customers API

### GET /api/customers/active

获取当前登录客户信息。

**Headers：**
- `Authorization: Bearer <token>` (required)

**响应示例：**
```json
{
  "activeCustomer": {
    "id": "cust-1",
    "title": "Mr",
    "firstName": "John",
    "lastName": "Doe",
    "emailAddress": "demo@example.com",
    "phoneNumber": "+1-555-123-4567",
    "addresses": [...],
    "user": {
      "id": "user-1",
      "identifier": "demo@example.com"
    }
  }
}
```

### GET /api/customers/addresses

获取客户地址列表。

### POST /api/customers/login

用户登录。

**请求体：**
```json
{
  "emailAddress": "demo@example.com",
  "password": "password123",
  "rememberMe": true
}
```

**响应示例：**
```json
{
  "login": {
    "__typename": "CurrentUser",
    "id": "user-1",
    "identifier": "demo@example.com"
  },
  "token": "mock-token-xxx"
}
```

### POST /api/customers/logout

用户登出。

### POST /api/customers/register

注册新用户。

**请求体：**
```json
{
  "emailAddress": "newuser@example.com",
  "firstName": "New",
  "lastName": "User",
  "password": "password123"
}
```

### POST /api/customers/verify

验证用户账号。

**请求体：**
```json
{
  "token": "verification-token",
  "password": "newpassword"
}
```

### POST /api/customers/password-reset-request

请求密码重置。

**请求体：**
```json
{
  "emailAddress": "user@example.com"
}
```

### POST /api/customers/password-reset

重置密码。

**请求体：**
```json
{
  "token": "reset-token",
  "password": "newpassword123"
}
```

---

## Config API

### GET /api/shipping-methods

获取可用配送方式。

**响应示例：**
```json
{
  "eligibleShippingMethods": [
    {
      "id": "ship-1",
      "name": "Standard Shipping",
      "price": 999,
      "description": "Delivery in 5-7 business days"
    },
    {
      "id": "ship-2",
      "name": "Express Shipping",
      "price": 1999,
      "description": "Delivery in 2-3 business days"
    }
  ]
}
```

### GET /api/payment-methods

获取可用支付方式。

**响应示例：**
```json
{
  "eligiblePaymentMethods": [
    {
      "id": "pay-1",
      "name": "Credit Card",
      "code": "credit-card",
      "isEligible": true
    },
    {
      "id": "pay-3",
      "name": "Stripe",
      "code": "stripe",
      "isEligible": true
    }
  ]
}
```

### GET /api/countries

获取支持的国家列表。

**响应示例：**
```json
{
  "activeChannel": {
    "defaultShippingZone": {
      "id": "zone-1",
      "name": "Default Shipping Zone",
      "members": [
        { "id": "country-1", "code": "US", "name": "United States" },
        { "id": "country-2", "code": "CA", "name": "Canada" }
      ]
    }
  }
}
```

### POST /api/stripe/payment-intent

创建 Stripe 支付意向（Mock）。

**响应示例：**
```json
{
  "createStripePaymentIntent": "pi_mock_xxx_secret_yyy"
}
```

---

## 数据结构

### Asset
```typescript
interface Asset {
  id: string;
  preview: string;
}
```

### Collection
```typescript
interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  featuredAsset: Asset | null;
  children?: Collection[];
}
```

### Product
```typescript
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  featuredAsset: Asset | null;
  assets: Asset[];
  variants: ProductVariant[];
  collections: ProductCollection[];
}
```

### ProductVariant
```typescript
interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  stockLevel: string; // "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK"
  currencyCode: string;
  price: number;        // 价格（分）
  priceWithTax: number; // 含税价格（分）
  options: ProductOption[];
  featuredAsset: Asset | null;
  assets: Asset[];
}
```

### Order
```typescript
interface Order {
  id: string;
  code: string;
  state: string;
  couponCodes: string[];
  totalQuantity: number;
  subTotal: number;
  shippingWithTax: number;
  totalWithTax: number;
  currencyCode: string;
  orderPlacedAt?: string;
  customer?: OrderCustomer;
  shippingAddress?: OrderAddress;
  billingAddress?: OrderAddress;
  discounts: Discount[];
  lines: OrderLine[];
  payments: { method: string }[];
  shippingLines: { shippingMethod: { name: string } }[];
  taxSummary: { description: string; taxTotal: number }[];
}
```

### Customer
```typescript
interface Customer {
  id: string;
  title?: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber?: string;
  addresses: Address[];
  user?: {
    id: string;
    identifier: string;
  };
}
```

---

## 错误响应

所有接口在出错时返回包含 `__typename: "ErrorResult"` 的响应：

```json
{
  "login": {
    "__typename": "ErrorResult",
    "errorCode": "INVALID_CREDENTIALS_ERROR",
    "message": "Invalid email or password"
  }
}
```

常见错误码：
- `INVALID_CREDENTIALS_ERROR` - 登录凭证无效
- `EMAIL_ADDRESS_CONFLICT_ERROR` - 邮箱已被注册
- `COUPON_CODE_INVALID_ERROR` - 优惠码无效
- `COUPON_CODE_ALREADY_APPLIED_ERROR` - 优惠码已使用
- `ORDER_LINE_NOT_FOUND` - 订单行不存在
- `ORDER_STATE_TRANSITION_ERROR` - 订单状态转换失败

---

## Mock 数据文件

Mock 数据存储在 `server/mocks/` 目录：

| 文件 | 说明 |
|-----|------|
| `index.ts` | 导出入口 |
| `collections.ts` | 集合数据（3 个顶级分类，7 个子分类） |
| `products.ts` | 商品数据（6 个商品，多个变体） |
| `orders.ts` | 订单逻辑（内存存储） |
| `customers.ts` | 客户数据和认证逻辑 |
| `config.ts` | 配送/支付方式和国家配置 |
