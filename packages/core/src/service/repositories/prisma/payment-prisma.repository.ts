import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../connection/prisma.service';

/**
 * @description
 * Repository for Payment entity using Prisma ORM.
 * This is part of Phase 2.6 - Continued migration from TypeORM to Prisma.
 *
 * Provides type-safe database operations for Payment entity with
 * improved query performance and better developer experience.
 *
 * @example
 * ```typescript
 * const payment = await paymentPrismaRepo.findOne('payment-id');
 * const payments = await paymentPrismaRepo.findMany({
 *   where: { orderId: 'order-id' },
 *   skip: 0,
 *   take: 10,
 * });
 * ```
 *
 * @docsCategory services
 * @since 3.6.0
 */
@Injectable()
export class PaymentPrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Find a single payment by ID
     * @param id - Payment ID
     * @param includeRelations - Whether to include related entities
     */
    async findOne(id: string, includeRelations: boolean = true) {
        return this.prisma.payment.findUnique({
            where: { id },
            include: includeRelations
                ? {
                      order: true,
                      refunds: true,
                      modification: true,
                  }
                : undefined,
        });
    }

    /**
     * Find payments by order ID
     * @param orderId - Order ID
     */
    async findByOrderId(orderId: string) {
        return this.prisma.payment.findMany({
            where: { orderId },
            include: {
                refunds: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }

    /**
     * Find payments by state
     * @param state - Payment state
     */
    async findByState(state: string) {
        return this.prisma.payment.findMany({
            where: { state },
            include: {
                order: true,
                refunds: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Find payments with pagination and filtering
     * @param params - Query parameters
     */
    async findMany(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.PaymentWhereUniqueInput;
        where?: Prisma.PaymentWhereInput;
        orderBy?: Prisma.PaymentOrderByWithRelationInput;
    }) {
        const { skip, take, cursor, where, orderBy } = params;

        const [items, count] = await Promise.all([
            this.prisma.payment.findMany({
                skip,
                take,
                cursor,
                where,
                orderBy,
                include: {
                    order: true,
                    refunds: true,
                },
            }),
            this.prisma.payment.count({
                where,
            }),
        ]);

        return {
            items,
            totalItems: count,
        };
    }

    /**
     * Create a new payment
     * @param data - Payment data
     */
    async create(data: Prisma.PaymentCreateInput) {
        return this.prisma.payment.create({
            data,
            include: {
                order: true,
                refunds: true,
            },
        });
    }

    /**
     * Update a payment
     * @param id - Payment ID
     * @param data - Update data
     */
    async update(id: string, data: Prisma.PaymentUpdateInput) {
        return this.prisma.payment.update({
            where: { id },
            data,
            include: {
                order: true,
                refunds: true,
            },
        });
    }

    /**
     * Delete a payment
     * @param id - Payment ID
     */
    async delete(id: string) {
        return this.prisma.payment.delete({
            where: { id },
        });
    }

    /**
     * Count payments matching criteria
     * @param where - Filter criteria
     */
    async count(where?: Prisma.PaymentWhereInput) {
        return this.prisma.payment.count({
            where,
        });
    }

    /**
     * Check if payment exists
     * @param id - Payment ID
     */
    async exists(id: string): Promise<boolean> {
        const count = await this.prisma.payment.count({
            where: { id },
        });
        return count > 0;
    }

    /**
     * Find payments by IDs
     * @param ids - Array of payment IDs
     */
    async findByIds(ids: string[]) {
        return this.prisma.payment.findMany({
            where: {
                id: { in: ids },
            },
            include: {
                order: true,
                refunds: true,
            },
        });
    }

    /**
     * Update payment state
     * @param id - Payment ID
     * @param state - New state
     */
    async updateState(id: string, state: string) {
        return this.prisma.payment.update({
            where: { id },
            data: { state },
        });
    }

    /**
     * Find payment by transaction ID
     * @param transactionId - Transaction ID from payment provider
     */
    async findByTransactionId(transactionId: string) {
        return this.prisma.payment.findFirst({
            where: { transactionId },
            include: {
                order: true,
                refunds: true,
            },
        });
    }

    /**
     * Get total amount paid for an order
     * @param orderId - Order ID
     */
    async getTotalPaidForOrder(orderId: string): Promise<number> {
        const payments = await this.prisma.payment.findMany({
            where: {
                orderId,
                state: { in: ['Settled', 'Authorized'] },
            },
        });

        return payments.reduce((total, payment) => total + payment.amount, 0);
    }

    /**
     * Find payments by method
     * @param method - Payment method code
     */
    async findByMethod(method: string) {
        return this.prisma.payment.findMany({
            where: { method },
            include: {
                order: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}
