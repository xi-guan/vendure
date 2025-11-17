# Entity Dependencies & Relationships

## Critical Path Analysis

### Tier 1: Foundation (Must implement first)
These entities have few dependencies and many things depend on them.

#### ProductVariant ⭐ CRITICAL
**Status**: ❌ MISSING (both Repo & Adapter)
**Blocks**: 
- OrderLine (every order line references a ProductVariant)
- StockLevel (inventory is tracked per variant)
- Collection filtering (collections contain variants)
- ProductVariantPrice (pricing tiers)
- ProductVariantOption (variant options)

**Dependencies**:
- Product ✅ (exists)
- TaxCategory ❌ (missing)

**Key fields**:
```
- id, createdAt, updatedAt, deletedAt
- enabled, sku
- productId (FK to Product) ✅
- taxCategoryId (FK to TaxCategory) ❌
- featuredAssetId (FK to Asset) ❌
- customFields (JSON)
```

---

#### OrderLine ⭐ CRITICAL  
**Status**: ❌ MISSING (both Repo & Adapter)
**Blocks**:
- Order processing (every order must have lines)
- Inventory management (stock movements based on lines)
- Payment settlement (payments tied to lines)

**Dependencies**:
- Order ✅ (exists)
- ProductVariant ❌ (missing) ← BLOCKER
- TaxCategory ❌ (missing)
- Asset ❌ (missing)

**Key fields**:
```
- id, createdAt, updatedAt
- orderId (FK to Order) ✅
- productVariantId (FK to ProductVariant) ❌
- quantity, unitPrice, linePrice
- discounts, taxLines (JSON)
```

---

#### Payment & Refund ⭐ CRITICAL
**Status**: ❌ MISSING (both Repo & Adapter)
**Blocks**:
- Order completion
- Financial reporting
- Refund processing

**Dependencies**:
- Order ✅ (exists)

**Key fields**:
```
Payment:
- orderId (FK to Order) ✅
- method, amount, state
- transactionId, metadata

Refund:
- paymentId (FK to Payment) ❌
- items, shipping, adjustment, total
- method, state, transactionId
```

---

### Tier 2: Core Business (High Priority)
#### User, Role, Administrator ⭐ CRITICAL
**Status**: ❌ MISSING (both Repo & Adapter)
**Blocks**:
- Authentication system
- Admin operations
- Permission checking

**Dependencies**: Minimal internal dependencies
**Impact**: Everything needs authentication

---

#### Channel ⭐ CRITICAL
**Status**: ❌ MISSING (both Repo & Adapter)
**Blocks**:
- Multi-channel operations
- Pricing per channel
- Region/locale management

**Dependencies**:
- Role ❌ (missing)
- Seller ❌ (missing)
- Promotion ❌ (missing)
- ShippingMethod ❌ (missing)

---

### Tier 3: Support Entities (Medium Priority)

#### Asset ⭐ IMPORTANT
**Status**: ❌ MISSING (both Repo & Adapter)
**Used By**:
- Product (featured asset)
- ProductVariant (featured asset)
- ProductAsset (join table)
- ProductVariantAsset (join table)
- Collection (featured asset)
- OrderLine (featured asset)

**Dependencies**: Minimal

---

#### TaxCategory ⭐ IMPORTANT
**Status**: ❌ MISSING (both Repo & Adapter)
**Used By**:
- ProductVariant (taxCategoryId)
- OrderLine (taxCategoryId)
- TaxRate (categoryId)

**Dependencies**:
- Zone (for TaxRate) ❌ (missing)

---

#### StockLevel & StockLocation
**Status**: ❌ MISSING (both Repo & Adapter)
**Blocks**:
- Inventory management
- Multi-warehouse support

**Dependencies**:
- ProductVariant ❌ (missing)
- StockMovement ✅ (repo exists)

---

## Dependency Graph (Simplified)

