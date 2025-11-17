/**
 * @description
 * Prisma implementation of the FacetValue ORM adapter.
 * Converts Prisma results to TypeORM FacetValue entities for backward compatibility.
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { FacetValueTranslation } from '../../entity/facet-value/facet-value-translation.entity';
import { FacetValue } from '../../entity/facet-value/facet-value.entity';
import { FacetValuePrismaRepository } from '../repositories/prisma/facet-value-prisma.repository';

import {
    CreateFacetValueInput,
    IFacetValueOrmAdapter,
    FacetValueListOptions,
    FacetValueTranslationInput,
    UpdateFacetValueInput,
} from './facet-value-orm.adapter';

@Injectable()
export class FacetValuePrismaAdapter implements IFacetValueOrmAdapter {
    constructor(private readonly repository: FacetValuePrismaRepository) {}

    async findOne(id: ID, includeRelations: boolean = true): Promise<FacetValue | undefined> {
        const prismaFacetValue = await this.repository.findOne(id, includeRelations);

        if (!prismaFacetValue) {
            return undefined;
        }

        return this.mapToEntity(prismaFacetValue);
    }

    async findAll(options: FacetValueListOptions = {}): Promise<PaginatedList<FacetValue>> {
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

    async findByFacet(facetId: ID): Promise<FacetValue[]> {
        const prismaFacetValues = await this.repository.findByFacet(facetId);
        return prismaFacetValues.map(value => this.mapToEntity(value));
    }

    async findByCodeAndFacet(code: string, facetId: ID): Promise<FacetValue | undefined> {
        const prismaFacetValue = await this.repository.findByCodeAndFacet(code, facetId);

        if (!prismaFacetValue) {
            return undefined;
        }

        return this.mapToEntity(prismaFacetValue);
    }

    async create(data: CreateFacetValueInput): Promise<FacetValue> {
        const prismaFacetValue = await this.repository.create({
            code: data.code,
            facetId: data.facetId,
            customFields: data.customFields,
        });

        return this.mapToEntity(prismaFacetValue);
    }

    async update(id: ID, data: UpdateFacetValueInput): Promise<FacetValue> {
        const prismaFacetValue = await this.repository.update(id, {
            code: data.code,
            customFields: data.customFields,
        });

        return this.mapToEntity(prismaFacetValue);
    }

    async delete(id: ID): Promise<void> {
        await this.repository.delete(id);
    }

    async upsertTranslation(facetValueId: ID, translation: FacetValueTranslationInput): Promise<void> {
        await this.repository.upsertTranslation(facetValueId, translation.languageCode, {
            name: translation.name,
        });
    }

    async addToProduct(facetValueId: ID, productId: ID): Promise<void> {
        await this.repository.addToProduct(facetValueId, productId);
    }

    async removeFromProduct(facetValueId: ID, productId: ID): Promise<void> {
        await this.repository.removeFromProduct(facetValueId, productId);
    }

    async addToVariant(facetValueId: ID, variantId: ID): Promise<void> {
        await this.repository.addToVariant(facetValueId, variantId);
    }

    async removeFromVariant(facetValueId: ID, variantId: ID): Promise<void> {
        await this.repository.removeFromVariant(facetValueId, variantId);
    }

    async addToChannel(facetValueId: ID, channelId: ID): Promise<void> {
        await this.repository.addToChannel(facetValueId, channelId);
    }

    async removeFromChannel(facetValueId: ID, channelId: ID): Promise<void> {
        await this.repository.removeFromChannel(facetValueId, channelId);
    }

    /**
     * Map Prisma FacetValue to TypeORM FacetValue entity
     * This ensures backward compatibility with existing code
     */
    private mapToEntity(prismaFacetValue: any): FacetValue {
        const facetValue = new FacetValue({
            id: prismaFacetValue.id,
            createdAt: prismaFacetValue.createdAt,
            updatedAt: prismaFacetValue.updatedAt,
            code: prismaFacetValue.code,
            customFields: prismaFacetValue.customFields,
        });

        // Map facet (if loaded)
        if (prismaFacetValue.facet) {
            facetValue.facet = prismaFacetValue.facet;
        }

        // Map translations
        if (prismaFacetValue.translations) {
            facetValue.translations = prismaFacetValue.translations.map(
                (t: any) =>
                    new FacetValueTranslation({
                        id: t.id,
                        createdAt: t.createdAt,
                        updatedAt: t.updatedAt,
                        languageCode: t.languageCode,
                        name: t.name,
                    }),
            );
        }

        // Map products (if loaded)
        if (prismaFacetValue.products) {
            // Extract just the product from the join table
            facetValue.products = prismaFacetValue.products.map((pfv: any) => pfv.product);
        }

        // Map variants (if loaded)
        if (prismaFacetValue.variants) {
            // Extract just the productVariant from the join table
            facetValue.productVariants = prismaFacetValue.variants.map((pvfv: any) => pvfv.productVariant);
        }

        // Map channels (if loaded)
        if (prismaFacetValue.channels) {
            // Extract just the channel from the join table
            facetValue.channels = prismaFacetValue.channels.map((c: any) => c.channel);
        }

        return facetValue;
    }
}
