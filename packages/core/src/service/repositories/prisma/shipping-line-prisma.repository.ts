/**
 * @description
 * Prisma-based repository for ShippingLine entity operations.
 * Handles CRUD operations for ShippingLines with their relations (order, shippingMethod, orderLines).
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { PrismaService } from '../../../connection/prisma.service';

export interface ShippingLineListOptions {
    skip?: number;
    take?: number;
    filter?: {
        orderId?: string;
        shippingMethodId?: string;
    };
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreateShippingLineData {
    orderId: string;
    shippingMethodId: string;
    listPrice: number;
    listPriceIncludesTax: boolean;
    price: number;
    priceWithTax: number;
    discountedPrice: number;
    discountedPriceWithTax: number;
    discounts?: Record<string, any>;
    taxLines?: Record<string, any>;
    customFields?: Record<string, any>;
}

export interface UpdateShippingLineData {
    shippingMethodId?: string;
    listPrice?: number;
    listPriceIncludesTax?: boolean;
    price?: number;
    priceWithTax?: number;
    discountedPrice?: number;
    discountedPriceWithTax?: number;
    discounts?: Record<string, any>;
    taxLines?: Record<string, any>;
    customFields?: Record<string, any>;
}

/**
 * Default include for loading ShippingLine relations
 */
const DEFAULT_SHIPPING_LINE_INCLUDE = {
    order: true,
    shippingMethod: {
        include: {
            translations: true,
        },
    },
    orderLines: true,
} satisfies Prisma.ShippingLineInclude;

@Injectable()
export class ShippingLinePrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Find a single shipping line by ID
     */
    async findOne(id: ID, includeRelations: boolean = true): Promise<any | undefined> {
        const include = includeRelations ? DEFAULT_SHIPPING_LINE_INCLUDE : undefined;

        const shippingLine = await this.prisma.shippingLine.findUnique({
            where: { id: String(id) },
            include,
        });

        return shippingLine || undefined;
    }

    /**
     * Find all shipping lines with pagination and filtering
     */
    async findAll(options: ShippingLineListOptions = {}): Promise<PaginatedList<any>> {
        const { skip = 0, take = 10, filter, sort } = options;

        // Build where clause
        const where: Prisma.ShippingLineWhereInput = {};

        if (filter?.orderId) {
            where.orderId = filter.orderId;
        }

        if (filter?.shippingMethodId) {
            where.shippingMethodId = filter.shippingMethodId;
        }

        // Build orderBy
        let orderBy: Prisma.ShippingLineOrderByWithRelationInput = {
            createdAt: 'desc',
        };

        if (sort?.field) {
            orderBy = {
                [sort.field]: sort.order || 'asc',
            };
        }

        // Execute query
        const [items, totalItems] = await Promise.all([
            this.prisma.shippingLine.findMany({
                where,
                include: DEFAULT_SHIPPING_LINE_INCLUDE,
                skip,
                take,
                orderBy,
            }),
            this.prisma.shippingLine.count({ where }),
        ]);

        return {
            items,
            totalItems,
        };
    }

    /**
     * Find shipping lines by order ID
     */
    async findByOrder(orderId: ID): Promise<any[]> {
        const shippingLines = await this.prisma.shippingLine.findMany({
            where: {
                orderId: String(orderId),
            },
            include: DEFAULT_SHIPPING_LINE_INCLUDE,
        });

        return shippingLines;
    }

    /**
     * Find shipping lines by shipping method ID
     */
    async findByShippingMethod(shippingMethodId: ID): Promise<any[]> {
        const shippingLines = await this.prisma.shippingLine.findMany({
            where: {
                shippingMethodId: String(shippingMethodId),
            },
            include: DEFAULT_SHIPPING_LINE_INCLUDE,
        });

        return shippingLines;
    }

    /**
     * Create a new shipping line
     */
    async create(data: CreateShippingLineData): Promise<any> {
        const shippingLine = await this.prisma.shippingLine.create({
            data: {
                orderId: data.orderId,
                shippingMethodId: data.shippingMethodId,
                listPrice: data.listPrice,
                listPriceIncludesTax: data.listPriceIncludesTax,
                price: data.price,
                priceWithTax: data.priceWithTax,
                discountedPrice: data.discountedPrice,
                discountedPriceWithTax: data.discountedPriceWithTax,
                discounts: data.discounts as Prisma.JsonValue,
                taxLines: data.taxLines as Prisma.JsonValue,
                customFields: data.customFields as Prisma.JsonValue,
            },
            include: DEFAULT_SHIPPING_LINE_INCLUDE,
        });

        return shippingLine;
    }

    /**
     * Update an existing shipping line
     */
    async update(id: ID, data: UpdateShippingLineData): Promise<any> {
        const updateData: Prisma.ShippingLineUpdateInput = {};

        if (data.shippingMethodId !== undefined) {
            updateData.shippingMethodId = data.shippingMethodId;
        }

        if (data.listPrice !== undefined) {
            updateData.listPrice = data.listPrice;
        }

        if (data.listPriceIncludesTax !== undefined) {
            updateData.listPriceIncludesTax = data.listPriceIncludesTax;
        }

        if (data.price !== undefined) {
            updateData.price = data.price;
        }

        if (data.priceWithTax !== undefined) {
            updateData.priceWithTax = data.priceWithTax;
        }

        if (data.discountedPrice !== undefined) {
            updateData.discountedPrice = data.discountedPrice;
        }

        if (data.discountedPriceWithTax !== undefined) {
            updateData.discountedPriceWithTax = data.discountedPriceWithTax;
        }

        if (data.discounts !== undefined) {
            updateData.discounts = data.discounts as Prisma.JsonValue;
        }

        if (data.taxLines !== undefined) {
            updateData.taxLines = data.taxLines as Prisma.JsonValue;
        }

        if (data.customFields !== undefined) {
            updateData.customFields = data.customFields as Prisma.JsonValue;
        }

        const shippingLine = await this.prisma.shippingLine.update({
            where: { id: String(id) },
            data: updateData,
            include: DEFAULT_SHIPPING_LINE_INCLUDE,
        });

        return shippingLine;
    }

    /**
     * Delete a shipping line
     */
    async delete(id: ID): Promise<void> {
        await this.prisma.shippingLine.delete({
            where: { id: String(id) },
        });
    }

    /**
     * Get all order lines for a shipping line
     */
    async getOrderLines(shippingLineId: ID): Promise<any[]> {
        const orderLines = await this.prisma.orderLine.findMany({
            where: {
                shippingLineId: String(shippingLineId),
            },
        });

        return orderLines;
    }
}
