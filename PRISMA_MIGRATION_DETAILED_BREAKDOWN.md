# Detailed Domain Breakdown

## Domain: USER & AUTHENTICATION (4 Entities)

### 1. User
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Core Authentication Entity
- **Priority**: CRITICAL (blocks all auth operations)
- **Schema Location**: Lines 30-52 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt, deletedAt
  - identifier (unique), verified, lastLogin
  - Relations: customer, administrator, authenticationMethods, roles, sessions
- **Dependencies**: None
- **Used By**: Everything (authentication system)
- **Estimated LOC**: 600-800 (repository + adapter)
- **Est. Time**: 1 week (higher complexity)

### 2. Role  
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Permission Management
- **Priority**: CRITICAL (blocks admin operations)
- **Schema Location**: Lines 54-70 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - code (unique), description, permissions (string array)
  - Relations: channels, users
- **Dependencies**: None
- **Used By**: User authentication, Channel access control
- **Estimated LOC**: 400-500
- **Est. Time**: 4-5 days

### 3. Administrator
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Admin User Profile
- **Priority**: CRITICAL (needed for admin UI)
- **Schema Location**: Lines 84-104 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt, deletedAt
  - firstName, lastName, emailAddress
  - Relations: user, historyEntries
- **Dependencies**: User (not yet implemented)
- **Used By**: Admin operations, History tracking
- **Estimated LOC**: 400-500
- **Est. Time**: 3-4 days (after User)

### 4. AuthenticationMethod
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Auth Strategy Implementation
- **Priority**: HIGH (needed for login)
- **Schema Location**: Lines 106-134 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - type (discriminator: 'native' or 'external')
  - Native: identifier, passwordHash, verificationToken, etc.
  - External: strategy, externalIdentifier, metadata
- **Dependencies**: User (not yet implemented)
- **Used By**: User login, External auth providers
- **Estimated LOC**: 500-700
- **Est. Time**: 4-5 days (after User)

---

## Domain: CHANNEL & REGION (5 Entities)

### 1. Channel
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Multi-channel Configuration
- **Priority**: CRITICAL (multi-channel support)
- **Schema Location**: Lines 140-177 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - code (unique), token (unique)
  - defaultLanguageCode, availableLanguageCodes (array)
  - defaultCurrencyCode, availableCurrencyCodes (array)
  - trackInventory, outOfStockThreshold
  - Relations: 11 different entities
- **Dependencies**: Role, Seller, Promotion, ShippingMethod (all missing)
- **Used By**: Orders, Products, Promotions, Shipping, Collections, Facets
- **Estimated LOC**: 800-1000 (complex relations)
- **Est. Time**: 1 week

### 2. Seller
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Marketplace Seller
- **Priority**: HIGH (multi-seller support)
- **Schema Location**: Lines 203-216 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - name (unique)
  - Relations: channels (ChannelSeller join)
- **Dependencies**: None
- **Used By**: Channel (for marketplace)
- **Estimated LOC**: 300-400
- **Est. Time**: 2-3 days

### 3. Zone
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Geographic/Tax Zone
- **Priority**: HIGH (tax/shipping zones)
- **Schema Location**: Lines 222-236 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - name (unique)
  - Relations: members, taxRates
- **Dependencies**: None (though TaxRate needs it)
- **Used By**: TaxRate, Regional configuration
- **Estimated LOC**: 300-400
- **Est. Time**: 2-3 days

### 4. Region
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Country/Province Hierarchy
- **Priority**: MEDIUM (regional organization)
- **Schema Location**: Lines 256-280 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - code (unique), type ('country' or 'province'), name, enabled
  - Parent-child hierarchy (self-referential)
  - Relations: translations
- **Dependencies**: None
- **Used By**: Regional filtering, Address validation
- **Estimated LOC**: 400-500
- **Est. Time**: 3-4 days

### 5. Country
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Country Master Data
- **Priority**: MEDIUM (address validation)
- **Schema Location**: Lines 298-315 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - code (unique), name, enabled
  - Relations: addresses, translations
- **Dependencies**: None
- **Used By**: Address, Shipping zones
- **Estimated LOC**: 350-450
- **Est. Time**: 2-3 days

---

## Domain: CUSTOMER (3 Entities)

### 1. Customer ✅ COMPLETED
- **Status**: ✅ HAS BOTH REPOSITORY AND ADAPTER
- **Repository**: customer-prisma.repository.ts (9.2 KB)
- **Adapter**: customer-prisma.adapter.ts (12.6 KB)
- **Implementation Phase**: 2.3 (Pilot Migration)