```
FOUNDATION TIER
├─ Product ✅
├─ Collection ✅
├─ Asset ❌
├─ Customer ✅
├─ Address ✅
└─ Channel ❌
    ├─ Role ❌
    ├─ Seller ❌
    └─ Zone ❌

ORDER PROCESSING
├─ Order ✅
├─ OrderLine ❌ ← CRITICAL BLOCKER
│   ├─ ProductVariant ❌ ← CRITICAL BLOCKER
│   │   ├─ TaxCategory ❌
│   │   └─ Asset ❌
│   └─ TaxCategory ❌
├─ Payment ❌ ← CRITICAL
│   └─ Refund ❌
├─ ShippingLine ❌
│   └─ ShippingMethod ❌
├─ Surcharge ❌
└─ Promotion ❌

INVENTORY
├─ StockMovement ✅ (repo only)
├─ StockLevel ❌
│   ├─ ProductVariant ❌
│   └─ StockLocation ❌
└─ StockLocation ❌

CATALOG
├─ ProductVariant ❌
├─ ProductVariantPrice ❌
├─ ProductOption ❌
├─ ProductOptionGroup ❌
└─ Facet ✅
    ├─ FacetValue ❌
    ├─ ProductFacetValue (join) ❌
    └─ ProductVariantFacetValue (join) ❌

AUTHENTICATION
├─ User ❌
├─ Role ❌
└─ Administrator ❌

TAX & REGIONAL
├─ TaxRate ✅
├─ TaxCategory ❌
├─ Zone ❌
├─ Region ❌
└─ Country ❌

FULFILLMENT
├─ Fulfillment ❌
├─ OrderFulfillment (join) ❌
└─ ShippingMethod ❌
    └─ ShippingMethodChannel (join) ❌

OTHER
├─ GlobalSettings ✅ (repo only)
├─ Session ✅ (repo only)
├─ AnonymousSession ❌
└─ HistoryEntry ❌
```

---

## Implementation Strategy

### Block 1: Order Processing Foundation
**Must implement in this order** (each unblocks the next):
1. ProductVariant + Adapter (most critical)
2. TaxCategory + Adapter
3. Asset + Adapter
4. OrderLine + Adapter
5. Payment + Refund + Adapters

**Why this order**:
- ProductVariant is referenced by OrderLine
- TaxCategory is referenced by ProductVariant
- Asset is featured in ProductVariant
- OrderLine needs all above
- Payment/Refund are Order level

**Estimated effort**: 2-3 weeks

---

### Block 2: Authentication & Multi-Channel
**Can be done in parallel with Block 1**:
1. User + Role + Adapter
2. Administrator + Adapter  
3. Channel + Adapter
4. Region + Country + Zone + Adapters

**Why parallel**:
- Separate concerns
- Can be done by different team
- Needed for admin operations

**Estimated effort**: 2-3 weeks

---

### Block 3: Inventory Management
**Needs Block 1 complete**:
1. StockLevel + Adapter
2. StockLocation + Adapter
3. Adapter for StockMovement (repo exists)

**Dependencies**: ProductVariant from Block 1

**Estimated effort**: 1 week

---

### Block 4: Remaining Entities
**Can be done in any order**:
- Promotion + Adapter
- FacetValue + Adapter
- ProductOption[Group] + Adapters
- Fulfillment + OrderModification + Adapters
- Surcharge + Adapter
- HistoryEntry + Adapter
- AnonymousSession + Adapter

**Estimated effort**: 2-3 weeks total

---

## Quick Reference: What Blocks What

| Entity | Blocks | Blocked By |
|--------|--------|-----------|
| ProductVariant | OrderLine, StockLevel, Collection | TaxCategory, Asset |
| OrderLine | Order ops, Inventory | ProductVariant, TaxCategory |
| Payment/Refund | Order completion | Order |
| Channel | Multi-channel ops | Role, Seller, Zone |
| User/Role | Auth system | - |
| TaxCategory | ProductVariant, OrderLine | Zone (for TaxRate) |
| Asset | Product/Variant display | - |
| StockLevel | Inventory ops | ProductVariant, StockLocation |
| Promotion | Order discounts | Channel |

---

## Migration Checklist by Entity

For each entity, you need:
- [ ] Prisma Repository
- [ ] Prisma Adapter
- [ ] Unit tests (40+ tests minimum)
- [ ] Integration tests
- [ ] Documentation
- [ ] Example usage

Use Customer as the template - it's the most complete implementation.
