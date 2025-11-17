/**
 * @description
 * Prisma implementation of the ProductOption ORM adapter.
 * Converts Prisma results to TypeORM ProductOption entities for backward compatibility.
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { ProductOptionTranslation } from '../../entity/product-option/product-option-translation.entity';
import { ProductOption } from '../../entity/product-option/product-option.entity';
import { ProductOptionPrismaRepository } from '../repositories/prisma/product-option-prisma.repository';

import {
    CreateProductOptionInput,
    IProductOptionOrmAdapter,
    ProductOptionListOptions,
    ProductOptionTranslationInput,
    UpdateProductOptionInput,
} from './product-option-orm.adapter';

@Injectable()
export class ProductOptionPrismaAdapter implements IProductOptionOrmAdapter {
    constructor(private readonly repository: ProductOptionPrismaRepository) {}

    async findOne(id: ID, includeRelations: boolean = true): Promise<ProductOption | undefined> {
        const prismaProductOption = await this.repository.findOne(id, includeRelations);

        if (!prismaProductOption) {
            return undefined;
        }

        return this.mapToEntity(prismaProductOption);
    }

    async findAll(options: ProductOptionListOptions = {}): Promise<PaginatedList<ProductOption>> {
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

    async findByGroup(groupId: ID): Promise<ProductOption[]> {
        const prismaProductOptions = await this.repository.findByGroup(groupId);
        return prismaProductOptions.map(option => this.mapToEntity(option));
    }

    async findByCode(code: string): Promise<ProductOption | undefined> {
        const prismaProductOption = await this.repository.findByCode(code);

        if (!prismaProductOption) {
            return undefined;
        }

        return this.mapToEntity(prismaProductOption);
    }

    async create(data: CreateProductOptionInput): Promise<ProductOption> {
        const prismaProductOption = await this.repository.create({
            code: data.code,
            groupId: data.groupId,
            customFields: data.customFields,
        });

        return this.mapToEntity(prismaProductOption);
    }

    async update(id: ID, data: UpdateProductOptionInput): Promise<ProductOption> {
        const prismaProductOption = await this.repository.update(id, {
            code: data.code,
            customFields: data.customFields,
        });

        return this.mapToEntity(prismaProductOption);
    }

    async softDelete(id: ID): Promise<void> {
        await this.repository.softDelete(id);
    }

    async restore(id: ID): Promise<ProductOption> {
        const prismaProductOption = await this.repository.restore(id);
        return this.mapToEntity(prismaProductOption);
    }

    async upsertTranslation(optionId: ID, translation: ProductOptionTranslationInput): Promise<void> {
        await this.repository.upsertTranslation(optionId, translation.languageCode, {
            name: translation.name,
        });
    }

    /**
     * Map Prisma ProductOption to TypeORM ProductOption entity
     * This ensures backward compatibility with existing code
     */
    private mapToEntity(prismaProductOption: any): ProductOption {
        const productOption = new ProductOption({
            id: prismaProductOption.id,
            createdAt: prismaProductOption.createdAt,
            updatedAt: prismaProductOption.updatedAt,
            deletedAt: prismaProductOption.deletedAt,
            code: prismaProductOption.code,
            customFields: prismaProductOption.customFields,
        });

        // Map group (if loaded)
        if (prismaProductOption.group) {
            productOption.group = prismaProductOption.group;
        }

        // Map translations
        if (prismaProductOption.translations) {
            productOption.translations = prismaProductOption.translations.map(
                (t: any) =>
                    new ProductOptionTranslation({
                        id: t.id,
                        createdAt: t.createdAt,
                        updatedAt: t.updatedAt,
                        languageCode: t.languageCode,
                        name: t.name,
                    }),
            );
        }

        // Map variants (if loaded)
        if (prismaProductOption.variants) {
            // Extract just the productVariant from the join table
            productOption.variants = prismaProductOption.variants.map((pvo: any) => pvo.productVariant);
        }

        return productOption;
    }
}
