import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { PrismaService } from '../../connection/prisma.service';
import { OrderLine } from '../../entity/order-line/order-line.entity';

import {
    CreateOrderLineData,
    IOrderLineOrmAdapter,
    OrderLineListOptions,
    UpdateOrderLineData,
} from './order-line-orm.adapter';

/**
 * @description
 * Prisma implementation of the OrderLine ORM adapter.
 * Translates OrderLine operations to Prisma Client calls and maps results
 * to TypeORM entity instances for backward compatibility.
 *
 * @since 3.6.0
 */
@Injectable()
export class OrderLinePrismaAdapter implements IOrderLineOrmAdapter {
    constructor(private prisma: PrismaService) {}

    async findOne(id: ID, includeRelations: string[] = []): Promise<OrderLine | undefined> {
        const orderLine = await this.prisma.orderLine.findUnique({
            where: { id: String(id) },
            include: {
                order: includeRelations.includes('order'),
                productVariant: includeRelations.includes('productVariant'),
                taxCategory: includeRelations.includes('taxCategory'),
                featuredAsset: includeRelations.includes('featuredAsset'),
                shippingLine: includeRelations.includes('shippingLine'),
                sellerChannel: includeRelations.includes('sellerChannel'),
            },
        });

        return orderLine ? this.mapToEntity(orderLine) : undefined;
    }

