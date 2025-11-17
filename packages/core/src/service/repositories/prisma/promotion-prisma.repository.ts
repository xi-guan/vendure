/**
 * @description
 * Prisma-based repository for Promotion entity operations.
 * Handles CRUD operations for Promotions with their relations (translations, orders, channels).
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { PrismaService } from '../../../connection/prisma.service';

export interface PromotionListOptions {
    skip?: number;
    take?: number;
    filter?: {
        enabled?: boolean;
        couponCode?: string;
        name?: string;
    };
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreatePromotionData {
    name: string;
    enabled?: boolean;
    couponCode?: string | null;
    perCustomerUsageLimit?: number | null;
    usageLimit?: number | null;
    startsAt?: Date | null;
    endsAt?: Date | null;
    conditions: Record<string, any>;
    actions: Record<string, any>;
    priorityScore?: number;
    customFields?: Record<string, any>;
}

export interface UpdatePromotionData {
    name?: string;
    enabled?: boolean;
    couponCode?: string | null;
    perCustomerUsageLimit?: number | null;
    usageLimit?: number | null;
    startsAt?: Date | null;
    endsAt?: Date | null;
    conditions?: Record<string, any>;
    actions?: Record<string, any>;
    priorityScore?: number;
    customFields?: Record<string, any>;
}

/**
 * Default include for loading Promotion relations
 */
const DEFAULT_PROMOTION_INCLUDE = {
    translations: true,
    orders: {
        include: {
            order: true,
        },
    },
    channels: {
        include: {
            channel: true,
        },
    },
} satisfies Prisma.PromotionInclude;

