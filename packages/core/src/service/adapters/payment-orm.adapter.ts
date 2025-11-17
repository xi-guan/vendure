/**
 * @description
 * Adapter layer for Payment ORM operations.
 * Provides a unified interface that can be implemented by both TypeORM and Prisma.
 *
 * This allows for gradual migration from TypeORM to Prisma with zero downtime.
 * The service layer depends on this interface, not on a specific ORM implementation.
 *
 * @since 3.6.0
 */

import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { Payment } from '../../entity/payment/payment.entity';

export interface CreatePaymentData {
    orderId: ID;
    method: string;
    amount: number;
    state: string;
    transactionId?: string;
    errorMessage?: string;
    metadata?: any;
    customFields?: any;
}

export interface UpdatePaymentData {
    method?: string;
    amount?: number;
    state?: string;
    transactionId?: string;
    errorMessage?: string;
    metadata?: any;
    customFields?: any;
}

export interface PaymentListOptions {
    skip?: number;
    take?: number;
    filter?: any;
    sort?: any;
}

/**
 * ORM-agnostic interface for Payment operations
 */
export interface IPaymentOrmAdapter {
    /**
     * Find a payment by ID
     */
    findOne(id: ID, includeRelations?: string[]): Promise<Payment | undefined>;

    /**
     * Find payments by order ID
     */
    findByOrderId(orderId: ID): Promise<Payment[]>;

    /**
     * Find payments by state
     */
    findByState(state: string): Promise<Payment[]>;

    /**
     * Find payments with pagination
     */
    findAll(options: PaymentListOptions): Promise<PaginatedList<Payment>>;

    /**
     * Create a new payment
     */
    create(data: CreatePaymentData): Promise<Payment>;

    /**
     * Update a payment
     */
    update(id: ID, data: UpdatePaymentData): Promise<Payment>;

    /**
     * Delete a payment
     */
    delete(id: ID): Promise<void>;

    /**
     * Check if payment exists
     */
    exists(id: ID): Promise<boolean>;

    /**
     * Count payments
     */
    count(filter?: any): Promise<number>;

    /**
     * Update payment state
     */
    updateState(id: ID, state: string): Promise<Payment>;

    /**
     * Find payment by transaction ID
     */
    findByTransactionId(transactionId: string): Promise<Payment | undefined>;

    /**
     * Get total amount paid for an order
     */
    getTotalPaidForOrder(orderId: ID): Promise<number>;

    /**
     * Find payments by method
     */
    findByMethod(method: string): Promise<Payment[]>;
}

/**
 * Factory function to get the appropriate ORM adapter
 */
export function getPaymentOrmAdapter(
    usePrisma: boolean,
    typeormAdapter: IPaymentOrmAdapter,
    prismaAdapter: IPaymentOrmAdapter,
): IPaymentOrmAdapter {
    return usePrisma ? prismaAdapter : typeormAdapter;
}
