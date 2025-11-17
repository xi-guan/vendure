/**
 * @description
 * Prisma implementation of ProductVariant ORM adapter.
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { ProductVariant } from '../../entity/product-variant/product-variant.entity';
import { ProductVariantPrismaRepository } from '../repositories/prisma/product-variant-prisma.repository';

import {
    CreateProductVariantData,
    IProductVariantOrmAdapter,
    ProductVariantListOptions,
    UpdateProductVariantData,
} from './product-variant-orm.adapter';

@Injectable()
export class ProductVariantPrismaAdapter implements IProductVariantOrmAdapter {
    constructor(private readonly repository: ProductVariantPrismaRepository) {}

    async findOne(id: ID, includeRelations?: boolean): Promise<ProductVariant | undefined> {
        const result = await this.repository.findOne(id, includeRelations);
        return result as ProductVariant | undefined;
    }

    async findBySku(sku: string, includeRelations?: boolean): Promise<ProductVariant | undefined> {
        const result = await this.repository.findBySku(sku, includeRelations);
        return result as ProductVariant | undefined;
    }

    async findByProductId(
        productId: ID,
        options?: ProductVariantListOptions,
    ): Promise<PaginatedList<ProductVariant>> {
        const result = await this.repository.findByProductId(productId, options);
        return result as PaginatedList<ProductVariant>;
    }

    async findAll(options: ProductVariantListOptions): Promise<PaginatedList<ProductVariant>> {
        const result = await this.repository.findAll(options);
        return result as PaginatedList<ProductVariant>;
    }

    async create(data: CreateProductVariantData): Promise<ProductVariant> {
        const result = await this.repository.create(data);
        return result as ProductVariant;
    }

    async update(id: ID, data: UpdateProductVariantData): Promise<ProductVariant> {
        const result = await this.repository.update(id, data);
        return result as ProductVariant;
    }

    async delete(id: ID): Promise<void> {
        await this.repository.delete(id);
    }

    async adjustStockOnHand(id: ID, adjustment: number): Promise<ProductVariant> {
        const result = await this.repository.adjustStockOnHand(id, adjustment);
        return result as ProductVariant;
    }

    async setStockOnHand(id: ID, stockOnHand: number): Promise<ProductVariant> {
        const result = await this.repository.setStockOnHand(id, stockOnHand);
        return result as ProductVariant;
    }

    async getStockLevel(id: ID): Promise<number> {
        return this.repository.getStockLevel(id);
    }

    async isInStock(id: ID, quantity?: number): Promise<boolean> {
        return this.repository.isInStock(id, quantity);
    }
}
