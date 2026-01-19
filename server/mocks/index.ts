// Mock data module - exports all mock data and helpers

// Collections
export {
  mockCollections,
  getCollectionBySlug,
  getMenuCollections,
  type Collection,
  type Asset,
} from "./collections";

// Products
export {
  mockProducts,
  getProductBySlug,
  getProductById,
  productToSearchResult,
  searchProducts,
  getProducts,
  getVariantStock,
  type Product,
  type ProductVariant,
  type ProductOption,
  type ProductCollection,
  type SearchResultItem,
} from "./products";

// Customers
export {
  loginUser,
  logoutUser,
  getActiveCustomer,
  registerCustomer,
  verifyCustomerAccount,
  requestPasswordReset,
  resetPassword,
  getCustomerAddresses,
  type Customer,
  type Address,
  type CurrentUser,
} from "./customers";

// Orders
export {
  getActiveOrder,
  getOrderByCode,
  getOrderHistory,
  addItemToOrder,
  removeItemFromOrder,
  adjustOrderLine,
  applyCouponCode,
  removeCouponCode,
  setCustomerForOrder,
  setOrderShippingAddress,
  setShippingMethod,
  transitionToState,
  addPaymentToOrder,
  setOrderCustomFields,
  type Order,
  type OrderLine,
  type OrderAddress,
  type OrderCustomer,
  type Discount,
} from "./orders";

// Config
export {
  mockShippingMethods,
  mockPaymentMethods,
  mockCountries,
  mockChannel,
  getEligibleShippingMethods,
  getEligiblePaymentMethods,
  getAllPaymentMethods,
  getChannelCountries,
  getActiveChannel,
  createStripePaymentIntent,
  type ShippingMethod,
  type PaymentMethod,
  type Country,
  type ShippingZone,
  type Channel,
} from "./config";
