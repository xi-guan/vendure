import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../connection/prisma.service';

/**
 * @description
 * Repository for Refund entity using Prisma ORM.
 * This is part of Phase 2.6 - Continued migration from TypeORM to Prisma.
 *
 * Provides type-safe database operations for Refund entity with
 * improved query performance and better developer experience.
 *
 * @example
 * ```typescript
 * const refund = await refundPrismaRepo.findOne('refund-id');
 * const refunds = await refundPrismaRepo.findMany({
 *   where: { paymentId: 'payment-id' },
 *   skip: 0,
 *   take: 10,
 * });
 * ```
 *
 * @docsCategory services
 * @since 3.6.0
 */
@Injectable()
export class RefundPrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Find a single refund by ID
     * @param id - Refund ID
     * @param includeRelations - Whether to include related entities
     */
    async findOne(id: string, includeRelations: boolean = true) {
        return this.prisma.refund.findUnique({
            where: { id },
            include: includeRelations
                ? {
                      payment: {
                          include: {
                              order: true,
                          },
                      },
                      modification: true,
                  }
                : undefined,
        });
    }

    /**
     * Find refunds by payment ID
     * @param paymentId - Payment ID
     */
    async findByPaymentId(paymentId: string) {
        return this.prisma.refund.findMany({
            where: { paymentId },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }

    /**
     * Find refunds by state
     * @param state - Refund state
     */
    async findByState(state: string) {
        return this.prisma.refund.findMany({
            where: { state },
            include: {
                payment: {
                    include: {
                        order: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Find refunds with pagination and filtering
     * @param params - Query parameters
     */
    async findMany(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.RefundWhereUniqueInput;
        where?: Prisma.RefundWhereInput;
        orderBy?: Prisma.RefundOrderByWithRelationInput;
    }) {
        const { skip, take, cursor, where, orderBy } = params;

        const [items, count] = await Promise.all([
            this.prisma.refund.findMany({
                skip,
                take,
                cursor,
                where,
                orderBy,
                include: {
                    payment: {
                        include: {
                            order: true,
                        },
                    },
                },
            }),
            this.prisma.refund.count({
                where,
            }),
        ]);

        return {
            items,
            totalItems: count,
        };
    }

    /**
     * Create a new refund
     * @param data - Refund data
     */
    async create(data: Prisma.RefundCreateInput) {
        return this.prisma.refund.create({
            data,
            include: {
                payment: {
                    include: {
                        order: true,
                    },
                },
            },
        });
    }

    /**
     * Update a refund
     * @param id - Refund ID
     * @param data - Update data
     */
    async update(id: string, data: Prisma.RefundUpdateInput) {
        return this.prisma.refund.update({
            where: { id },
            data,
            include: {
                payment: {
                    include: {
                        order: true,
                    },
                },
            },
        });
    }

    /**
     * Delete a refund
     * @param id - Refund ID
     */
    async delete(id: string) {
        return this.prisma.refund.delete({
            where: { id },
        });
    }

    /**
     * Count refunds matching criteria
     * @param where - Filter criteria
     */
    async count(where?: Prisma.RefundWhereInput) {
        return this.prisma.refund.count({
            where,
        });
    }

    /**
     * Check if refund exists
     * @param id - Refund ID
     */
    async exists(id: string): Promise<boolean> {
        const count = await this.prisma.refund.count({
            where: { id },
        });
        return count > 0;
    }

    /**
     * Find refunds by IDs
     * @param ids - Array of refund IDs
     */
    async findByIds(ids: string[]) {
        return this.prisma.refund.findMany({
            where: {
                id: { in: ids },
            },
            include: {
                payment: {
                    include: {
                        order: true,
                    },
                },
            },
        });
    }

    /**
     * Update refund state
     * @param id - Refund ID
     * @param state - New state
     */
    async updateState(id: string, state: string) {
        return this.prisma.refund.update({
            where: { id },
            data: { state },
        });
    }

    /**
     * Find refund by transaction ID
     * @param transactionId - Transaction ID from payment provider
     */
    async findByTransactionId(transactionId: string) {
        return this.prisma.refund.findFirst({
            where: { transactionId },
            include: {
                payment: {
                    include: {
                        order: true,
                    },
                },
            },
        });
    }

    /**
     * Get total refunded amount for a payment
     * @param paymentId - Payment ID
     */
    async getTotalRefundedForPayment(paymentId: string): Promise<number> {
        const refunds = await this.prisma.refund.findMany({
            where: {
                paymentId,
                state: 'Settled',
            },
        });

        return refunds.reduce((total, refund) => total + refund.total, 0);
    }
}