### 2. Address ✅ HAS REPOSITORY
- **Status**: 🔄 PARTIAL (Repository exists, needs Adapter)
- **Repository**: address-prisma.repository.ts (9.2 KB)
- **Adapter**: ❌ MISSING
- **Notes**: Should be straightforward adapter (similar pattern to Customer)
- **Est. Time**: 1-2 days

### 3. CustomerGroup
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Customer Segmentation
- **Priority**: MEDIUM (customer grouping/pricing)
- **Schema Location**: Lines 406-420 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - name (unique)
  - Relations: customers (via CustomerGroupMembership), taxRates
- **Dependencies**: None
- **Used By**: Customer segmentation, Tax rate targeting
- **Estimated LOC**: 350-450
- **Est. Time**: 2-3 days

---

## Domain: ORDER (10 Entities)

### 1. Order ✅ COMPLETED
- **Status**: ✅ HAS BOTH REPOSITORY AND ADAPTER
- **Repository**: order-prisma.repository.ts (19.4 KB)
- **Adapter**: order-prisma.adapter.ts (10.1 KB)
- **Implementation Phase**: 2.4

### 2. OrderLine ⭐ CRITICAL BLOCKER
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Order Item
- **Priority**: CRITICAL (core order functionality)
- **Schema Location**: Lines 567-617 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - orderId, productVariantId ← KEY: ProductVariant missing
  - quantity, unitPrice, linePrice, linePriceWithTax
  - discounts, taxLines, adjustments (JSON)
  - Relations: order, productVariant, taxCategory, featuredAsset, shippingLine, sellerChannel
- **Dependencies**: 
  - Order ✅
  - ProductVariant ❌ BLOCKER
  - TaxCategory ❌
  - Asset ❌
- **Used By**: Order, Inventory, Payment
- **Estimated LOC**: 600-800
- **Est. Time**: 1 week (after ProductVariant)

### 3. Payment ⭐ CRITICAL
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Order Payment
- **Priority**: CRITICAL (financial)
- **Schema Location**: Lines 644-667 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - orderId, method, amount, state
  - errorMessage, transactionId, metadata
  - Relations: order, refunds, modification
- **Dependencies**: Order ✅
- **Used By**: Order completion, Refunds, Financial reporting
- **Estimated LOC**: 500-700
- **Est. Time**: 4-5 days (independent of OrderLine)

### 4. Refund
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Payment Refund
- **Priority**: HIGH (financial)
- **Schema Location**: Lines 670-692 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - paymentId, items, shipping, adjustment, total
  - method, state, reason, transactionId, metadata
- **Dependencies**: Payment ❌
- **Used By**: Payment processing
- **Estimated LOC**: 400-500
- **Est. Time**: 3-4 days (after Payment)

### 5. Fulfillment
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Order Fulfillment
- **Priority**: HIGH (shipping)
- **Schema Location**: Lines 695-710 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - state, method, trackingCode
  - Relations: orders (via OrderFulfillment join)
- **Dependencies**: None
- **Used By**: Order shipment tracking
- **Estimated LOC**: 350-450
- **Est. Time**: 2-3 days

### 6. ShippingLine
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Order Shipping
- **Priority**: HIGH (shipping calculation)
- **Schema Location**: Lines 823-852 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - orderId, shippingMethodId
  - listPrice, listPriceIncludesTax, price, priceWithTax
  - discounts, taxLines (JSON)
  - Relations: order, shippingMethod, orderLines
- **Dependencies**: 
  - Order ✅
  - ShippingMethod ❌
- **Used By**: Order shipping costs
- **Estimated LOC**: 500-650
- **Est. Time**: 4 days

### 7. ShippingMethod
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Shipping Option
- **Priority**: HIGH (shipping configuration)
- **Schema Location**: Lines 855-878 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt, deletedAt
  - code (unique), name, description
  - checker, calculator (JSON configs)
  - fulfillmentHandlerCode
  - Relations: translations, channels, shippingLines
- **Dependencies**: None
- **Used By**: ShippingLine, Channel
- **Estimated LOC**: 450-600
- **Est. Time**: 3-4 days

### 8. Surcharge
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Order Extra Charge
- **Priority**: MEDIUM (additional charges)
- **Schema Location**: Lines 620-641 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - orderId, description, sku
  - listPrice, listPriceIncludesTax, price, priceWithTax
  - taxRate, taxLines (JSON)
- **Dependencies**: Order ✅
- **Used By**: Order management
- **Estimated LOC**: 350-450
- **Est. Time**: 2-3 days

