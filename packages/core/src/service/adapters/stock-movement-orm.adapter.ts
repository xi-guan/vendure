/**
 * @description
 * Adapter layer for StockMovement ORM operations.
 *
 * @since 3.6.0
 */

import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { StockMovement } from '../../entity/stock-movement/stock-movement.entity';

export interface StockMovementListOptions {
    skip?: number;
    take?: number;
    filter?: {
        productVariantId?: ID;
        stockLocationId?: ID;
        type?: string;
    };
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreateStockMovementData {
    productVariantId: ID;
    stockLocationId: ID;
    quantity: number;
    type: string;
    customFields?: any;
}

/**
 * ORM-agnostic interface for StockMovement operations
 */
export interface IStockMovementOrmAdapter {
    findOne(id: ID): Promise<StockMovement | undefined>;
    findByProductVariant(
        productVariantId: ID,
        options?: StockMovementListOptions,
    ): Promise<PaginatedList<StockMovement>>;
    findByStockLocation(
        stockLocationId: ID,
        options?: StockMovementListOptions,
    ): Promise<PaginatedList<StockMovement>>;
    findAll(options: StockMovementListOptions): Promise<PaginatedList<StockMovement>>;
    create(data: CreateStockMovementData): Promise<StockMovement>;
    getStockLevelForVariant(productVariantId: ID, stockLocationId?: ID): Promise<number>;
    getAverageStockMovementRate(productVariantId: ID, days: number): Promise<number>;
}
