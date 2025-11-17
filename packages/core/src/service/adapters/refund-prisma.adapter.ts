import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { PrismaService } from '../../connection/prisma.service';
import { Refund } from '../../entity/refund/refund.entity';

import {
    CreateRefundData,
    IRefundOrmAdapter,
    RefundListOptions,
    UpdateRefundData,
} from './refund-orm.adapter';

/**
 * @description
 * Prisma implementation of the Refund ORM adapter.
 * Translates Refund operations to Prisma Client calls and maps results
 * to TypeORM entity instances for backward compatibility.
 *
 * @since 3.6.0
 */
@Injectable()
export class RefundPrismaAdapter implements IRefundOrmAdapter {
    constructor(private prisma: PrismaService) {}

    async findOne(id: ID, includeRelations: string[] = []): Promise<Refund | undefined> {
        const refund = await this.prisma.refund.findUnique({
            where: { id: String(id) },
            include: {
                payment: includeRelations.includes('payment')
                    ? {
                          include: {
                              order: true,
                          },
                      }
                    : includeRelations.includes('payment'),
                modification: includeRelations.includes('modification'),
            },
        });

        return refund ? this.mapToEntity(refund) : undefined;
    }

    async findByPaymentId(paymentId: ID): Promise<Refund[]> {
        const refunds = await this.prisma.refund.findMany({
            where: { paymentId: String(paymentId) },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return refunds.map(r => this.mapToEntity(r));
    }

    async findByState(state: string): Promise<Refund[]> {
        const refunds = await this.prisma.refund.findMany({
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

        return refunds.map(r => this.mapToEntity(r));
    }

    async findAll(options: RefundListOptions): Promise<PaginatedList<Refund>> {
        const { skip = 0, take = 20, filter = {}, sort = {} } = options;

        const [items, totalItems] = await Promise.all([
            this.prisma.refund.findMany({
                skip,
                take,
                where: this.mapFilter(filter),
                orderBy: this.mapSort(sort),
                include: {
                    payment: {
                        include: {
                            order: true,
                        },
                    },
                },
            }),
            this.prisma.refund.count({
                where: this.mapFilter(filter),
            }),
        ]);

        return {
            items: items.map(item => this.mapToEntity(item)),
            totalItems,
        };
    }

    async create(data: CreateRefundData): Promise<Refund> {
        const refund = await this.prisma.refund.create({
            data: {
                payment: {
                    connect: { id: String(data.paymentId) },
                },
                items: data.items,
                shipping: data.shipping,
                adjustment: data.adjustment,
                total: data.total,
                method: data.method,
                state: data.state,
                reason: data.reason,
                transactionId: data.transactionId,
                metadata: data.metadata || undefined,
            },
            include: {
                payment: {
                    include: {
                        order: true,
                    },
                },
            },
        });

        return this.mapToEntity(refund);
    }

    async update(id: ID, data: UpdateRefundData): Promise<Refund> {
        const refund = await this.prisma.refund.update({
            where: { id: String(id) },
            data: {
                items: data.items,
                shipping: data.shipping,
                adjustment: data.adjustment,
                total: data.total,
                method: data.method,
                state: data.state,
                reason: data.reason,
                transactionId: data.transactionId,
                metadata: data.metadata,
            },
            include: {
                payment: {
                    include: {
                        order: true,
                    },
                },
            },
        });

        return this.mapToEntity(refund);
    }

    async delete(id: ID): Promise<void> {
        await this.prisma.refund.delete({
            where: { id: String(id) },
        });
    }

    async exists(id: ID): Promise<boolean> {
        const count = await this.prisma.refund.count({
            where: { id: String(id) },
        });
        return count > 0;
    }

    async count(filter: any = {}): Promise<number> {
        return this.prisma.refund.count({
            where: this.mapFilter(filter),
        });
    }

    async updateState(id: ID, state: string): Promise<Refund> {
        const refund = await this.prisma.refund.update({
            where: { id: String(id) },
            data: { state },
            include: {
                payment: {
                    include: {
                        order: true,
                    },
                },
            },
        });

        return this.mapToEntity(refund);
    }

    async findByTransactionId(transactionId: string): Promise<Refund | undefined> {
        const refund = await this.prisma.refund.findFirst({
            where: { transactionId },
            include: {
                payment: {
                    include: {
                        order: true,
                    },
                },
            },
        });

        return refund ? this.mapToEntity(refund) : undefined;
    }

    async getTotalRefundedForPayment(paymentId: ID): Promise<number> {
        const refunds = await this.prisma.refund.findMany({
            where: {
                paymentId: String(paymentId),
                state: 'Settled',
            },
        });

        return refunds.reduce((total, refund) => total + refund.total, 0);
    }

    /**
     * Map Prisma refund to TypeORM entity for backward compatibility
     * @private
     */
    private mapToEntity(prismaRefund: any): Refund {
        const refund = new Refund({
            id: prismaRefund.id,
            createdAt: prismaRefund.createdAt,
            updatedAt: prismaRefund.updatedAt,
            items: prismaRefund.items,
            shipping: prismaRefund.shipping,
            adjustment: prismaRefund.adjustment,
            total: prismaRefund.total,
            method: prismaRefund.method,
            state: prismaRefund.state,
            reason: prismaRefund.reason,
            transactionId: prismaRefund.transactionId,
            metadata: prismaRefund.metadata,
        });

        // Map relations if included
        if (prismaRefund.payment) {
            refund.payment = prismaRefund.payment;
        }

        return refund;
    }

    /**
     * Map filter object to Prisma where clause
     * @private
     */
    private mapFilter(filter: any): any {
        const prismaFilter: any = {};

        if (filter.paymentId) {
            prismaFilter.paymentId = String(filter.paymentId);
        }
        if (filter.state) {
            prismaFilter.state = filter.state;
        }
        if (filter.transactionId) {
            prismaFilter.transactionId = filter.transactionId;
        }

        return prismaFilter;
    }

    /**
     * Map sort object to Prisma orderBy clause
     * @private
     */
    private mapSort(sort: any): any {
        const prismaOrderBy: any = {};

        if (sort.createdAt) {
            prismaOrderBy.createdAt = sort.createdAt === 'ASC' ? 'asc' : 'desc';
        }
        if (sort.total) {
            prismaOrderBy.total = sort.total === 'ASC' ? 'asc' : 'desc';
        }

        return Object.keys(prismaOrderBy).length > 0 ? prismaOrderBy : { createdAt: 'desc' };
    }
}