### 9. Promotion
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Marketing Promotion
- **Priority**: HIGH (discounts/marketing)
- **Schema Location**: Lines 725-754 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt, deletedAt
  - name, enabled, couponCode
  - perCustomerUsageLimit, usageLimit
  - startsAt, endsAt
  - conditions, actions (JSON)
  - Relations: orders, translations, channels
- **Dependencies**: None (Channel can follow)
- **Used By**: Order discounts, Channel configuration
- **Estimated LOC**: 600-800
- **Est. Time**: 1 week

### 10. OrderModification
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Order Change
- **Priority**: MEDIUM (order adjustments)
- **Schema Location**: Lines 797-820 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - orderId, note, priceChange, isSettled
  - Relations: order, payment, refund
  - lines, surcharges (JSON)
- **Dependencies**: Order ✅
- **Used By**: Order management
- **Estimated LOC**: 400-500
- **Est. Time**: 3-4 days

---

## Domain: PRODUCT (8 Entities)

### 1. Product ✅ COMPLETED
- **Status**: ✅ HAS BOTH REPOSITORY AND ADAPTER
- **Repository**: product-prisma.repository.ts (13.8 KB)
- **Adapter**: product-prisma.adapter.ts (6.7 KB)
- **Implementation Phase**: 2.4

### 2. Collection ✅ COMPLETED
- **Status**: ✅ HAS BOTH REPOSITORY AND ADAPTER
- **Repository**: collection-prisma.repository.ts (13.2 KB)
- **Adapter**: collection-prisma.adapter.ts (7.9 KB)

### 3. ProductVariant ⭐ CRITICAL BLOCKER
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Product SKU/Variant
- **Priority**: CRITICAL (most referenced entity)
- **Schema Location**: Lines 972-1017 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt, deletedAt
  - enabled, sku (unique)
  - productId, taxCategoryId, featuredAssetId
  - Relations: product, taxCategory, featuredAsset, assets, translations, prices, options, facetValues, channels, stockLevels, stockMovements, orderLines, collections
- **Dependencies**:
  - Product ✅
  - TaxCategory ❌
  - Asset ❌
- **Blocks**: OrderLine, StockLevel, pricing
- **Estimated LOC**: 1000-1200 (most complex)
- **Est. Time**: 1.5 weeks

### 4. ProductVariantPrice
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Variant Pricing
- **Priority**: HIGH (pricing tiers)
- **Schema Location**: Lines 1036-1054 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - price, currencyCode
  - productVariantId, channelId
- **Dependencies**: 
  - ProductVariant ❌
  - Channel ❌
- **Used By**: Pricing calculation
- **Estimated LOC**: 350-450
- **Est. Time**: 2-3 days (after ProductVariant, Channel)

### 5. ProductOption
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Variant Option Value
- **Priority**: MEDIUM (variant attributes)
- **Schema Location**: Lines 1121-1141 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt, deletedAt
  - code
  - groupId, relations: group, translations, variants
- **Dependencies**: ProductOptionGroup (also missing)
- **Used By**: ProductVariant attributes
- **Estimated LOC**: 350-450
- **Est. Time**: 2-3 days

### 6. ProductOptionGroup
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Variant Option Group
- **Priority**: MEDIUM (variant attributes)
- **Schema Location**: Lines 1159-1179 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt, deletedAt
  - code, productId
  - Relations: product, options, translations
- **Dependencies**: Product ✅
- **Used By**: ProductOption grouping
- **Estimated LOC**: 350-450
- **Est. Time**: 2-3 days

### 7. Asset
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Media/Asset
- **Priority**: HIGH (product media)
- **Schema Location**: Lines 1212-1245 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - name, type, mimeType, width, height, fileSize
  - source, preview, focalPoint (JSON)
  - Relations: tags, products, variants, collections, orderLines
- **Dependencies**: None
- **Used By**: Product/Variant/Collection media
- **Estimated LOC**: 600-800
- **Est. Time**: 1 week

### 8. AssetTag
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Asset Organization
- **Priority**: LOW (asset tagging)
- **Schema Location**: Lines 1248-1259 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - value (unique)
  - Relations: assets (via AssetTagAsset join)
- **Dependencies**: None
- **Used By**: Asset organization
- **Estimated LOC**: 300-400
- **Est. Time**: 1-2 days

---

## Domain: FACET (2 Entities)

### 1. Facet ✅ COMPLETED
- **Status**: ✅ HAS BOTH REPOSITORY AND ADAPTER
- **Repository**: facet-prisma.repository.ts (9.8 KB)
- **Adapter**: facet-prisma.adapter.ts (7.2 KB)

### 2. FacetValue
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Facet Value/Filter Option
- **Priority**: MEDIUM (product filtering)
- **Schema Location**: Lines 1311-1332 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - code
  - facetId
  - Relations: facet, translations, products, variants, channels
