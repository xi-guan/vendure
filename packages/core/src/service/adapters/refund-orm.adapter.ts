/**
 * @description
 * Adapter layer for Refund ORM operations.
 * Provides a unified interface that can be implemented by both TypeORM and Prisma.
 *
 * This allows for gradual migration from TypeORM to Prisma with zero downtime.
 * The service layer depends on this interface, not on a specific ORM implementation.
 *
 * @since 3.6.0
 */

import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { Refund } from '../../entity/refund/refund.entity';

export interface CreateRefundData {
    paymentId: ID;
    items: number;
    shipping: number;
    adjustment: number;
    total: number;
    method?: string;
    state: string;
    reason?: string;
    transactionId?: string;
    metadata?: any;
}

export interface UpdateRefundData {
    items?: number;
    shipping?: number;
    adjustment?: number;
    total?: number;
    method?: string;
    state?: string;
    reason?: string;
    transactionId?: string;
    metadata?: any;
}

export interface RefundListOptions {
    skip?: number;
    take?: number;
    filter?: any;
    sort?: any;
}

/**
 * ORM-agnostic interface for Refund operations
 */
export interface IRefundOrmAdapter {
    /**
     * Find a refund by ID
     */
    findOne(id: ID, includeRelations?: string[]): Promise<Refund | undefined>;

    /**
     * Find refunds by payment ID
     */
    findByPaymentId(paymentId: ID): Promise<Refund[]>;

    /**
     * Find refunds by state
     */
    findByState(state: string): Promise<Refund[]>;

    /**
     * Find refunds with pagination
     */
    findAll(options: RefundListOptions): Promise<PaginatedList<Refund>>;

    /**
     * Create a new refund
     */
    create(data: CreateRefundData): Promise<Refund>;

    /**
     * Update a refund
     */
    update(id: ID, data: UpdateRefundData): Promise<Refund>;

    /**
     * Delete a refund
     */
    delete(id: ID): Promise<void>;

    /**
     * Check if refund exists
     */
    exists(id: ID): Promise<boolean>;

    /**
     * Count refunds
     */
    count(filter?: any): Promise<number>;

    /**
     * Update refund state
     */
    updateState(id: ID, state: string): Promise<Refund>;

    /**
     * Find refund by transaction ID
     */
    findByTransactionId(transactionId: string): Promise<Refund | undefined>;

    /**
     * Get total refunded amount for a payment
     */
    getTotalRefundedForPayment(paymentId: ID): Promise<number>;
}

/**
 * Factory function to get the appropriate ORM adapter
 */
export function getRefundOrmAdapter(
    usePrisma: boolean,
    typeormAdapter: IRefundOrmAdapter,
    prismaAdapter: IRefundOrmAdapter,
): IRefundOrmAdapter {
    return usePrisma ? prismaAdapter : typeormAdapter;
}
