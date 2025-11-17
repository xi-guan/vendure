/**
 * @description
 * Prisma-based repository for Surcharge entity operations.
 * Handles CRUD operations for Surcharges with their relations (order).
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { PrismaService } from '../../../connection/prisma.service';

export interface SurchargeListOptions {
    skip?: number;
    take?: number;
    filter?: {
        orderId?: string;
        description?: string;
    };
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreateSurchargeData {
    orderId: string;
    description: string;
    sku?: string | null;
    listPrice: number;
    listPriceIncludesTax: boolean;
    price: number;
    priceWithTax: number;
    taxRate: number;
    taxLines?: Record<string, any>;
}

export interface UpdateSurchargeData {
    description?: string;
    sku?: string | null;
    listPrice?: number;
    listPriceIncludesTax?: boolean;
    price?: number;
    priceWithTax?: number;
    taxRate?: number;
    taxLines?: Record<string, any>;
}

/**
 * Default include for loading Surcharge relations
 */
const DEFAULT_SURCHARGE_INCLUDE = {
    order: true,
} satisfies Prisma.SurchargeInclude;

@Injectable()
export class SurchargePrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Find a single surcharge by ID
     */
    async findOne(id: ID, includeRelations: boolean = true): Promise<any | undefined> {
        const include = includeRelations ? DEFAULT_SURCHARGE_INCLUDE : undefined;

        const surcharge = await this.prisma.surcharge.findUnique({
            where: { id: String(id) },
            include,
        });

        return surcharge || undefined;
    }

    /**
     * Find all surcharges with pagination and filtering
     */
    async findAll(options: SurchargeListOptions = {}): Promise<PaginatedList<any>> {
        const { skip = 0, take = 10, filter, sort } = options;

        // Build where clause
        const where: Prisma.SurchargeWhereInput = {};

        if (filter?.orderId) {
            where.orderId = filter.orderId;
        }

        if (filter?.description) {
            where.description = {
                contains: filter.description,
                mode: 'insensitive',
            };
        }

        // Build orderBy
        let orderBy: Prisma.SurchargeOrderByWithRelationInput = {
            createdAt: 'desc',
        };

        if (sort?.field) {
            orderBy = {
                [sort.field]: sort.order || 'asc',
            };
        }

        // Execute query
        const [items, totalItems] = await Promise.all([
            this.prisma.surcharge.findMany({
                where,
                include: DEFAULT_SURCHARGE_INCLUDE,
                skip,
                take,
                orderBy,
            }),
            this.prisma.surcharge.count({ where }),
        ]);

        return {
            items,
            totalItems,
        };
    }

    /**
     * Find surcharges by order ID
     */
    async findByOrder(orderId: ID): Promise<any[]> {
        const surcharges = await this.prisma.surcharge.findMany({
            where: {
                orderId: String(orderId),
            },
            include: DEFAULT_SURCHARGE_INCLUDE,
        });

        return surcharges;
    }

    /**
     * Create a new surcharge
     */
    async create(data: CreateSurchargeData): Promise<any> {
        const surcharge = await this.prisma.surcharge.create({
            data: {
                orderId: data.orderId,
                description: data.description,
                sku: data.sku,
                listPrice: data.listPrice,
                listPriceIncludesTax: data.listPriceIncludesTax,
                price: data.price,
                priceWithTax: data.priceWithTax,
                taxRate: data.taxRate,
                taxLines: data.taxLines as Prisma.JsonValue,
            },
            include: DEFAULT_SURCHARGE_INCLUDE,
        });

        return surcharge;
    }

    /**
     * Update an existing surcharge
     */
    async update(id: ID, data: UpdateSurchargeData): Promise<any> {
        const updateData: Prisma.SurchargeUpdateInput = {};

        if (data.description !== undefined) {
            updateData.description = data.description;
        }

        if (data.sku !== undefined) {
            updateData.sku = data.sku;
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

        if (data.taxRate !== undefined) {
            updateData.taxRate = data.taxRate;
        }

        if (data.taxLines !== undefined) {
            updateData.taxLines = data.taxLines as Prisma.JsonValue;
        }

        const surcharge = await this.prisma.surcharge.update({
            where: { id: String(id) },
            data: updateData,
            include: DEFAULT_SURCHARGE_INCLUDE,
        });

        return surcharge;
    }

    /**
     * Delete a surcharge
     */
    async delete(id: ID): Promise<void> {
        await this.prisma.surcharge.delete({
            where: { id: String(id) },
        });
    }
}
