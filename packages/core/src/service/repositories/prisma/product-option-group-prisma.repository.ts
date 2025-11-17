/**
 * @description
 * Prisma-based repository for ProductOptionGroup entity operations.
 * Handles CRUD operations for ProductOptionGroups with their relations (product, options, translations).
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { PrismaService } from '../../../connection/prisma.service';

export interface ProductOptionGroupListOptions {
    skip?: number;
    take?: number;
    filter?: {
        code?: string;
        productId?: string;
    };
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreateProductOptionGroupData {
    code: string;
    productId: string;
    customFields?: Record<string, any>;
}

export interface UpdateProductOptionGroupData {
    code?: string;
    customFields?: Record<string, any>;
}

/**
 * Default include for loading ProductOptionGroup relations
 */
const DEFAULT_PRODUCT_OPTION_GROUP_INCLUDE = {
    product: {
        include: {
            translations: true,
        },
    },
    options: {
        include: {
            translations: true,
        },
    },
    translations: true,
} satisfies Prisma.ProductOptionGroupInclude;

@Injectable()
export class ProductOptionGroupPrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Find a single product option group by ID
     */
    async findOne(id: ID, includeRelations: boolean = true): Promise<any | undefined> {
        const include = includeRelations ? DEFAULT_PRODUCT_OPTION_GROUP_INCLUDE : undefined;

        const productOptionGroup = await this.prisma.productOptionGroup.findUnique({
            where: { id: String(id) },
            include,
        });

        return productOptionGroup || undefined;
    }

    /**
     * Find all product option groups with pagination and filtering
     */
    async findAll(options: ProductOptionGroupListOptions = {}): Promise<PaginatedList<any>> {
        const { skip = 0, take = 10, filter, sort } = options;

        // Build where clause
        const where: Prisma.ProductOptionGroupWhereInput = {
            deletedAt: null,
        };

        if (filter?.code) {
            where.code = {
                contains: filter.code,
                mode: 'insensitive',
            };
        }

        if (filter?.productId) {
            where.productId = filter.productId;
        }

        // Build orderBy
        let orderBy: Prisma.ProductOptionGroupOrderByWithRelationInput = {
            createdAt: 'desc',
        };

        if (sort?.field) {
            orderBy = {
                [sort.field]: sort.order || 'asc',
            };
        }

        // Execute query
        const [items, totalItems] = await Promise.all([
            this.prisma.productOptionGroup.findMany({
                where,
                include: DEFAULT_PRODUCT_OPTION_GROUP_INCLUDE,
                skip,
                take,
                orderBy,
            }),
            this.prisma.productOptionGroup.count({ where }),
        ]);

        return {
            items,
            totalItems,
        };
    }

    /**
     * Find product option groups by product ID
     */
    async findByProduct(productId: ID): Promise<any[]> {
        const productOptionGroups = await this.prisma.productOptionGroup.findMany({
            where: {
                productId: String(productId),
                deletedAt: null,
            },
            include: DEFAULT_PRODUCT_OPTION_GROUP_INCLUDE,
        });

        return productOptionGroups;
    }

    /**
     * Find product option group by code
     */
    async findByCode(code: string): Promise<any | undefined> {
        const productOptionGroup = await this.prisma.productOptionGroup.findFirst({
            where: {
                code,
                deletedAt: null,
            },
            include: DEFAULT_PRODUCT_OPTION_GROUP_INCLUDE,
        });

        return productOptionGroup || undefined;
    }

    /**
     * Create a new product option group
     */
    async create(data: CreateProductOptionGroupData): Promise<any> {
        const productOptionGroup = await this.prisma.productOptionGroup.create({
            data: {
                code: data.code,
                productId: data.productId,
                customFields: data.customFields as Prisma.JsonValue,
            },
            include: DEFAULT_PRODUCT_OPTION_GROUP_INCLUDE,
        });

        return productOptionGroup;
    }

    /**
     * Update an existing product option group
     */
    async update(id: ID, data: UpdateProductOptionGroupData): Promise<any> {
        const updateData: Prisma.ProductOptionGroupUpdateInput = {};

        if (data.code !== undefined) {
            updateData.code = data.code;
        }

        if (data.customFields !== undefined) {
            updateData.customFields = data.customFields as Prisma.JsonValue;
        }

        const productOptionGroup = await this.prisma.productOptionGroup.update({
            where: { id: String(id) },
            data: updateData,
            include: DEFAULT_PRODUCT_OPTION_GROUP_INCLUDE,
        });

        return productOptionGroup;
    }

    /**
     * Soft delete a product option group
     */
    async softDelete(id: ID): Promise<void> {
        await this.prisma.productOptionGroup.update({
            where: { id: String(id) },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    /**
     * Restore a soft-deleted product option group
     */
    async restore(id: ID): Promise<any> {
        const productOptionGroup = await this.prisma.productOptionGroup.update({
            where: { id: String(id) },
            data: {
                deletedAt: null,
            },
            include: DEFAULT_PRODUCT_OPTION_GROUP_INCLUDE,
        });

        return productOptionGroup;
    }

    // =========================================================================
    // Translation Management
    // =========================================================================

    /**
     * Add or update a translation for a product option group
     */
    async upsertTranslation(
        groupId: ID,
        languageCode: string,
        data: { name: string },
    ): Promise<any> {
        const translation = await this.prisma.productOptionGroupTranslation.upsert({
            where: {
                languageCode_groupId: {
                    languageCode,
                    groupId: String(groupId),
                },
            },
            create: {
                languageCode,
                groupId: String(groupId),
                name: data.name,
            },
            update: {
                name: data.name,
            },
        });

        return translation;
    }

    /**
     * Get all translations for a product option group
     */
    async getTranslations(groupId: ID): Promise<any[]> {
        const translations = await this.prisma.productOptionGroupTranslation.findMany({
            where: {
                groupId: String(groupId),
            },
        });

        return translations;
    }
}
