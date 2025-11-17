import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { PrismaService } from '../../connection/prisma.service';
import { Payment } from '../../entity/payment/payment.entity';

import {
    CreatePaymentData,
    IPaymentOrmAdapter,
    PaymentListOptions,
    UpdatePaymentData,
} from './payment-orm.adapter';

/**
 * @description
 * Prisma implementation of the Payment ORM adapter.
 * Translates Payment operations to Prisma Client calls and maps results
 * to TypeORM entity instances for backward compatibility.
 *
 * @since 3.6.0
 */
@Injectable()
export class PaymentPrismaAdapter implements IPaymentOrmAdapter {
    constructor(private prisma: PrismaService) {}

    async findOne(id: ID, includeRelations: string[] = []): Promise<Payment | undefined> {
        const payment = await this.prisma.payment.findUnique({
            where: { id: String(id) },
            include: {
                order: includeRelations.includes('order'),
                refunds: includeRelations.includes('refunds'),
                modification: includeRelations.includes('modification'),
            },
        });

        return payment ? this.mapToEntity(payment) : undefined;
    }

    async findByOrderId(orderId: ID): Promise<Payment[]> {
        const payments = await this.prisma.payment.findMany({
            where: { orderId: String(orderId) },
            include: {
                refunds: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return payments.map(p => this.mapToEntity(p));
    }

    async findByState(state: string): Promise<Payment[]> {
        const payments = await this.prisma.payment.findMany({
            where: { state },
            include: {
                order: true,
                refunds: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return payments.map(p => this.mapToEntity(p));
    }

    async findAll(options: PaymentListOptions): Promise<PaginatedList<Payment>> {
        const { skip = 0, take = 20, filter = {}, sort = {} } = options;

        const [items, totalItems] = await Promise.all([
            this.prisma.payment.findMany({
                skip,
                take,
                where: this.mapFilter(filter),
                orderBy: this.mapSort(sort),
                include: {
                    order: true,
                    refunds: true,
                },
            }),
            this.prisma.payment.count({
                where: this.mapFilter(filter),
            }),
        ]);

        return {
            items: items.map(item => this.mapToEntity(item)),
            totalItems,
        };
    }

    async create(data: CreatePaymentData): Promise<Payment> {
        const payment = await this.prisma.payment.create({
            data: {
                order: {
                    connect: { id: String(data.orderId) },
                },
                method: data.method,
                amount: data.amount,
                state: data.state,
                transactionId: data.transactionId,
                errorMessage: data.errorMessage,
                metadata: data.metadata || undefined,
                customFields: data.customFields || undefined,
            },
            include: {
                order: true,
                refunds: true,
            },
        });

        return this.mapToEntity(payment);
    }

    async update(id: ID, data: UpdatePaymentData): Promise<Payment> {
        const payment = await this.prisma.payment.update({
            where: { id: String(id) },
            data: {
                method: data.method,
                amount: data.amount,
                state: data.state,
                transactionId: data.transactionId,
                errorMessage: data.errorMessage,
                metadata: data.metadata,
                customFields: data.customFields,
            },
            include: {
                order: true,
                refunds: true,
            },
        });

        return this.mapToEntity(payment);
    }

    async delete(id: ID): Promise<void> {
        await this.prisma.payment.delete({
            where: { id: String(id) },
        });
    }

    async exists(id: ID): Promise<boolean> {
        const count = await this.prisma.payment.count({
            where: { id: String(id) },
        });
        return count > 0;
    }

    async count(filter: any = {}): Promise<number> {
        return this.prisma.payment.count({
            where: this.mapFilter(filter),
        });
    }

    async updateState(id: ID, state: string): Promise<Payment> {
        const payment = await this.prisma.payment.update({
            where: { id: String(id) },
            data: { state },
            include: {
                order: true,
                refunds: true,
            },
        });

        return this.mapToEntity(payment);
    }

    async findByTransactionId(transactionId: string): Promise<Payment | undefined> {
        const payment = await this.prisma.payment.findFirst({
            where: { transactionId },
            include: {
                order: true,
                refunds: true,
            },
        });

        return payment ? this.mapToEntity(payment) : undefined;
    }

    async getTotalPaidForOrder(orderId: ID): Promise<number> {
        const payments = await this.prisma.payment.findMany({
            where: {
                orderId: String(orderId),
                state: { in: ['Settled', 'Authorized'] },
            },
        });

        return payments.reduce((total, payment) => total + payment.amount, 0);
    }

    async findByMethod(method: string): Promise<Payment[]> {
        const payments = await this.prisma.payment.findMany({
            where: { method },
            include: {
                order: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return payments.map(p => this.mapToEntity(p));
    }

    /**
     * Map Prisma payment to TypeORM entity for backward compatibility
     * @private
     */
    private mapToEntity(prismaPayment: any): Payment {
        const payment = new Payment({
            id: prismaPayment.id,
            createdAt: prismaPayment.createdAt,
            updatedAt: prismaPayment.updatedAt,
            method: prismaPayment.method,
            amount: prismaPayment.amount,
            state: prismaPayment.state,
            transactionId: prismaPayment.transactionId,
            errorMessage: prismaPayment.errorMessage,
            metadata: prismaPayment.metadata,
            customFields: prismaPayment.customFields,
        });

        // Map relations if included
        if (prismaPayment.order) {
            payment.order = prismaPayment.order;
        }
        if (prismaPayment.refunds) {
            payment.refunds = prismaPayment.refunds;
        }

        return payment;
    }

    /**
     * Map filter object to Prisma where clause
     * @private
     */
    private mapFilter(filter: any): any {
        const prismaFilter: any = {};

        if (filter.orderId) {
            prismaFilter.orderId = String(filter.orderId);
        }
        if (filter.state) {
            prismaFilter.state = filter.state;
        }
        if (filter.method) {
            prismaFilter.method = filter.method;
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
        if (sort.amount) {
            prismaOrderBy.amount = sort.amount === 'ASC' ? 'asc' : 'desc';
        }

        return Object.keys(prismaOrderBy).length > 0 ? prismaOrderBy : { createdAt: 'desc' };
    }
}
