# ORM Adapter Pattern Integration Guide

## Overview

This guide explains how to use the ORM Adapter pattern in Vendure services. The adapter pattern allows seamless switching between TypeORM and Prisma implementations without changing service code.

## Current Status

✅ **TypeORM Adapters**: Fully implemented (35 entities)
✅ **Prisma Adapters**: Fully implemented (35 entities)
✅ **OrmAdapterFactory**: Configured to support both ORMs
⚠️ **Default Mode**: TypeORM (Prisma Client not yet generated)

## How It Works

### Architecture

```
Service Layer
    ↓
OrmAdapterFactory (selects ORM based on config)
    ↓
┌────────────┬─────────────┐
│ TypeORM    │   Prisma    │
│ Adapter    │   Adapter   │
└────────────┴─────────────┘
    ↓              ↓
Database      Database
```

### Configuration

The ORM is selected via environment variables:

```bash
# Use TypeORM (default)
VENDURE_ENABLE_PRISMA=false
VENDURE_ORM_MODE=typeorm

# Use Prisma (when Prisma Client is available)
VENDURE_ENABLE_PRISMA=true
VENDURE_ORM_MODE=prisma
```

## Service Integration Example

### Before (Direct TypeORM Usage)

```typescript
import { Injectable } from '@nestjs/common';
import { TransactionalConnection } from '../../connection/transactional-connection';
import { Customer } from '../../entity/customer/customer.entity';

@Injectable()
export class CustomerService {
    constructor(private connection: TransactionalConnection) {}

    async findOne(id: ID): Promise<Customer | undefined> {
        const repository = this.connection.getRepository(Customer);
        return repository.findOne({ where: { id } as any });
    }

    async create(data: CreateCustomerInput): Promise<Customer> {
        const repository = this.connection.getRepository(Customer);
        const customer = repository.create(data);
        await repository.save(customer);
        return customer;
    }
}
```

### After (ORM Adapter Pattern)

```typescript
import { Injectable } from '@nestjs/common';
import { OrmAdapterFactory } from '../adapters/orm-adapter.factory';
import { Customer } from '../../entity/customer/customer.entity';

@Injectable()
export class CustomerService {
    constructor(private ormAdapterFactory: OrmAdapterFactory) {}

    async findOne(id: ID): Promise<Customer | undefined> {
        const adapter = this.ormAdapterFactory.getCustomerAdapter();
        return adapter.findOne(id);
    }

    async create(data: CreateCustomerInput): Promise<Customer> {
        const adapter = this.ormAdapterFactory.getCustomerAdapter();
        return adapter.create({
            firstName: data.firstName,
            lastName: data.lastName,
            emailAddress: data.emailAddress,
            title: data.title,
            phoneNumber: data.phoneNumber,
        });
    }
}
```

## Available Adapters

All 35 core entities have adapters:

### Core Entities
- `getCustomerAdapter()` - Customer operations
- `getAddressAdapter()` - Address operations
- `getUserAdapter()` - User operations
- `getAdministratorAdapter()` - Administrator operations
- `getRoleAdapter()` - Role operations

### Product Entities
- `getProductAdapter()` - Product operations
- `getProductVariantAdapter()` - ProductVariant operations
- `getProductOptionAdapter()` - ProductOption operations
- `getProductOptionGroupAdapter()` - ProductOptionGroup operations
- `getCollectionAdapter()` - Collection operations
- `getAssetAdapter()` - Asset operations
- `getAssetTagAdapter()` - AssetTag operations

### Order Entities
- `getOrderAdapter()` - Order operations
- `getOrderLineAdapter()` - OrderLine operations
- `getPaymentAdapter()` - Payment operations
- `getRefundAdapter()` - Refund operations
- `getFulfillmentAdapter()` - Fulfillment operations
- `getShippingLineAdapter()` - ShippingLine operations
- `getShippingMethodAdapter()` - ShippingMethod operations
- `getPromotionAdapter()` - Promotion operations
- `getSurchargeAdapter()` - Surcharge operations

### Catalog Entities
- `getFacetAdapter()` - Facet operations
- `getFacetValueAdapter()` - FacetValue operations

### Tax & Stock Entities
- `getTaxRateAdapter()` - TaxRate operations
- `getTaxCategoryAdapter()` - TaxCategory operations
- `getStockLevelAdapter()` - StockLevel operations
- `getStockLocationAdapter()` - StockLocation operations
- `getStockMovementAdapter()` - StockMovement operations