- **Dependencies**: Facet ✅
- **Used By**: Product filtering/search
- **Estimated LOC**: 450-600
- **Est. Time**: 3-4 days

---

## Domain: TAX (2 Entities)

### 1. TaxRate ✅ COMPLETED
- **Status**: ✅ HAS BOTH REPOSITORY AND ADAPTER
- **Repository**: tax-rate-prisma.repository.ts (7.1 KB)
- **Adapter**: tax-rate-prisma.adapter.ts (4.5 KB)

### 2. TaxCategory
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Product Tax Class
- **Priority**: HIGH (tax calculation)
- **Schema Location**: Lines 1401-1417 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - name (unique), isDefault
  - Relations: productVariants, orderLines, taxRates
- **Dependencies**: None
- **Used By**: ProductVariant, OrderLine, TaxRate
- **Estimated LOC**: 350-450
- **Est. Time**: 2-3 days

---

## Domain: INVENTORY & STOCK (3 Entities)

### 1. StockMovement ✅ HAS REPOSITORY (NO ADAPTER)
- **Status**: 🔄 PARTIAL (Repository exists, needs Adapter)
- **Repository**: stock-movement-prisma.repository.ts (11.0 KB)
- **Adapter**: ❌ MISSING
- **Est. Time**: 2-3 days

### 2. StockLevel
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Inventory Level
- **Priority**: HIGH (inventory management)
- **Schema Location**: Lines 1550-1568 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - stockOnHand, stockAllocated
  - productVariantId, stockLocationId
- **Dependencies**: 
  - ProductVariant ❌
  - StockLocation ❌
- **Used By**: Inventory queries
- **Estimated LOC**: 450-550
- **Est. Time**: 3 days (after ProductVariant)

### 3. StockLocation
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Warehouse/Location
- **Priority**: HIGH (multi-warehouse)
- **Schema Location**: Lines 1570-1585 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - name (unique), description
  - Relations: stockLevels, stockMovements
- **Dependencies**: None
- **Used By**: StockLevel, StockMovement
- **Estimated LOC**: 350-450
- **Est. Time**: 2-3 days

---

## Domain: HISTORY & GLOBAL (4 Entities)

### 1. GlobalSettings ✅ HAS REPOSITORY (NO ADAPTER)
- **Status**: 🔄 PARTIAL (Repository exists, needs Adapter)
- **Repository**: global-settings-prisma.repository.ts (5.7 KB)
- **Adapter**: ❌ MISSING
- **Est. Time**: 1-2 days

### 2. Session ✅ HAS REPOSITORY (NO ADAPTER)
- **Status**: 🔄 PARTIAL (Repository exists, needs Adapter)
- **Repository**: session-prisma.repository.ts (10.8 KB)
- **Adapter**: ❌ MISSING
- **Est. Time**: 2-3 days

### 3. HistoryEntry
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Change Audit Trail
- **Priority**: MEDIUM (audit logging)
- **Schema Location**: Lines 450-468 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - type (discriminator), isPublic
  - data (JSON), administratorId
  - Relations: administrator, customerHistories, orderHistories
- **Dependencies**: Administrator ❌
- **Used By**: Change tracking
- **Estimated LOC**: 450-600
- **Est. Time**: 3-4 days (after Administrator)

### 4. AnonymousSession
- **Status**: ❌ MISSING (no repository, no adapter)
- **Type**: Guest Session
- **Priority**: MEDIUM (guest shopping)
- **Schema Location**: Lines 1668-1682 in schema.prisma
- **Key Fields**:
  - id, createdAt, updatedAt
  - token (unique), expires
  - data (JSON)
- **Dependencies**: None
- **Used By**: Guest order tracking
- **Estimated LOC**: 300-400
- **Est. Time**: 1-2 days

---

## Summary Statistics by Domain

| Domain | Total | Completed | Partial | Missing | % Complete |
|--------|-------|-----------|---------|---------|------------|
| User & Auth | 4 | 0 | 0 | 4 | 0% |
| Channel & Region | 5 | 0 | 0 | 5 | 0% |
| Customer | 3 | 1 | 1 | 1 | 67% |
| Order | 10 | 1 | 0 | 9 | 10% |
| Product | 8 | 2 | 0 | 6 | 25% |
| Facet | 2 | 1 | 0 | 1 | 50% |
| Tax | 2 | 1 | 0 | 1 | 50% |
| Inventory | 3 | 0 | 1 | 2 | 33% |
| History & Global | 4 | 0 | 2 | 2 | 50% |
| **TOTAL** | **40** | **7** | **3** | **30** | **25%** |

