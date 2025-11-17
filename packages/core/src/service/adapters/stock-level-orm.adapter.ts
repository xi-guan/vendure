/**
 * @description
 * ORM-agnostic adapter interface for StockLevel entity operations.
 * This abstraction allows switching between TypeORM and Prisma implementations.
 *
 * @since 3.6.0
 */

import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { StockLevel } from '../../entity/stock-level/stock-level.entity';

export interface StockLevelFilterInput {
    productVariantId?: string;
    stockLocationId?: string;
}

export interface StockLevelListOptions {
    skip?: number;
    take?: number;
    filter?: StockLevelFilterInput;
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreateStockLevelInput {
    productVariantId: string;
    stockLocationId: string;
    stockOnHand?: number;
    stockAllocated?: number;
}

export interface UpdateStockLevelInput {
    stockOnHand?: number;
    stockAllocated?: number;
}

/**
 * ORM-agnostic StockLevel adapter interface
 */
export interface IStockLevelOrmAdapter {
    /**
     * Find a single stock level by ID
     */
    findOne(id: ID, includeRelations?: boolean): Promise<StockLevel | undefined>;

    /**
     * Find stock level by variant and location
     */
    findByVariantAndLocation(
        productVariantId: ID,
        stockLocationId: ID,
    ): Promise<StockLevel | undefined>;

    /**
     * Find all stock levels with pagination and filtering
     */
    findAll(options?: StockLevelListOptions): Promise<PaginatedList<StockLevel>>;

    /**
     * Find stock levels by product variant ID
     */
    findByVariant(productVariantId: ID): Promise<StockLevel[]>;

    /**
     * Find stock levels by stock location ID
     */
    findByLocation(stockLocationId: ID): Promise<StockLevel[]>;

    /**
     * Create a new stock level
     */
    create(data: CreateStockLevelInput): Promise<StockLevel>;

    /**
     * Update an existing stock level
     */
    update(id: ID, data: UpdateStockLevelInput): Promise<StockLevel>;

    /**
     * Delete a stock level
     */
    delete(id: ID): Promise<void>;

    /**
     * Adjust stock on hand by a delta amount
     */
    adjustStockOnHand(id: ID, delta: number): Promise<StockLevel>;

    /**
     * Adjust stock allocated by a delta amount
     */
    adjustStockAllocated(id: ID, delta: number): Promise<StockLevel>;

    /**
     * Get available stock (stockOnHand - stockAllocated)
     */
    getAvailableStock(id: ID): Promise<number>;
}
