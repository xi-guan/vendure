/**
 * @description
 * Adapter layer for OrderLine ORM operations.
 * Provides a unified interface that can be implemented by both TypeORM and Prisma.
 *
 * This allows for gradual migration from TypeORM to Prisma with zero downtime.
 * The service layer depends on this interface, not on a specific ORM implementation.
 *
 * @since 3.6.0
 */

import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { OrderLine } from '../../entity/order-line/order-line.entity';

export interface CreateOrderLineData {
    orderId: ID;
    productVariantId: ID;
    quantity: number;
    linePrice: number;
    linePriceWithTax: number;
    unitPrice: number;
    unitPriceWithTax: number;
    proratedLinePrice: number;
    proratedLinePriceWithTax: number;
    initialLinePrice: number;
    initialLinePriceWithTax: number;
    taxCategoryId?: ID;
    featuredAssetId?: ID;
    shippingLineId?: ID;
    sellerChannelId?: ID;
    adjustments?: any;
    taxLines?: any;
    discounts?: any;
    customFields?: any;
}

export interface UpdateOrderLineData {
    quantity?: number;
    linePrice?: number;
    linePriceWithTax?: number;
    unitPrice?: number;
    unitPriceWithTax?: number;
    proratedLinePrice?: number;
    proratedLinePriceWithTax?: number;
    taxCategoryId?: ID;
    featuredAssetId?: ID;
    shippingLineId?: ID;
    sellerChannelId?: ID;
    adjustments?: any;
    taxLines?: any;
    discounts?: any;
    customFields?: any;
}

export interface OrderLineListOptions {
    skip?: number;
    take?: number;
    filter?: any;
    sort?: any;
}

/**
 * ORM-agnostic interface for OrderLine operations
 */
export interface IOrderLineOrmAdapter {
    /**
     * Find an order line by ID
     */
    findOne(id: ID, includeRelations?: string[]): Promise<OrderLine | undefined>;

    /**
     * Find order lines by order ID
     */
    findByOrderId(orderId: ID): Promise<OrderLine[]>;

    /**
     * Find order lines by product variant ID
     */
    findByProductVariantId(productVariantId: ID): Promise<OrderLine[]>;

    /**
     * Find order lines with pagination
     */
    findAll(options: OrderLineListOptions): Promise<PaginatedList<OrderLine>>;

    /**
     * Create a new order line
     */
    create(data: CreateOrderLineData): Promise<OrderLine>;

    /**
     * Update an order line
     */
    update(id: ID, data: UpdateOrderLineData): Promise<OrderLine>;

    /**
     * Delete an order line
     */
    delete(id: ID): Promise<void>;

    /**
     * Delete order lines by order ID
     */
    deleteByOrderId(orderId: ID): Promise<void>;

    /**
     * Check if order line exists
     */
    exists(id: ID): Promise<boolean>;

    /**
     * Count order lines
     */
    count(filter?: any): Promise<number>;

    /**
     * Update quantity for an order line
     */
    updateQuantity(id: ID, quantity: number): Promise<OrderLine>;

    /**
     * Get order lines by shipping line ID
     */
    findByShippingLineId(shippingLineId: ID): Promise<OrderLine[]>;
}

/**
 * Factory function to get the appropriate ORM adapter
 */
export function getOrderLineOrmAdapter(
    usePrisma: boolean,
    typeormAdapter: IOrderLineOrmAdapter,
    prismaAdapter: IOrderLineOrmAdapter,
): IOrderLineOrmAdapter {
    return usePrisma ? prismaAdapter : typeormAdapter;
}
