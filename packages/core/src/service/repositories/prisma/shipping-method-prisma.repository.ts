/**
 * @description
 * Prisma-based repository for ShippingMethod entity operations.
 * Handles CRUD operations for ShippingMethods with their relations (translations, channels, shippingLines).
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { PrismaService } from '../../../connection/prisma.service';

export interface ShippingMethodListOptions {
    skip?: number;
    take?: number;
    filter?: {
        code?: string;
        name?: string;
    };
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreateShippingMethodData {
    code: string;
    name: string;
    description?: string;
    checker: Record<string, any>;
    calculator: Record<string, any>;
    fulfillmentHandlerCode: string;
    customFields?: Record<string, any>;
}

export interface UpdateShippingMethodData {
    code?: string;
    name?: string;
    description?: string;
    checker?: Record<string, any>;
    calculator?: Record<string, any>;
    fulfillmentHandlerCode?: string;
    customFields?: Record<string, any>;
}

/**
 * Default include for loading ShippingMethod relations
 */
const DEFAULT_SHIPPING_METHOD_INCLUDE = {
    translations: true,
    channels: {
        include: {
            channel: true,
        },
    },
    shippingLines: true,
} satisfies Prisma.ShippingMethodInclude;

@Injectable()
export class ShippingMethodPrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Find a single shipping method by ID
     */
    async findOne(id: ID, includeRelations: boolean = true): Promise<any | undefined> {
        const include = includeRelations ? DEFAULT_SHIPPING_METHOD_INCLUDE : undefined;

        const shippingMethod = await this.prisma.shippingMethod.findUnique({
            where: { id: String(id) },
            include,
        });

        return shippingMethod || undefined;
    }

    /**
     * Find a shipping method by code
     */
    async findByCode(code: string): Promise<any | undefined> {
        const shippingMethod = await this.prisma.shippingMethod.findUnique({
            where: { code },
            include: DEFAULT_SHIPPING_METHOD_INCLUDE,
        });

        return shippingMethod || undefined;
    }

    /**
     * Find all shipping methods with pagination and filtering
     */
    async findAll(options: ShippingMethodListOptions = {}): Promise<PaginatedList<any>> {
        const { skip = 0, take = 10, filter, sort } = options;

        // Build where clause
        const where: Prisma.ShippingMethodWhereInput = {
            deletedAt: null,
        };

        if (filter?.code) {
            where.code = {
                contains: filter.code,
                mode: 'insensitive',
            };
        }

        if (filter?.name) {
            where.name = {
                contains: filter.name,
                mode: 'insensitive',
            };
        }

        // Build orderBy
        let orderBy: Prisma.ShippingMethodOrderByWithRelationInput = {
            createdAt: 'desc',
        };

        if (sort?.field) {
            orderBy = {
                [sort.field]: sort.order || 'asc',
            };
        }

        // Execute query
        const [items, totalItems] = await Promise.all([
            this.prisma.shippingMethod.findMany({
                where,
                include: DEFAULT_SHIPPING_METHOD_INCLUDE,
                skip,
                take,
                orderBy,
            }),
            this.prisma.shippingMethod.count({ where }),
        ]);

        return {
            items,
            totalItems,
        };
    }

    /**
     * Create a new shipping method
     */
    async create(data: CreateShippingMethodData): Promise<any> {
        const shippingMethod = await this.prisma.shippingMethod.create({
            data: {
                code: data.code,
                name: data.name,
                description: data.description || '',
                checker: data.checker as Prisma.JsonValue,
                calculator: data.calculator as Prisma.JsonValue,
                fulfillmentHandlerCode: data.fulfillmentHandlerCode,
                customFields: data.customFields as Prisma.JsonValue,
            },
            include: DEFAULT_SHIPPING_METHOD_INCLUDE,
        });

        return shippingMethod;
    }

    /**
     * Update an existing shipping method
     */
    async update(id: ID, data: UpdateShippingMethodData): Promise<any> {
        const updateData: Prisma.ShippingMethodUpdateInput = {};

        if (data.code !== undefined) {
            updateData.code = data.code;
        }

        if (data.name !== undefined) {
            updateData.name = data.name;
        }

        if (data.description !== undefined) {
            updateData.description = data.description;
        }

        if (data.checker !== undefined) {
            updateData.checker = data.checker as Prisma.JsonValue;
        }

        if (data.calculator !== undefined) {
            updateData.calculator = data.calculator as Prisma.JsonValue;
        }

        if (data.fulfillmentHandlerCode !== undefined) {
            updateData.fulfillmentHandlerCode = data.fulfillmentHandlerCode;
        }

        if (data.customFields !== undefined) {
            updateData.customFields = data.customFields as Prisma.JsonValue;
        }

        const shippingMethod = await this.prisma.shippingMethod.update({
            where: { id: String(id) },
            data: updateData,
            include: DEFAULT_SHIPPING_METHOD_INCLUDE,
        });

        return shippingMethod;
    }

    /**
     * Soft delete a shipping method
     */
    async softDelete(id: ID): Promise<void> {
        await this.prisma.shippingMethod.update({
            where: { id: String(id) },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    /**
     * Restore a soft-deleted shipping method
     */
    async restore(id: ID): Promise<any> {
        const shippingMethod = await this.prisma.shippingMethod.update({
            where: { id: String(id) },
            data: {
                deletedAt: null,
            },
            include: DEFAULT_SHIPPING_METHOD_INCLUDE,
        });

        return shippingMethod;
    }

    // =========================================================================
    // Translation Management
    // =========================================================================

    /**
     * Add or update a translation for a shipping method
     */
    async upsertTranslation(
        shippingMethodId: ID,
        languageCode: string,
        data: { name: string; description?: string },
    ): Promise<any> {
        const translation = await this.prisma.shippingMethodTranslation.upsert({
            where: {
                languageCode_shippingMethodId: {
                    languageCode,
                    shippingMethodId: String(shippingMethodId),
                },
            },
            create: {
                languageCode,
                shippingMethodId: String(shippingMethodId),
                name: data.name,
                description: data.description || '',
            },
            update: {
                name: data.name,
                description: data.description || '',
            },
        });

        return translation;
    }

    /**
     * Get all translations for a shipping method
     */
    async getTranslations(shippingMethodId: ID): Promise<any[]> {
        const translations = await this.prisma.shippingMethodTranslation.findMany({
            where: {
                shippingMethodId: String(shippingMethodId),
            },
        });

        return translations;
    }

    // =========================================================================
    // Channel Management
    // =========================================================================

    /**
     * Add shipping method to a channel
     */
    async addToChannel(shippingMethodId: ID, channelId: ID): Promise<void> {
        await this.prisma.shippingMethodChannel.create({
            data: {
                shippingMethodId: String(shippingMethodId),
                channelId: String(channelId),
            },
        });
    }

    /**
     * Remove shipping method from a channel
     */
    async removeFromChannel(shippingMethodId: ID, channelId: ID): Promise<void> {
        await this.prisma.shippingMethodChannel.delete({
            where: {
                shippingMethodId_channelId: {
                    shippingMethodId: String(shippingMethodId),
                    channelId: String(channelId),
                },
            },
        });
    }
}
