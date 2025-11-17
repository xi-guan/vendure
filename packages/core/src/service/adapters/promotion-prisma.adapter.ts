/**
 * @description
 * Prisma implementation of the Promotion ORM adapter.
 * Converts Prisma results to TypeORM Promotion entities for backward compatibility.
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { PromotionTranslation } from '../../entity/promotion/promotion-translation.entity';
import { Promotion } from '../../entity/promotion/promotion.entity';
import { PromotionPrismaRepository } from '../repositories/prisma/promotion-prisma.repository';

import {
    CreatePromotionInput,
    IPromotionOrmAdapter,
    PromotionListOptions,
    PromotionTranslationInput,
    UpdatePromotionInput,
} from './promotion-orm.adapter';

@Injectable()
export class PromotionPrismaAdapter implements IPromotionOrmAdapter {
    constructor(private readonly repository: PromotionPrismaRepository) {}

    async findOne(id: ID, includeRelations: boolean = true): Promise<Promotion | undefined> {
        const prismaPromotion = await this.repository.findOne(id, includeRelations);

        if (!prismaPromotion) {
            return undefined;
        }

        return this.mapToEntity(prismaPromotion);
    }

    async findByCouponCode(couponCode: string): Promise<Promotion | undefined> {
        const prismaPromotion = await this.repository.findByCouponCode(couponCode);

        if (!prismaPromotion) {
            return undefined;
        }

        return this.mapToEntity(prismaPromotion);
    }

    async findAll(options: PromotionListOptions = {}): Promise<PaginatedList<Promotion>> {
        const result = await this.repository.findAll({
            skip: options.skip,
            take: options.take,
            filter: options.filter,
            sort: options.sort,
        });

        return {
            items: result.items.map(item => this.mapToEntity(item)),
            totalItems: result.totalItems,
        };
    }

    async findActive(): Promise<Promotion[]> {
        const prismaPromotions = await this.repository.findActive();
        return prismaPromotions.map(promotion => this.mapToEntity(promotion));
    }

    async create(data: CreatePromotionInput): Promise<Promotion> {
        const prismaPromotion = await this.repository.create({
            name: data.name,
            enabled: data.enabled,
            couponCode: data.couponCode,
            perCustomerUsageLimit: data.perCustomerUsageLimit,
            usageLimit: data.usageLimit,
            startsAt: data.startsAt,
            endsAt: data.endsAt,
            conditions: data.conditions,
            actions: data.actions,
            priorityScore: data.priorityScore,
            customFields: data.customFields,
        });

        return this.mapToEntity(prismaPromotion);
    }

    async update(id: ID, data: UpdatePromotionInput): Promise<Promotion> {
        const prismaPromotion = await this.repository.update(id, {
            name: data.name,
            enabled: data.enabled,
            couponCode: data.couponCode,
            perCustomerUsageLimit: data.perCustomerUsageLimit,
            usageLimit: data.usageLimit,
            startsAt: data.startsAt,
            endsAt: data.endsAt,
            conditions: data.conditions,
            actions: data.actions,
            priorityScore: data.priorityScore,
            customFields: data.customFields,
        });

        return this.mapToEntity(prismaPromotion);
    }

    async softDelete(id: ID): Promise<void> {
        await this.repository.softDelete(id);
    }

    async restore(id: ID): Promise<Promotion> {
        const prismaPromotion = await this.repository.restore(id);
        return this.mapToEntity(prismaPromotion);
    }

    async upsertTranslation(promotionId: ID, translation: PromotionTranslationInput): Promise<void> {
        await this.repository.upsertTranslation(promotionId, translation.languageCode, {
            name: translation.name,
            description: translation.description,
        });
    }

    async addToChannel(promotionId: ID, channelId: ID): Promise<void> {
        await this.repository.addToChannel(promotionId, channelId);
    }

    async removeFromChannel(promotionId: ID, channelId: ID): Promise<void> {
        await this.repository.removeFromChannel(promotionId, channelId);
    }

    /**
     * Map Prisma Promotion to TypeORM Promotion entity
     * This ensures backward compatibility with existing code
     */
    private mapToEntity(prismaPromotion: any): Promotion {
        const promotion = new Promotion({
            id: prismaPromotion.id,
            createdAt: prismaPromotion.createdAt,
            updatedAt: prismaPromotion.updatedAt,
            deletedAt: prismaPromotion.deletedAt,
            name: prismaPromotion.name,
            enabled: prismaPromotion.enabled,
            couponCode: prismaPromotion.couponCode,
            perCustomerUsageLimit: prismaPromotion.perCustomerUsageLimit,
            usageLimit: prismaPromotion.usageLimit,
            startsAt: prismaPromotion.startsAt,
            endsAt: prismaPromotion.endsAt,
            conditions: prismaPromotion.conditions,
            actions: prismaPromotion.actions,
            priorityScore: prismaPromotion.priorityScore,
            customFields: prismaPromotion.customFields,
        });

        // Map translations
        if (prismaPromotion.translations) {
            promotion.translations = prismaPromotion.translations.map(
                (t: any) =>
                    new PromotionTranslation({
                        id: t.id,
                        createdAt: t.createdAt,
                        updatedAt: t.updatedAt,
                        languageCode: t.languageCode,
                        name: t.name,
                        description: t.description,
                    }),
            );
        }

        // Map orders (if loaded)
        if (prismaPromotion.orders) {
            // Extract just the order from the join table
            promotion.orders = prismaPromotion.orders.map((op: any) => op.order);
        }

        // Map channels (if loaded)
        if (prismaPromotion.channels) {
            // Extract just the channel from the join table
            promotion.channels = prismaPromotion.channels.map((c: any) => c.channel);
        }

        return promotion;
    }
}
