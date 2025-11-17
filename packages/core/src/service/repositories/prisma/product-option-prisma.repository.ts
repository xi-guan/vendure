/**
 * @description
 * Prisma-based repository for ProductOption entity operations.
 * Handles CRUD operations for ProductOptions with their relations (group, translations, variants).
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { PrismaService } from '../../../connection/prisma.service';

export interface ProductOptionListOptions {
    skip?: number;
    take?: number;
    filter?: {
        code?: string;
        groupId?: string;
    };
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreateProductOptionData {
    code: string;
    groupId: string;
    customFields?: Record<string, any>;
}

export interface UpdateProductOptionData {
    code?: string;
    customFields?: Record<string, any>;
}

/**
 * Default include for loading ProductOption relations
 */
const DEFAULT_PRODUCT_OPTION_INCLUDE = {
    group: {
        include: {
            translations: true,
        },
    },
    translations: true,
    variants: {
        include: {
            productVariant: true,
        },
    },
} satisfies Prisma.ProductOptionInclude;

@Injectable()
export class ProductOptionPrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Find a single product option by ID
     */
    async findOne(id: ID, includeRelations: boolean = true): Promise<any | undefined> {
        const include = includeRelations ? DEFAULT_PRODUCT_OPTION_INCLUDE : undefined;

        const productOption = await this.prisma.productOption.findUnique({
            where: { id: String(id) },
            include,
        });

        return productOption || undefined;
    }

    /**
     * Find all product options with pagination and filtering
     */
    async findAll(options: ProductOptionListOptions = {}): Promise<PaginatedList<any>> {
        const { skip = 0, take = 10, filter, sort } = options;

        // Build where clause
        const where: Prisma.ProductOptionWhereInput = {
            deletedAt: null,
        };

        if (filter?.code) {
            where.code = {
                contains: filter.code,
                mode: 'insensitive',
            };
        }

        if (filter?.groupId) {
            where.groupId = filter.groupId;
        }

        // Build orderBy
        let orderBy: Prisma.ProductOptionOrderByWithRelationInput = {
            createdAt: 'desc',
        };

        if (sort?.field) {
            orderBy = {
                [sort.field]: sort.order || 'asc',
            };
        }

        // Execute query
        const [items, totalItems] = await Promise.all([
            this.prisma.productOption.findMany({
                where,
                include: DEFAULT_PRODUCT_OPTION_INCLUDE,
                skip,
                take,
                orderBy,
            }),
            this.prisma.productOption.count({ where }),
        ]);

        return {
            items,
            totalItems,
        };
    }

    /**
     * Find product options by group ID
     */
    async findByGroup(groupId: ID): Promise<any[]> {
        const productOptions = await this.prisma.productOption.findMany({
            where: {
                groupId: String(groupId),
                deletedAt: null,
            },
            include: DEFAULT_PRODUCT_OPTION_INCLUDE,
        });

        return productOptions;
    }

    /**
     * Find product option by code
     */
    async findByCode(code: string): Promise<any | undefined> {
        const productOption = await this.prisma.productOption.findFirst({
            where: {
                code,
                deletedAt: null,
            },
            include: DEFAULT_PRODUCT_OPTION_INCLUDE,
        });

        return productOption || undefined;
    }

    /**
     * Create a new product option
     */
    async create(data: CreateProductOptionData): Promise<any> {
        const productOption = await this.prisma.productOption.create({
            data: {
                code: data.code,
                groupId: data.groupId,
                customFields: data.customFields as Prisma.JsonValue,
            },
            include: DEFAULT_PRODUCT_OPTION_INCLUDE,
        });

        return productOption;
    }

    /**
     * Update an existing product option
     */
    async update(id: ID, data: UpdateProductOptionData): Promise<any> {
        const updateData: Prisma.ProductOptionUpdateInput = {};

        if (data.code !== undefined) {
            updateData.code = data.code;
        }

        if (data.customFields !== undefined) {
            updateData.customFields = data.customFields as Prisma.JsonValue;
        }

        const productOption = await this.prisma.productOption.update({
            where: { id: String(id) },
            data: updateData,
            include: DEFAULT_PRODUCT_OPTION_INCLUDE,
        });

        return productOption;
    }

    /**
     * Soft delete a product option
     */
    async softDelete(id: ID): Promise<void> {
        await this.prisma.productOption.update({
            where: { id: String(id) },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    /**
     * Restore a soft-deleted product option
     */
    async restore(id: ID): Promise<any> {
        const productOption = await this.prisma.productOption.update({
            where: { id: String(id) },
            data: {
                deletedAt: null,
            },
            include: DEFAULT_PRODUCT_OPTION_INCLUDE,
        });

        return productOption;
    }

    // =========================================================================
    // Translation Management
    // =========================================================================

    /**
     * Add or update a translation for a product option
     */
    async upsertTranslation(
        optionId: ID,
        languageCode: string,
        data: { name: string },
    ): Promise<any> {
        const translation = await this.prisma.productOptionTranslation.upsert({
            where: {
                languageCode_optionId: {
                    languageCode,
                    optionId: String(optionId),
                },
            },
            create: {
                languageCode,
                optionId: String(optionId),
                name: data.name,
            },
            update: {
                name: data.name,
            },
        });

        return translation;
    }

    /**
     * Get all translations for a product option
     */
    async getTranslations(optionId: ID): Promise<any[]> {
        const translations = await this.prisma.productOptionTranslation.findMany({
            where: {
                optionId: String(optionId),
            },
        });

        return translations;
    }
}