@Injectable()
export class PromotionPrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Find a single promotion by ID
     */
    async findOne(id: ID, includeRelations: boolean = true): Promise<any | undefined> {
        const include = includeRelations ? DEFAULT_PROMOTION_INCLUDE : undefined;

        const promotion = await this.prisma.promotion.findUnique({
            where: { id: String(id) },
            include,
        });

        return promotion || undefined;
    }

    /**
     * Find a promotion by coupon code
     */
    async findByCouponCode(couponCode: string): Promise<any | undefined> {
        const promotion = await this.prisma.promotion.findFirst({
            where: {
                couponCode,
                deletedAt: null,
            },
            include: DEFAULT_PROMOTION_INCLUDE,
        });

        return promotion || undefined;
    }

    /**
     * Find all promotions with pagination and filtering
     */
    async findAll(options: PromotionListOptions = {}): Promise<PaginatedList<any>> {
        const { skip = 0, take = 10, filter, sort } = options;

        // Build where clause
        const where: Prisma.PromotionWhereInput = {
            deletedAt: null,
        };

        if (filter?.enabled !== undefined) {
            where.enabled = filter.enabled;
        }

        if (filter?.couponCode) {
            where.couponCode = {
                contains: filter.couponCode,
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
        let orderBy: Prisma.PromotionOrderByWithRelationInput = {
            createdAt: 'desc',
        };

        if (sort?.field) {
            orderBy = {
                [sort.field]: sort.order || 'asc',
            };
        }

        // Execute query
        const [items, totalItems] = await Promise.all([
            this.prisma.promotion.findMany({
                where,
                include: DEFAULT_PROMOTION_INCLUDE,
                skip,
                take,
                orderBy,
            }),
            this.prisma.promotion.count({ where }),
        ]);

        return {
            items,
            totalItems,
        };
    }

    /**
     * Find active promotions (enabled and within date range)
     */
    async findActive(): Promise<any[]> {
        const now = new Date();

        const promotions = await this.prisma.promotion.findMany({
            where: {
                enabled: true,
                deletedAt: null,
                OR: [
                    {
                        startsAt: null,
                    },
                    {
                        startsAt: {
                            lte: now,
                        },
                    },
                ],
                AND: [
                    {
                        OR: [
                            {
                                endsAt: null,
                            },
                            {
                                endsAt: {
                                    gte: now,
                                },
                            },
                        ],
                    },
                ],
            },
            include: DEFAULT_PROMOTION_INCLUDE,
            orderBy: {
                priorityScore: 'desc',
            },
        });

        return promotions;
    }

    /**
     * Create a new promotion
     */
    async create(data: CreatePromotionData): Promise<any> {
        const promotion = await this.prisma.promotion.create({
            data: {
                name: data.name,
                enabled: data.enabled ?? true,
                couponCode: data.couponCode,
                perCustomerUsageLimit: data.perCustomerUsageLimit,
                usageLimit: data.usageLimit,
                startsAt: data.startsAt,
                endsAt: data.endsAt,
                conditions: data.conditions as Prisma.JsonValue,
                actions: data.actions as Prisma.JsonValue,
                priorityScore: data.priorityScore ?? 0,
                customFields: data.customFields as Prisma.JsonValue,
            },
            include: DEFAULT_PROMOTION_INCLUDE,
        });

        return promotion;
    }

    /**
     * Update an existing promotion
     */
    async update(id: ID, data: UpdatePromotionData): Promise<any> {
        const updateData: Prisma.PromotionUpdateInput = {};

        if (data.name !== undefined) {
            updateData.name = data.name;
        }

        if (data.enabled !== undefined) {
            updateData.enabled = data.enabled;
        }

        if (data.couponCode !== undefined) {
            updateData.couponCode = data.couponCode;
        }

        if (data.perCustomerUsageLimit !== undefined) {
            updateData.perCustomerUsageLimit = data.perCustomerUsageLimit;
        }

        if (data.usageLimit !== undefined) {
            updateData.usageLimit = data.usageLimit;
        }

        if (data.startsAt !== undefined) {
            updateData.startsAt = data.startsAt;
        }

        if (data.endsAt !== undefined) {
            updateData.endsAt = data.endsAt;
        }

        if (data.conditions !== undefined) {
            updateData.conditions = data.conditions as Prisma.JsonValue;
        }

        if (data.actions !== undefined) {
            updateData.actions = data.actions as Prisma.JsonValue;
        }

        if (data.priorityScore !== undefined) {
            updateData.priorityScore = data.priorityScore;
        }

        if (data.customFields !== undefined) {
            updateData.customFields = data.customFields as Prisma.JsonValue;
        }

        const promotion = await this.prisma.promotion.update({
            where: { id: String(id) },
            data: updateData,
            include: DEFAULT_PROMOTION_INCLUDE,
        });

        return promotion;
    }

    /**
     * Soft delete a promotion
     */
    async softDelete(id: ID): Promise<void> {
        await this.prisma.promotion.update({
            where: { id: String(id) },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    /**
     * Restore a soft-deleted promotion
     */
    async restore(id: ID): Promise<any> {
        const promotion = await this.prisma.promotion.update({
            where: { id: String(id) },
            data: {
                deletedAt: null,
            },
            include: DEFAULT_PROMOTION_INCLUDE,
        });

        return promotion;
    }

    // =========================================================================
    // Translation Management
    // =========================================================================

    /**
     * Add or update a translation for a promotion
     */
    async upsertTranslation(
        promotionId: ID,
        languageCode: string,
        data: { name: string; description?: string },
    ): Promise<any> {
        const translation = await this.prisma.promotionTranslation.upsert({
            where: {
                languageCode_promotionId: {
                    languageCode,
                    promotionId: String(promotionId),
                },
            },
            create: {
                languageCode,
                promotionId: String(promotionId),
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
     * Get all translations for a promotion
     */
    async getTranslations(promotionId: ID): Promise<any[]> {
        const translations = await this.prisma.promotionTranslation.findMany({
            where: {
                promotionId: String(promotionId),
            },
        });

        return translations;
    }

    // =========================================================================
    // Channel Management
    // =========================================================================

    /**
     * Add promotion to a channel
     */
    async addToChannel(promotionId: ID, channelId: ID): Promise<void> {
        await this.prisma.promotionChannel.create({
            data: {
                promotionId: String(promotionId),
                channelId: String(channelId),
            },
        });
    }

    /**
     * Remove promotion from a channel
     */
    async removeFromChannel(promotionId: ID, channelId: ID): Promise<void> {
        await this.prisma.promotionChannel.delete({
            where: {
                promotionId_channelId: {
                    promotionId: String(promotionId),
                    channelId: String(channelId),
                },
            },
        });
    }
}
