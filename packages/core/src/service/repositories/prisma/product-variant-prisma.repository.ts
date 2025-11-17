/**
 * @description
 * Prisma-based repository for ProductVariant entity operations.
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { PrismaService } from '../../../connection/prisma.service';

export interface CreateProductVariantData {
    sku: string;
    name: string;
    enabled: boolean;
    productId: ID;
    price: number;
    taxCategoryId?: ID;
    stockOnHand?: number;
    trackInventory?: boolean;
    customFields?: Record<string, any>;
}

export interface UpdateProductVariantData {
    sku?: string;
    name?: string;
    enabled?: boolean;
    price?: number;
    taxCategoryId?: ID;
    stockOnHand?: number;
    trackInventory?: boolean;
    customFields?: Record<string, any>;
}

export interface ProductVariantListOptions {
    skip?: number;
    take?: number;
    filter?: {
        productId?: ID;
        enabled?: boolean;
        sku?: string;
    };
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

const DEFAULT_PRODUCT_VARIANT_INCLUDE = {
    product: true,
    taxCategory: true,
    options: {
        include: {
            productOption: {
                include: {
                    group: true,
                },
            },
        },
    },
    assets: {
        include: {
            asset: true,
        },
        orderBy: {
            position: 'asc' as const,
        },
    },
    facetValues: {
        include: {
            facetValue: {
                include: {
                    facet: true,
                },
            },
        },
    },
    prices: true,
    channels: {
        include: {
            channel: true,
        },
    },
} satisfies Prisma.ProductVariantInclude;

@Injectable()
export class ProductVariantPrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findOne(id: ID, includeRelations: boolean = true): Promise<any | undefined> {
        const include = includeRelations ? DEFAULT_PRODUCT_VARIANT_INCLUDE : undefined;

        const variant = await this.prisma.productVariant.findUnique({
            where: {
                id: String(id),
                deletedAt: null,
            },
            include,
        });

        return variant || undefined;
    }

    async findBySku(sku: string, includeRelations: boolean = true): Promise<any | undefined> {
        const include = includeRelations ? DEFAULT_PRODUCT_VARIANT_INCLUDE : undefined;

        const variant = await this.prisma.productVariant.findFirst({
            where: {
                sku,
                deletedAt: null,
            },
            include,
        });

        return variant || undefined;
    }

    async findByProductId(
        productId: ID,
        options?: ProductVariantListOptions,
    ): Promise<PaginatedList<any>> {
        const skip = options?.skip || 0;
        const take = options?.take || 50;

        const [items, total] = await Promise.all([
            this.prisma.productVariant.findMany({
                where: {
                    productId: String(productId),
                    deletedAt: null,
                },
                skip,
                take,
                include: DEFAULT_PRODUCT_VARIANT_INCLUDE,
            }),
            this.prisma.productVariant.count({
                where: {
                    productId: String(productId),
                    deletedAt: null,
                },
            }),
        ]);

        return {
            items,
            totalItems: total,
        };
    }

    async findAll(options: ProductVariantListOptions): Promise<PaginatedList<any>> {
        const skip = options.skip || 0;
        const take = options.take || 10;

        const where: Prisma.ProductVariantWhereInput = {
            deletedAt: null,
        };

        if (options.filter) {
            if (options.filter.productId) {
                where.productId = String(options.filter.productId);
            }
            if (options.filter.enabled !== undefined) {
                where.enabled = options.filter.enabled;
            }
            if (options.filter.sku) {
                where.sku = { contains: options.filter.sku, mode: 'insensitive' };
            }
        }

        const [items, total] = await Promise.all([
            this.prisma.productVariant.findMany({
                where,
                skip,
                take,
                include: DEFAULT_PRODUCT_VARIANT_INCLUDE,
            }),
            this.prisma.productVariant.count({ where }),
        ]);

        return {
            items,
            totalItems: total,
        };
    }

    async create(data: CreateProductVariantData): Promise<any> {
        const variant = await this.prisma.productVariant.create({
            data: {
                sku: data.sku,
                name: data.name,
                enabled: data.enabled,
                productId: String(data.productId),
                taxCategoryId: data.taxCategoryId ? String(data.taxCategoryId) : null,
                stockOnHand: data.stockOnHand ?? 0,
                trackInventory: data.trackInventory ?? true,
                customFields: data.customFields as Prisma.JsonValue,
            },
            include: DEFAULT_PRODUCT_VARIANT_INCLUDE,
        });

        return variant;
    }

    async update(id: ID, data: UpdateProductVariantData): Promise<any> {
        const updateData: Prisma.ProductVariantUpdateInput = {};

        if (data.sku !== undefined) updateData.sku = data.sku;
        if (data.name !== undefined) updateData.name = data.name;
        if (data.enabled !== undefined) updateData.enabled = data.enabled;
        if (data.price !== undefined) updateData.price = data.price;
        if (data.stockOnHand !== undefined) updateData.stockOnHand = data.stockOnHand;
        if (data.trackInventory !== undefined) updateData.trackInventory = data.trackInventory;
        if (data.customFields !== undefined) updateData.customFields = data.customFields as Prisma.JsonValue;

        if (data.taxCategoryId !== undefined) {
            updateData.taxCategory = data.taxCategoryId
                ? { connect: { id: String(data.taxCategoryId) } }
                : { disconnect: true };
        }

        const variant = await this.prisma.productVariant.update({
            where: { id: String(id) },
            data: updateData,
            include: DEFAULT_PRODUCT_VARIANT_INCLUDE,
        });

        return variant;
    }

    async delete(id: ID): Promise<void> {
        await this.prisma.productVariant.update({
            where: { id: String(id) },
            data: { deletedAt: new Date() },
        });
    }

    async adjustStockOnHand(id: ID, adjustment: number): Promise<any> {
        const variant = await this.prisma.productVariant.update({
            where: { id: String(id) },
            data: {
                stockOnHand: {
                    increment: adjustment,
                },
            },
            include: DEFAULT_PRODUCT_VARIANT_INCLUDE,
        });

        return variant;
    }

    async setStockOnHand(id: ID, stockOnHand: number): Promise<any> {
        const variant = await this.prisma.productVariant.update({
            where: { id: String(id) },
            data: { stockOnHand },
            include: DEFAULT_PRODUCT_VARIANT_INCLUDE,
        });

        return variant;
    }

    async getStockLevel(id: ID): Promise<number> {
        const variant = await this.prisma.productVariant.findUnique({
            where: { id: String(id) },
            select: { stockOnHand: true },
        });

        return variant?.stockOnHand || 0;
    }

    async isInStock(id: ID, quantity: number = 1): Promise<boolean> {
        const variant = await this.prisma.productVariant.findUnique({
            where: { id: String(id) },
            select: {
                stockOnHand: true,
                trackInventory: true,
            },
        });

        if (!variant || !variant.trackInventory) {
            return true;
        }

        return variant.stockOnHand >= quantity;
    }
}
