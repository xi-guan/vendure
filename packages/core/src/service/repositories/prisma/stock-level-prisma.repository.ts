/**
 * @description
 * Prisma-based repository for StockLevel entity operations.
 * Handles CRUD operations for StockLevels with their relations (productVariant, stockLocation).
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { PrismaService } from '../../../connection/prisma.service';

export interface StockLevelListOptions {
    skip?: number;
    take?: number;
    filter?: {
        productVariantId?: string;
        stockLocationId?: string;
    };
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreateStockLevelData {
    productVariantId: string;
    stockLocationId: string;
    stockOnHand?: number;
    stockAllocated?: number;
}

export interface UpdateStockLevelData {
    stockOnHand?: number;
    stockAllocated?: number;
}

/**
 * Default include for loading StockLevel relations
 */
const DEFAULT_STOCK_LEVEL_INCLUDE = {
    productVariant: {
        include: {
            translations: true,
        },
    },
    stockLocation: true,
} satisfies Prisma.StockLevelInclude;

@Injectable()
export class StockLevelPrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Find a single stock level by ID
     */
    async findOne(id: ID, includeRelations: boolean = true): Promise<any | undefined> {
        const include = includeRelations ? DEFAULT_STOCK_LEVEL_INCLUDE : undefined;

        const stockLevel = await this.prisma.stockLevel.findUnique({
            where: { id: String(id) },
            include,
        });

        return stockLevel || undefined;
    }

    /**
     * Find stock level by variant and location
     */
    async findByVariantAndLocation(
        productVariantId: ID,
        stockLocationId: ID,
    ): Promise<any | undefined> {
        const stockLevel = await this.prisma.stockLevel.findUnique({
            where: {
                productVariantId_stockLocationId: {
                    productVariantId: String(productVariantId),
                    stockLocationId: String(stockLocationId),
                },
            },
            include: DEFAULT_STOCK_LEVEL_INCLUDE,
        });

        return stockLevel || undefined;
    }

    /**
     * Find all stock levels with pagination and filtering
     */
    async findAll(options: StockLevelListOptions = {}): Promise<PaginatedList<any>> {
        const { skip = 0, take = 10, filter, sort } = options;

        // Build where clause
        const where: Prisma.StockLevelWhereInput = {};

        if (filter?.productVariantId) {
            where.productVariantId = filter.productVariantId;
        }

        if (filter?.stockLocationId) {
            where.stockLocationId = filter.stockLocationId;
        }

        // Build orderBy
        let orderBy: Prisma.StockLevelOrderByWithRelationInput = {
            createdAt: 'desc',
        };

        if (sort?.field) {
            orderBy = {
                [sort.field]: sort.order || 'asc',
            };
        }

        // Execute query
        const [items, totalItems] = await Promise.all([
            this.prisma.stockLevel.findMany({
                where,
                include: DEFAULT_STOCK_LEVEL_INCLUDE,
                skip,
                take,
                orderBy,
            }),
            this.prisma.stockLevel.count({ where }),
        ]);

        return {
            items,
            totalItems,
        };
    }

    /**
     * Find stock levels by product variant ID
     */
    async findByVariant(productVariantId: ID): Promise<any[]> {
        const stockLevels = await this.prisma.stockLevel.findMany({
            where: {
                productVariantId: String(productVariantId),
            },
            include: DEFAULT_STOCK_LEVEL_INCLUDE,
        });

        return stockLevels;
    }

    /**
     * Find stock levels by stock location ID
     */
    async findByLocation(stockLocationId: ID): Promise<any[]> {
        const stockLevels = await this.prisma.stockLevel.findMany({
            where: {
                stockLocationId: String(stockLocationId),
            },
            include: DEFAULT_STOCK_LEVEL_INCLUDE,
        });

        return stockLevels;
    }

    /**
     * Create a new stock level
     */
    async create(data: CreateStockLevelData): Promise<any> {
        const stockLevel = await this.prisma.stockLevel.create({
            data: {
                productVariantId: data.productVariantId,
                stockLocationId: data.stockLocationId,
                stockOnHand: data.stockOnHand ?? 0,
                stockAllocated: data.stockAllocated ?? 0,
            },
            include: DEFAULT_STOCK_LEVEL_INCLUDE,
        });

        return stockLevel;
    }

    /**
     * Update an existing stock level
     */
    async update(id: ID, data: UpdateStockLevelData): Promise<any> {
        const updateData: Prisma.StockLevelUpdateInput = {};

        if (data.stockOnHand !== undefined) {
            updateData.stockOnHand = data.stockOnHand;
        }

        if (data.stockAllocated !== undefined) {
            updateData.stockAllocated = data.stockAllocated;
        }

        const stockLevel = await this.prisma.stockLevel.update({
            where: { id: String(id) },
            data: updateData,
            include: DEFAULT_STOCK_LEVEL_INCLUDE,
        });

        return stockLevel;
    }

    /**
     * Delete a stock level
     */
    async delete(id: ID): Promise<void> {
        await this.prisma.stockLevel.delete({
            where: { id: String(id) },
        });
    }

    /**
     * Adjust stock on hand by a delta amount
     */
    async adjustStockOnHand(id: ID, delta: number): Promise<any> {
        const stockLevel = await this.prisma.stockLevel.update({
            where: { id: String(id) },
            data: {
                stockOnHand: {
                    increment: delta,
                },
            },
            include: DEFAULT_STOCK_LEVEL_INCLUDE,
        });

        return stockLevel;
    }

    /**
     * Adjust stock allocated by a delta amount
     */
    async adjustStockAllocated(id: ID, delta: number): Promise<any> {
        const stockLevel = await this.prisma.stockLevel.update({
            where: { id: String(id) },
            data: {
                stockAllocated: {
                    increment: delta,
                },
            },
            include: DEFAULT_STOCK_LEVEL_INCLUDE,
        });

        return stockLevel;
    }

    /**
     * Get available stock (stockOnHand - stockAllocated)
     */
    async getAvailableStock(id: ID): Promise<number> {
        const stockLevel = await this.prisma.stockLevel.findUnique({
            where: { id: String(id) },
            select: {
                stockOnHand: true,
                stockAllocated: true,
            },
        });

        if (!stockLevel) {
            return 0;
        }

        return stockLevel.stockOnHand - stockLevel.stockAllocated;
    }
}
