/**
 * @description
 * ORM-agnostic adapter interface for Promotion entity operations.
 * This abstraction allows switching between TypeORM and Prisma implementations.
 *
 * @since 3.6.0
 */

import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { Promotion } from '../../entity/promotion/promotion.entity';

export interface PromotionFilterInput {
    enabled?: boolean;
    couponCode?: string;
    name?: string;
}

export interface PromotionListOptions {
    skip?: number;
    take?: number;
    filter?: PromotionFilterInput;
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreatePromotionInput {
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

export interface UpdatePromotionInput {
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

export interface PromotionTranslationInput {
    languageCode: string;
    name: string;
    description?: string;
}

/**
 * ORM-agnostic Promotion adapter interface
 */
export interface IPromotionOrmAdapter {
    /**
     * Find a single promotion by ID
     */
    findOne(id: ID, includeRelations?: boolean): Promise<Promotion | undefined>;

    /**
     * Find a promotion by coupon code
     */
    findByCouponCode(couponCode: string): Promise<Promotion | undefined>;

    /**
     * Find all promotions with pagination and filtering
     */
    findAll(options?: PromotionListOptions): Promise<PaginatedList<Promotion>>;

    /**
     * Find active promotions (enabled and within date range)
     */
    findActive(): Promise<Promotion[]>;

    /**
     * Create a new promotion
     */
    create(data: CreatePromotionInput): Promise<Promotion>;

    /**
     * Update an existing promotion
     */
    update(id: ID, data: UpdatePromotionInput): Promise<Promotion>;

    /**
     * Soft delete a promotion
     */
    softDelete(id: ID): Promise<void>;

    /**
     * Restore a soft-deleted promotion
     */
    restore(id: ID): Promise<Promotion>;

    /**
     * Add or update a translation for a promotion
     */
    upsertTranslation(promotionId: ID, translation: PromotionTranslationInput): Promise<void>;

    /**
     * Add promotion to a channel
     */
    addToChannel(promotionId: ID, channelId: ID): Promise<void>;

    /**
     * Remove promotion from a channel
     */
    removeFromChannel(promotionId: ID, channelId: ID): Promise<void>;
}
