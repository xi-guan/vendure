/**
 * @description
 * Prisma-based repository for FacetValue entity operations.
 * Handles CRUD operations for FacetValues with their relations (facet, translations, products, variants, channels).
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { PrismaService } from '../../../connection/prisma.service';

export interface FacetValueListOptions {
    skip?: number;
    take?: number;
    filter?: {
        code?: string;
        facetId?: string;
    };
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreateFacetValueData {
    code: string;
    facetId: string;
    customFields?: Record<string, any>;
}

export interface UpdateFacetValueData {
    code?: string;
    customFields?: Record<string, any>;
}

/**
 * Default include for loading FacetValue relations
 */
const DEFAULT_FACET_VALUE_INCLUDE = {
    facet: {
        include: {
            translations: true,
        },
    },
    translations: true,
    products: {
        include: {
            product: {
                include: {
                    translations: true,
                },
            },
        },
    },
    variants: {
        include: {
            productVariant: {
                include: {
                    translations: true,
                },
            },
        },
    },
    channels: {
        include: {
            channel: true,
        },
    },
} satisfies Prisma.FacetValueInclude;

@Injectable()
export class FacetValuePrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Find a single facet value by ID
     */
    async findOne(id: ID, includeRelations: boolean = true): Promise<any | undefined> {
        const include = includeRelations ? DEFAULT_FACET_VALUE_INCLUDE : undefined;

        const facetValue = await this.prisma.facetValue.findUnique({
            where: { id: String(id) },
            include,
        });

        return facetValue || undefined;
    }

    /**
     * Find all facet values with pagination and filtering
     */
    async findAll(options: FacetValueListOptions = {}): Promise<PaginatedList<any>> {
        const { skip = 0, take = 10, filter, sort } = options;

        // Build where clause
        const where: Prisma.FacetValueWhereInput = {};

        if (filter?.code) {
            where.code = {
                contains: filter.code,
                mode: 'insensitive',
            };
        }

        if (filter?.facetId) {
            where.facetId = filter.facetId;
        }

        // Build orderBy
        let orderBy: Prisma.FacetValueOrderByWithRelationInput = {
            createdAt: 'desc',
        };

        if (sort?.field) {
            orderBy = {
                [sort.field]: sort.order || 'asc',
            };
        }

        // Execute query
        const [items, totalItems] = await Promise.all([
            this.prisma.facetValue.findMany({
                where,
                include: DEFAULT_FACET_VALUE_INCLUDE,
                skip,
                take,
                orderBy,
            }),
            this.prisma.facetValue.count({ where }),
        ]);

        return {
            items,
            totalItems,
        };
    }

    /**
     * Find facet values by facet ID
     */
    async findByFacet(facetId: ID): Promise<any[]> {
        const facetValues = await this.prisma.facetValue.findMany({
            where: {
                facetId: String(facetId),
            },
            include: DEFAULT_FACET_VALUE_INCLUDE,
        });

        return facetValues;
    }

    /**
     * Find facet value by code and facet ID
     */
    async findByCodeAndFacet(code: string, facetId: ID): Promise<any | undefined> {
        const facetValue = await this.prisma.facetValue.findUnique({
            where: {
                facetId_code: {
                    facetId: String(facetId),
                    code,
                },
            },
            include: DEFAULT_FACET_VALUE_INCLUDE,
        });

        return facetValue || undefined;
    }

    /**
     * Create a new facet value
     */
    async create(data: CreateFacetValueData): Promise<any> {
        const facetValue = await this.prisma.facetValue.create({
            data: {
                code: data.code,
                facetId: data.facetId,
                customFields: data.customFields as Prisma.JsonValue,
            },
            include: DEFAULT_FACET_VALUE_INCLUDE,
        });

        return facetValue;
    }

    /**
     * Update an existing facet value
     */
    async update(id: ID, data: UpdateFacetValueData): Promise<any> {
        const updateData: Prisma.FacetValueUpdateInput = {};

        if (data.code !== undefined) {
            updateData.code = data.code;
        }

        if (data.customFields !== undefined) {
            updateData.customFields = data.customFields as Prisma.JsonValue;
        }

        const facetValue = await this.prisma.facetValue.update({
            where: { id: String(id) },
            data: updateData,
            include: DEFAULT_FACET_VALUE_INCLUDE,
        });

        return facetValue;
    }

    /**
     * Delete a facet value
     */
    async delete(id: ID): Promise<void> {
        await this.prisma.facetValue.delete({
            where: { id: String(id) },
        });
    }

    // =========================================================================
    // Translation Management
    // =========================================================================

    /**
     * Add or update a translation for a facet value
     */
    async upsertTranslation(
        facetValueId: ID,
        languageCode: string,
        data: { name: string },
    ): Promise<any> {
        const translation = await this.prisma.facetValueTranslation.upsert({
            where: {
                languageCode_facetValueId: {
                    languageCode,
                    facetValueId: String(facetValueId),
                },
            },
            create: {
                languageCode,
                facetValueId: String(facetValueId),
                name: data.name,
            },
            update: {
                name: data.name,
            },
        });

        return translation;
    }

    /**
     * Get all translations for a facet value
     */
    async getTranslations(facetValueId: ID): Promise<any[]> {
        const translations = await this.prisma.facetValueTranslation.findMany({
            where: {
                facetValueId: String(facetValueId),
            },
        });

        return translations;
    }

    // =========================================================================
    // Product Management
    // =========================================================================

    /**
     * Add facet value to a product
     */
    async addToProduct(facetValueId: ID, productId: ID): Promise<void> {
        await this.prisma.productFacetValue.create({
            data: {
                facetValueId: String(facetValueId),
                productId: String(productId),
            },
        });
    }

    /**
     * Remove facet value from a product
     */
    async removeFromProduct(facetValueId: ID, productId: ID): Promise<void> {
        await this.prisma.productFacetValue.delete({
            where: {
                productId_facetValueId: {
                    productId: String(productId),
                    facetValueId: String(facetValueId),
                },
            },
        });
    }

    // =========================================================================
    // Variant Management
    // =========================================================================

    /**
     * Add facet value to a product variant
     */
    async addToVariant(facetValueId: ID, variantId: ID): Promise<void> {
        await this.prisma.productVariantFacetValue.create({
            data: {
                facetValueId: String(facetValueId),
                productVariantId: String(variantId),
            },
        });
    }

    /**
     * Remove facet value from a product variant
     */
    async removeFromVariant(facetValueId: ID, variantId: ID): Promise<void> {
        await this.prisma.productVariantFacetValue.delete({
            where: {
                productVariantId_facetValueId: {
                    productVariantId: String(variantId),
                    facetValueId: String(facetValueId),
                },
            },
        });
    }

    // =========================================================================
    // Channel Management
    // =========================================================================

    /**
     * Add facet value to a channel
     */
    async addToChannel(facetValueId: ID, channelId: ID): Promise<void> {
        await this.prisma.facetValueChannel.create({
            data: {
                facetValueId: String(facetValueId),
                channelId: String(channelId),
            },
        });
    }

    /**
     * Remove facet value from a channel
     */
    async removeFromChannel(facetValueId: ID, channelId: ID): Promise<void> {
        await this.prisma.facetValueChannel.delete({
            where: {
                facetValueId_channelId: {
                    facetValueId: String(facetValueId),
                    channelId: String(channelId),
                },
            },
        });
    }
}
