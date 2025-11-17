/**
 * @description
 * ORM-agnostic adapter interface for Fulfillment entity operations.
 * This abstraction allows switching between TypeORM and Prisma implementations.
 *
 * @since 3.6.0
 */

import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { Fulfillment } from '../../entity/fulfillment/fulfillment.entity';

export interface FulfillmentFilterInput {
    state?: string;
    method?: string;
    trackingCode?: string;
}

export interface FulfillmentListOptions {
    skip?: number;
    take?: number;
    filter?: FulfillmentFilterInput;
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreateFulfillmentInput {
    state: string;
    method: string;
    trackingCode?: string | null;
    customFields?: Record<string, any>;
}

export interface UpdateFulfillmentInput {
    state?: string;
    method?: string;
    trackingCode?: string | null;
    customFields?: Record<string, any>;
}

/**
 * ORM-agnostic Fulfillment adapter interface
 */
export interface IFulfillmentOrmAdapter {
    /**
     * Find a single fulfillment by ID
     */
    findOne(id: ID, includeRelations?: boolean): Promise<Fulfillment | undefined>;

    /**
     * Find all fulfillments with pagination and filtering
     */
    findAll(options?: FulfillmentListOptions): Promise<PaginatedList<Fulfillment>>;

    /**
     * Find fulfillments by state
     */
    findByState(state: string): Promise<Fulfillment[]>;

    /**
     * Find fulfillments by tracking code
     */
    findByTrackingCode(trackingCode: string): Promise<Fulfillment[]>;

    /**
     * Create a new fulfillment
     */
    create(data: CreateFulfillmentInput): Promise<Fulfillment>;

    /**
     * Update an existing fulfillment
     */
    update(id: ID, data: UpdateFulfillmentInput): Promise<Fulfillment>;

    /**
     * Delete a fulfillment
     */
    delete(id: ID): Promise<void>;

    /**
     * Add an order to a fulfillment
     */
    addOrder(fulfillmentId: ID, orderId: ID): Promise<void>;

    /**
     * Remove an order from a fulfillment
     */
    removeOrder(fulfillmentId: ID, orderId: ID): Promise<void>;

    /**
     * Get all orders for a fulfillment
     */
    getOrders(fulfillmentId: ID): Promise<any[]>;
}
