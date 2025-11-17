/**
 * @description
 * Prisma implementation of the ProductOptionGroup ORM adapter.
 * Converts Prisma results to TypeORM ProductOptionGroup entities for backward compatibility.
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { ProductOptionGroupTranslation } from '../../entity/product-option-group/product-option-group-translation.entity';
import { ProductOptionGroup } from '../../entity/product-option-group/product-option-group.entity';
import { ProductOptionGroupPrismaRepository } from '../repositories/prisma/product-option-group-prisma.repository';

import {
    CreateProductOptionGroupInput,
    IProductOptionGroupOrmAdapter,
    ProductOptionGroupListOptions,
    ProductOptionGroupTranslationInput,
    UpdateProductOptionGroupInput,
} from './product-option-group-orm.adapter';

@Injectable()
export class ProductOptionGroupPrismaAdapter implements IProductOptionGroupOrmAdapter {
    constructor(private readonly repository: ProductOptionGroupPrismaRepository) {}

    async findOne(id: ID, includeRelations: boolean = true): Promise<ProductOptionGroup | undefined> {
        const prismaProductOptionGroup = await this.repository.findOne(id, includeRelations);

        if (!prismaProductOptionGroup) {
            return undefined;
        }

        return this.mapToEntity(prismaProductOptionGroup);
    }

    async findAll(
        options: ProductOptionGroupListOptions = {},
    ): Promise<PaginatedList<ProductOptionGroup>> {
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

    async findByProduct(productId: ID): Promise<ProductOptionGroup[]> {
        const prismaProductOptionGroups = await this.repository.findByProduct(productId);
        return prismaProductOptionGroups.map(group => this.mapToEntity(group));
    }

    async findByCode(code: string): Promise<ProductOptionGroup | undefined> {
        const prismaProductOptionGroup = await this.repository.findByCode(code);

        if (!prismaProductOptionGroup) {
            return undefined;
        }

        return this.mapToEntity(prismaProductOptionGroup);
    }

    async create(data: CreateProductOptionGroupInput): Promise<ProductOptionGroup> {
        const prismaProductOptionGroup = await this.repository.create({
            code: data.code,
            productId: data.productId,
            customFields: data.customFields,
        });

        return this.mapToEntity(prismaProductOptionGroup);
    }

    async update(id: ID, data: UpdateProductOptionGroupInput): Promise<ProductOptionGroup> {
        const prismaProductOptionGroup = await this.repository.update(id, {
            code: data.code,
            customFields: data.customFields,
        });

        return this.mapToEntity(prismaProductOptionGroup);
    }

    async softDelete(id: ID): Promise<void> {
        await this.repository.softDelete(id);
    }

    async restore(id: ID): Promise<ProductOptionGroup> {
        const prismaProductOptionGroup = await this.repository.restore(id);
        return this.mapToEntity(prismaProductOptionGroup);
    }

    async upsertTranslation(
        groupId: ID,
        translation: ProductOptionGroupTranslationInput,
    ): Promise<void> {
        await this.repository.upsertTranslation(groupId, translation.languageCode, {
            name: translation.name,
        });
    }

    /**
     * Map Prisma ProductOptionGroup to TypeORM ProductOptionGroup entity
     * This ensures backward compatibility with existing code
     */
    private mapToEntity(prismaProductOptionGroup: any): ProductOptionGroup {
        const productOptionGroup = new ProductOptionGroup({
            id: prismaProductOptionGroup.id,
            createdAt: prismaProductOptionGroup.createdAt,
            updatedAt: prismaProductOptionGroup.updatedAt,
            deletedAt: prismaProductOptionGroup.deletedAt,
            code: prismaProductOptionGroup.code,
            customFields: prismaProductOptionGroup.customFields,
        });

        // Map product (if loaded)
        if (prismaProductOptionGroup.product) {
            productOptionGroup.product = prismaProductOptionGroup.product;
        }

        // Map options (if loaded)
        if (prismaProductOptionGroup.options) {
            productOptionGroup.options = prismaProductOptionGroup.options;
        }

        // Map translations
        if (prismaProductOptionGroup.translations) {
            productOptionGroup.translations = prismaProductOptionGroup.translations.map(
                (t: any) =>
                    new ProductOptionGroupTranslation({
                        id: t.id,
                        createdAt: t.createdAt,
                        updatedAt: t.updatedAt,
                        languageCode: t.languageCode,
                        name: t.name,
                    }),
            );
        }

        return productOptionGroup;
    }
}