    async findByOrderId(orderId: ID): Promise<OrderLine[]> {
        const orderLines = await this.prisma.orderLine.findMany({
            where: { orderId: String(orderId) },
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

        return orderLines.map(ol => this.mapToEntity(ol));
    }

    async findByProductVariantId(productVariantId: ID): Promise<OrderLine[]> {
        const orderLines = await this.prisma.orderLine.findMany({
            where: { productVariantId: String(productVariantId) },
            include: {
                order: true,
                productVariant: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return orderLines.map(ol => this.mapToEntity(ol));
    }

    async findAll(options: OrderLineListOptions): Promise<PaginatedList<OrderLine>> {
        const { skip = 0, take = 20, filter = {}, sort = {} } = options;

        const [items, totalItems] = await Promise.all([
            this.prisma.orderLine.findMany({
                skip,
                take,
                where: this.mapFilter(filter),
                orderBy: this.mapSort(sort),
                include: {
                    order: true,
                    productVariant: true,
                    taxCategory: true,
                    featuredAsset: true,
                },
            }),
            this.prisma.orderLine.count({
                where: this.mapFilter(filter),
            }),
        ]);

        return {
            items: items.map(item => this.mapToEntity(item)),
            totalItems,
        };
    }

    async create(data: CreateOrderLineData): Promise<OrderLine> {
        const orderLine = await this.prisma.orderLine.create({
            data: {
                order: {
                    connect: { id: String(data.orderId) },
                },
                productVariant: {
                    connect: { id: String(data.productVariantId) },
                },
                quantity: data.quantity,
                linePrice: data.linePrice,
                linePriceWithTax: data.linePriceWithTax,
                unitPrice: data.unitPrice,
                unitPriceWithTax: data.unitPriceWithTax,
                proratedLinePrice: data.proratedLinePrice,
                proratedLinePriceWithTax: data.proratedLinePriceWithTax,
                initialLinePrice: data.initialLinePrice,
                initialLinePriceWithTax: data.initialLinePriceWithTax,
                taxCategory: data.taxCategoryId
                    ? {
                          connect: { id: String(data.taxCategoryId) },
                      }
                    : undefined,
                featuredAsset: data.featuredAssetId
                    ? {
                          connect: { id: String(data.featuredAssetId) },
                      }
                    : undefined,
                shippingLine: data.shippingLineId
                    ? {
                          connect: { id: String(data.shippingLineId) },
                      }
                    : undefined,
                sellerChannel: data.sellerChannelId
                    ? {
                          connect: { id: String(data.sellerChannelId) },
                      }
                    : undefined,
                adjustments: data.adjustments || undefined,
                taxLines: data.taxLines || undefined,
                discounts: data.discounts || undefined,
                customFields: data.customFields || undefined,
            },
            include: {
                order: true,
                productVariant: true,
                taxCategory: true,
                featuredAsset: true,
                shippingLine: true,
            },
        });

        return this.mapToEntity(orderLine);
    }

    async update(id: ID, data: UpdateOrderLineData): Promise<OrderLine> {
        const orderLine = await this.prisma.orderLine.update({
            where: { id: String(id) },
            data: {
                quantity: data.quantity,
                linePrice: data.linePrice,
                linePriceWithTax: data.linePriceWithTax,
                unitPrice: data.unitPrice,
                unitPriceWithTax: data.unitPriceWithTax,
                proratedLinePrice: data.proratedLinePrice,
                proratedLinePriceWithTax: data.proratedLinePriceWithTax,
                taxCategory: data.taxCategoryId
                    ? {
                          connect: { id: String(data.taxCategoryId) },
                      }
                    : undefined,
                featuredAsset: data.featuredAssetId
                    ? {
                          connect: { id: String(data.featuredAssetId) },
                      }
                    : undefined,
                shippingLine: data.shippingLineId
                    ? {
                          connect: { id: String(data.shippingLineId) },
                      }
                    : undefined,
                sellerChannel: data.sellerChannelId
                    ? {
                          connect: { id: String(data.sellerChannelId) },
                      }
                    : undefined,
                adjustments: data.adjustments,
                taxLines: data.taxLines,
                discounts: data.discounts,
                customFields: data.customFields,
            },
            include: {
                order: true,
                productVariant: true,
                taxCategory: true,
                featuredAsset: true,
                shippingLine: true,
            },
        });

        return this.mapToEntity(orderLine);
    }

    async delete(id: ID): Promise<void> {
        await this.prisma.orderLine.delete({
            where: { id: String(id) },
        });
    }

    async deleteByOrderId(orderId: ID): Promise<void> {
        await this.prisma.orderLine.deleteMany({
            where: { orderId: String(orderId) },
        });
    }

    async exists(id: ID): Promise<boolean> {
        const count = await this.prisma.orderLine.count({
            where: { id: String(id) },
        });
        return count > 0;
    }

    async count(filter: any = {}): Promise<number> {
        return this.prisma.orderLine.count({
            where: this.mapFilter(filter),
        });
    }

    async updateQuantity(id: ID, quantity: number): Promise<OrderLine> {
        const orderLine = await this.prisma.orderLine.update({
            where: { id: String(id) },
            data: { quantity },
            include: {
                order: true,
                productVariant: true,
                taxCategory: true,
                featuredAsset: true,
            },
        });

        return this.mapToEntity(orderLine);
    }

    async findByShippingLineId(shippingLineId: ID): Promise<OrderLine[]> {
        const orderLines = await this.prisma.orderLine.findMany({
            where: { shippingLineId: String(shippingLineId) },
            include: {
                order: true,
                productVariant: true,
            },
        });

        return orderLines.map(ol => this.mapToEntity(ol));
    }

    /**
     * Map Prisma order line to TypeORM entity for backward compatibility
     * @private
     */
    private mapToEntity(prismaOrderLine: any): OrderLine {
        const orderLine = new OrderLine({
            id: prismaOrderLine.id,
            createdAt: prismaOrderLine.createdAt,
            updatedAt: prismaOrderLine.updatedAt,
            quantity: prismaOrderLine.quantity,
            customFields: prismaOrderLine.customFields,
        });

        // Map relations if included
        if (prismaOrderLine.order) {
            orderLine.order = prismaOrderLine.order;
        }
        if (prismaOrderLine.productVariant) {
            orderLine.productVariant = prismaOrderLine.productVariant;
        }
        if (prismaOrderLine.taxCategory) {
            orderLine.taxCategory = prismaOrderLine.taxCategory;
        }
        if (prismaOrderLine.featuredAsset) {
            orderLine.featuredAsset = prismaOrderLine.featuredAsset;
        }
        if (prismaOrderLine.shippingLine) {
            orderLine.shippingLine = prismaOrderLine.shippingLine;
        }
        if (prismaOrderLine.sellerChannel) {
            orderLine.sellerChannel = prismaOrderLine.sellerChannel;
        }

        return orderLine;
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
        if (filter.productVariantId) {
            prismaFilter.productVariantId = String(filter.productVariantId);
        }
        if (filter.shippingLineId) {
            prismaFilter.shippingLineId = String(filter.shippingLineId);
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
        if (sort.quantity) {
            prismaOrderBy.quantity = sort.quantity === 'ASC' ? 'asc' : 'desc';
        }

        return Object.keys(prismaOrderBy).length > 0 ? prismaOrderBy : { createdAt: 'asc' };
    }
}
