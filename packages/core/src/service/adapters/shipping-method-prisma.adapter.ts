/**
 * @description
 * Prisma implementation of the ShippingMethod ORM adapter.
 * Converts Prisma results to TypeORM ShippingMethod entities for backward compatibility.
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { ShippingMethodTranslation } from '../../entity/shipping-method/shipping-method-translation.entity';
import { ShippingMethod } from '../../entity/shipping-method/shipping-method.entity';
import { ShippingMethodPrismaRepository } from '../repositories/prisma/shipping-method-prisma.repository';

import {
    CreateShippingMethodInput,
    IShippingMethodOrmAdapter,
    ShippingMethodListOptions,
    ShippingMethodTranslationInput,
    UpdateShippingMethodInput,
} from './shipping-method-orm.adapter';

@Injectable()
export class ShippingMethodPrismaAdapter implements IShippingMethodOrmAdapter {
    constructor(private readonly repository: ShippingMethodPrismaRepository) {}

    async findOne(id: ID, includeRelations: boolean = true): Promise<ShippingMethod | undefined> {
        const prismaShippingMethod = await this.repository.findOne(id, includeRelations);

        if (!prismaShippingMethod) {
            return undefined;
        }

        return this.mapToEntity(prismaShippingMethod);
    }

    async findByCode(code: string): Promise<ShippingMethod | undefined> {
        const prismaShippingMethod = await this.repository.findByCode(code);

        if (!prismaShippingMethod) {
            return undefined;
        }

        return this.mapToEntity(prismaShippingMethod);
    }

    async findAll(options: ShippingMethodListOptions = {}): Promise<PaginatedList<ShippingMethod>> {
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

    async create(data: CreateShippingMethodInput): Promise<ShippingMethod> {
        const prismaShippingMethod = await this.repository.create({
            code: data.code,
            name: data.name,
            description: data.description,
            checker: data.checker,
            calculator: data.calculator,
            fulfillmentHandlerCode: data.fulfillmentHandlerCode,
            customFields: data.customFields,
        });

        return this.mapToEntity(prismaShippingMethod);
    }

    async update(id: ID, data: UpdateShippingMethodInput): Promise<ShippingMethod> {
        const prismaShippingMethod = await this.repository.update(id, {
            code: data.code,
            name: data.name,
            description: data.description,
            checker: data.checker,
            calculator: data.calculator,
            fulfillmentHandlerCode: data.fulfillmentHandlerCode,
            customFields: data.customFields,
        });

        return this.mapToEntity(prismaShippingMethod);
    }

    async softDelete(id: ID): Promise<void> {
        await this.repository.softDelete(id);
    }

    async restore(id: ID): Promise<ShippingMethod> {
        const prismaShippingMethod = await this.repository.restore(id);
        return this.mapToEntity(prismaShippingMethod);
    }

    async upsertTranslation(
        shippingMethodId: ID,
        translation: ShippingMethodTranslationInput,
    ): Promise<void> {
        await this.repository.upsertTranslation(shippingMethodId, translation.languageCode, {
            name: translation.name,
            description: translation.description,
        });
    }

    async addToChannel(shippingMethodId: ID, channelId: ID): Promise<void> {
        await this.repository.addToChannel(shippingMethodId, channelId);
    }

    async removeFromChannel(shippingMethodId: ID, channelId: ID): Promise<void> {
        await this.repository.removeFromChannel(shippingMethodId, channelId);
    }

    /**
     * Map Prisma ShippingMethod to TypeORM ShippingMethod entity
     * This ensures backward compatibility with existing code
     */
    private mapToEntity(prismaShippingMethod: any): ShippingMethod {
        const shippingMethod = new ShippingMethod({
            id: prismaShippingMethod.id,
            createdAt: prismaShippingMethod.createdAt,
            updatedAt: prismaShippingMethod.updatedAt,
            deletedAt: prismaShippingMethod.deletedAt,
            code: prismaShippingMethod.code,
            name: prismaShippingMethod.name,
            description: prismaShippingMethod.description,
            checker: prismaShippingMethod.checker,
            calculator: prismaShippingMethod.calculator,
            fulfillmentHandlerCode: prismaShippingMethod.fulfillmentHandlerCode,
            customFields: prismaShippingMethod.customFields,
        });

        // Map translations
        if (prismaShippingMethod.translations) {
            shippingMethod.translations = prismaShippingMethod.translations.map(
                (t: any) =>
                    new ShippingMethodTranslation({
                        id: t.id,
                        createdAt: t.createdAt,
                        updatedAt: t.updatedAt,
                        languageCode: t.languageCode,
                        name: t.name,
                        description: t.description,
                    }),
            );
        }

        // Map channels (if loaded)
        if (prismaShippingMethod.channels) {
            // Extract just the channel from the join table
            shippingMethod.channels = prismaShippingMethod.channels.map((c: any) => c.channel);
        }

        // Map shipping lines (if loaded)
        if (prismaShippingMethod.shippingLines) {
            shippingMethod.shippingLines = prismaShippingMethod.shippingLines;
        }

        return shippingMethod;
    }
}
