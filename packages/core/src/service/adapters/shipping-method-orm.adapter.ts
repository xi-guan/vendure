/**
 * @description
 * ORM-agnostic adapter interface for ShippingMethod entity operations.
 * This abstraction allows switching between TypeORM and Prisma implementations.
 *
 * @since 3.6.0
 */

import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { ShippingMethod } from '../../entity/shipping-method/shipping-method.entity';

export interface ShippingMethodFilterInput {
    code?: string;
    name?: string;
}

export interface ShippingMethodListOptions {
    skip?: number;
    take?: number;
    filter?: ShippingMethodFilterInput;
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreateShippingMethodInput {
    code: string;
    name: string;
    description?: string;
    checker: Record<string, any>;
    calculator: Record<string, any>;
    fulfillmentHandlerCode: string;
    customFields?: Record<string, any>;
}

export interface UpdateShippingMethodInput {
    code?: string;
    name?: string;
    description?: string;
    checker?: Record<string, any>;
    calculator?: Record<string, any>;
    fulfillmentHandlerCode?: string;
    customFields?: Record<string, any>;
}

export interface ShippingMethodTranslationInput {
    languageCode: string;
    name: string;
    description?: string;
}

/**
 * ORM-agnostic ShippingMethod adapter interface
 */
export interface IShippingMethodOrmAdapter {
    /**
     * Find a single shipping method by ID
     */
    findOne(id: ID, includeRelations?: boolean): Promise<ShippingMethod | undefined>;

    /**
     * Find a shipping method by code
     */
    findByCode(code: string): Promise<ShippingMethod | undefined>;

    /**
     * Find all shipping methods with pagination and filtering
     */
    findAll(options?: ShippingMethodListOptions): Promise<PaginatedList<ShippingMethod>>;

    /**
     * Create a new shipping method
     */
    create(data: CreateShippingMethodInput): Promise<ShippingMethod>;

    /**
     * Update an existing shipping method
     */
    update(id: ID, data: UpdateShippingMethodInput): Promise<ShippingMethod>;

    /**
     * Soft delete a shipping method
     */
    softDelete(id: ID): Promise<void>;

    /**
     * Restore a soft-deleted shipping method
     */
    restore(id: ID): Promise<ShippingMethod>;

    /**
     * Add or update a translation for a shipping method
     */
    upsertTranslation(shippingMethodId: ID, translation: ShippingMethodTranslationInput): Promise<void>;

    /**
     * Add shipping method to a channel
     */
    addToChannel(shippingMethodId: ID, channelId: ID): Promise<void>;

    /**
     * Remove shipping method from a channel
     */
    removeFromChannel(shippingMethodId: ID, channelId: ID): Promise<void>;
}
