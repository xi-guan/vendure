import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../connection/prisma.service';

/**
 * @description
 * Repository for OrderLine entity using Prisma ORM.
 * This is part of Phase 2.6 - Continued migration from TypeORM to Prisma.
 *
 * Provides type-safe database operations for OrderLine entity with
 * improved query performance and better developer experience.
 *
 * @example
 * ```typescript
 * const orderLine = await orderLinePrismaRepo.findOne('order-line-id');
 * const orderLines = await orderLinePrismaRepo.findMany({
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
export class OrderLinePrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Find a single order line by ID
     * @param id - OrderLine ID
     * @param includeRelations - Whether to include related entities
     */
    async findOne(id: string, includeRelations: boolean = true) {
        return this.prisma.orderLine.findUnique({
            where: { id },
            include: includeRelations
                ? {
                      order: true,
                      productVariant: true,
                      taxCategory: true,
                      featuredAsset: true,
                      shippingLine: true,
                      sellerChannel: true,
                  }
                : undefined,
        });
    }

    /**
     * Find order lines by order ID
     * @param orderId - Order ID
     */
    async findByOrderId(orderId: string) {
        return this.prisma.orderLine.findMany({
            where: { orderId },
            include: {
                productVariant: true,
                taxCategory: true,
                featuredAsset: true,
                shippingLine: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }

    /**
     * Find order lines by product variant ID
     * @param productVariantId - ProductVariant ID
     */
    async findByProductVariantId(productVariantId: string) {
        return this.prisma.orderLine.findMany({
            where: { productVariantId },
            include: {
                order: true,
                productVariant: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Find order lines with pagination and filtering
     * @param params - Query parameters
     */
    async findMany(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.OrderLineWhereUniqueInput;
        where?: Prisma.OrderLineWhereInput;
        orderBy?: Prisma.OrderLineOrderByWithRelationInput;
    }) {
        const { skip, take, cursor, where, orderBy } = params;

        const [items, count] = await Promise.all([
            this.prisma.orderLine.findMany({
                skip,
                take,
                cursor,
                where,
                orderBy,
                include: {
                    order: true,
                    productVariant: true,
                    taxCategory: true,
                    featuredAsset: true,
                },
            }),
            this.prisma.orderLine.count({
                where,
            }),
        ]);

        return {
            items,
            totalItems: count,
        };
    }

    /**
     * Create a new order line
     * @param data - OrderLine data
     */
    async create(data: Prisma.OrderLineCreateInput) {
        return this.prisma.orderLine.create({
            data,
            include: {
                order: true,
                productVariant: true,
                taxCategory: true,
                featuredAsset: true,
                shippingLine: true,
            },
        });
    }

    /**
     * Update an order line
     * @param id - OrderLine ID
     * @param data - Update data
     */
    async update(id: string, data: Prisma.OrderLineUpdateInput) {
        return this.prisma.orderLine.update({
            where: { id },
            data,
            include: {
                order: true,
                productVariant: true,
                taxCategory: true,
                featuredAsset: true,
                shippingLine: true,
            },
        });
    }

    /**
     * Delete an order line
     * @param id - OrderLine ID
     */
    async delete(id: string) {
        return this.prisma.orderLine.delete({
            where: { id },
        });
    }

    /**
     * Delete multiple order lines by order ID
     * @param orderId - Order ID
     */
    async deleteByOrderId(orderId: string) {
        return this.prisma.orderLine.deleteMany({
            where: { orderId },
        });
    }

    /**
     * Count order lines matching criteria
     * @param where - Filter criteria
     */
    async count(where?: Prisma.OrderLineWhereInput) {
        return this.prisma.orderLine.count({
            where,
        });
    }

    /**
     * Check if order line exists
     * @param id - OrderLine ID
     */
    async exists(id: string): Promise<boolean> {
        const count = await this.prisma.orderLine.count({
            where: { id },
        });
        return count > 0;
    }

    /**
     * Find order lines by IDs
     * @param ids - Array of order line IDs
     */
    async findByIds(ids: string[]) {
        return this.prisma.orderLine.findMany({
            where: {
                id: { in: ids },
            },
            include: {
                order: true,
                productVariant: true,
                taxCategory: true,
                featuredAsset: true,
            },
        });
    }

    /**
     * Update quantity for an order line
     * @param id - OrderLine ID
     * @param quantity - New quantity
     */
    async updateQuantity(id: string, quantity: number) {
        return this.prisma.orderLine.update({
            where: { id },
            data: { quantity },
        });
    }

    /**
     * Get order lines with specific shipping line
     * @param shippingLineId - ShippingLine ID
     */
    async findByShippingLineId(shippingLineId: string) {
        return this.prisma.orderLine.findMany({
            where: { shippingLineId },
            include: {
                order: true,
                productVariant: true,
            },
        });
    }
}
