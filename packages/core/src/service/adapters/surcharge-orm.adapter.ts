/**
 * @description
 * ORM-agnostic adapter interface for Surcharge entity operations.
 * This abstraction allows switching between TypeORM and Prisma implementations.
 *
 * @since 3.6.0
 */

import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { Surcharge } from '../../entity/surcharge/surcharge.entity';

export interface SurchargeFilterInput {
    orderId?: string;
    description?: string;
}

export interface SurchargeListOptions {
    skip?: number;
    take?: number;
    filter?: SurchargeFilterInput;
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreateSurchargeInput {
    orderId: string;
    description: string;
    sku?: string | null;
    listPrice: number;
    listPriceIncludesTax: boolean;
    price: number;
    priceWithTax: number;
    taxRate: number;
    taxLines?: Record<string, any>;
}

export interface UpdateSurchargeInput {
    description?: string;
    sku?: string | null;
    listPrice?: number;
    listPriceIncludesTax?: boolean;
    price?: number;
    priceWithTax?: number;
    taxRate?: number;
    taxLines?: Record<string, any>;
}

/**
 * ORM-agnostic Surcharge adapter interface
 */
export interface ISurchargeOrmAdapter {
    /**
     * Find a single surcharge by ID
     */
    findOne(id: ID, includeRelations?: boolean): Promise<Surcharge | undefined>;

    /**
     * Find all surcharges with pagination and filtering
     */
    findAll(options?: SurchargeListOptions): Promise<PaginatedList<Surcharge>>;

    /**
     * Find surcharges by order ID
     */
    findByOrder(orderId: ID): Promise<Surcharge[]>;

    /**
     * Create a new surcharge
     */
    create(data: CreateSurchargeInput): Promise<Surcharge>;

    /**
     * Update an existing surcharge
     */
    update(id: ID, data: UpdateSurchargeInput): Promise<Surcharge>;

    /**
     * Delete a surcharge
     */
    delete(id: ID): Promise<void>;
}
