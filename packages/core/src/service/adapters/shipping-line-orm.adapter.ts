/**
 * @description
 * ORM-agnostic adapter interface for ShippingLine entity operations.
 * This abstraction allows switching between TypeORM and Prisma implementations.
 *
 * @since 3.6.0
 */

import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { ShippingLine } from '../../entity/shipping-line/shipping-line.entity';

export interface ShippingLineFilterInput {
    orderId?: string;
    shippingMethodId?: string;
}

export interface ShippingLineListOptions {
    skip?: number;
    take?: number;
    filter?: ShippingLineFilterInput;
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreateShippingLineInput {
    orderId: string;
    shippingMethodId: string;
    listPrice: number;
    listPriceIncludesTax: boolean;
    price: number;
    priceWithTax: number;
    discountedPrice: number;
    discountedPriceWithTax: number;
    discounts?: Record<string, any>;
    taxLines?: Record<string, any>;
    customFields?: Record<string, any>;
}

export interface UpdateShippingLineInput {
    shippingMethodId?: string;
    listPrice?: number;
    listPriceIncludesTax?: boolean;
    price?: number;
    priceWithTax?: number;
    discountedPrice?: number;
    discountedPriceWithTax?: number;
    discounts?: Record<string, any>;
    taxLines?: Record<string, any>;
    customFields?: Record<string, any>;
}

/**
 * ORM-agnostic ShippingLine adapter interface
 */
export interface IShippingLineOrmAdapter {
    /**
     * Find a single shipping line by ID
     */
    findOne(id: ID, includeRelations?: boolean): Promise<ShippingLine | undefined>;

    /**
     * Find all shipping lines with pagination and filtering
     */
    findAll(options?: ShippingLineListOptions): Promise<PaginatedList<ShippingLine>>;

    /**
     * Find shipping lines by order ID
     */
    findByOrder(orderId: ID): Promise<ShippingLine[]>;

    /**
     * Find shipping lines by shipping method ID
     */
    findByShippingMethod(shippingMethodId: ID): Promise<ShippingLine[]>;

    /**
     * Create a new shipping line
     */
    create(data: CreateShippingLineInput): Promise<ShippingLine>;

    /**
     * Update an existing shipping line
     */
    update(id: ID, data: UpdateShippingLineInput): Promise<ShippingLine>;

    /**
     * Delete a shipping line
     */
    delete(id: ID): Promise<void>;

    /**
     * Get all order lines for a shipping line
     */
    getOrderLines(shippingLineId: ID): Promise<any[]>;
}