### Channel & Region Entities
- `getChannelAdapter()` - Channel operations
- `getZoneAdapter()` - Zone operations
- `getRegionAdapter()` - Region operations
- `getCountryAdapter()` - Country operations

### Other Entities
- `getSessionAdapter()` - Session operations
- `getCustomerGroupAdapter()` - CustomerGroup operations
- `getGlobalSettingsAdapter()` - GlobalSettings operations

## Adapter Interface Methods

Most adapters provide these standard methods:

```typescript
interface IEntityOrmAdapter<T> {
    // Basic CRUD
    findOne(id: ID, includeRelations?: string[]): Promise<T | undefined>;
    findAll(options?: ListOptions): Promise<PaginatedList<T>>;
    create(data: CreateData): Promise<T>;
    update(id: ID, data: UpdateData): Promise<T>;
    delete(id: ID): Promise<void>;

    // Utilities
    exists(id: ID): Promise<boolean>;
    count(filter?: any): Promise<number>;

    // Entity-specific methods may also be available
}
```

## Migration Steps for Services

### Step 1: Update Constructor

Replace `TransactionalConnection` injection with `OrmAdapterFactory`:

```typescript
// Before
constructor(private connection: TransactionalConnection) {}

// After
constructor(private ormAdapterFactory: OrmAdapterFactory) {}
```

### Step 2: Replace Repository Calls

Replace direct repository calls with adapter methods:

```typescript
// Before
const repository = this.connection.getRepository(Customer);
const customer = await repository.findOne({ where: { id } });

// After
const adapter = this.ormAdapterFactory.getCustomerAdapter();
const customer = await adapter.findOne(id);
```

### Step 3: Update Complex Queries

For complex queries, use adapter methods with options:

```typescript
// Before
const queryBuilder = repository.createQueryBuilder('customer')
    .leftJoinAndSelect('customer.addresses', 'addresses')
    .where('customer.email LIKE :term', { term: `%${searchTerm}%` })
    .skip(skip)
    .take(take);

// After
const adapter = this.ormAdapterFactory.getCustomerAdapter();
const results = await adapter.search(searchTerm, { skip, take });
```

## Testing

### Unit Tests

Mock the OrmAdapterFactory:

```typescript
const mockCustomerAdapter = {
    findOne: vi.fn(),
    create: vi.fn(),
    // ... other methods
};

const mockFactory = {
    getCustomerAdapter: () => mockCustomerAdapter,
};

// In test
const service = new CustomerService(mockFactory as any);
```

### Integration Tests

Test both ORMs:

```typescript
describe('CustomerService (TypeORM)', () => {
    beforeAll(() => {
        process.env.VENDURE_ENABLE_PRISMA = 'false';
    });
    // ... tests
});

describe('CustomerService (Prisma)', () => {
    beforeAll(() => {
        process.env.VENDURE_ENABLE_PRISMA = 'true';
    });
    // ... tests (when Prisma Client is available)
});
```

## Runtime ORM Detection

Check which ORM is being used:

```typescript
const ormMode = this.ormAdapterFactory.getOrmMode();
console.log(`Using ORM: ${ormMode}`); // 'typeorm' or 'prisma'

if (this.ormAdapterFactory.isPrismaEnabled()) {
    // Prisma-specific logic
}
```

## Benefits

✅ **Zero Downtime Migration**: Switch ORMs without code changes
✅ **Testability**: Easy to mock and test
✅ **Flexibility**: Use different ORMs for different environments
✅ **Type Safety**: Full TypeScript support
✅ **Backward Compatibility**: Existing code continues to work

## Current Limitations

⚠️ **Prisma Client Not Generated**: Due to network restrictions, the real Prisma Client is not available yet. A mock client exists for compilation only.

⚠️ **Default is TypeORM**: All database operations currently use TypeORM adapters.

## Next Steps

When Prisma Client becomes available:

1. Generate Prisma Client:
   ```bash
   cd packages/core
   npm run prisma:generate
   ```

2. Enable Prisma:
   ```bash
   export VENDURE_ENABLE_PRISMA=true
   export VENDURE_ORM_MODE=prisma
   ```

3. Test and verify all operations work correctly

4. Gradually roll out to production

## See Also

- `PRISMA_MIGRATION_COMPLETION_REPORT.md` - Full migration status
- `PRISMA_UNBLOCK_GUIDE.md` - Solutions for Prisma Client generation
- `packages/core/src/service/examples/service-integration.example.ts` - Code examples

---

**Last Updated**: 2025-11-19
**Status**: ✅ Ready for integration (using TypeORM)
