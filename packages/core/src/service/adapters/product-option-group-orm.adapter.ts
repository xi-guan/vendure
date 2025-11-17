/**
 * @description
 * ORM-agnostic adapter interface for ProductOptionGroup entity operations.
 * This abstraction allows switching between TypeORM and Prisma implementations.
 *
 * @since 3.6.0
 */

import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { ProductOptionGroup } from '../../entity/product-option-group/product-option-group.entity';

export interface ProductOptionGroupFilterInput {
    code?: string;
    productId?: string;
}

export interface ProductOptionGroupListOptions {
    skip?: number;
    take?: number;
    filter?: ProductOptionGroupFilterInput;
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreateProductOptionGroupInput {
    code: string;
    productId: string;
    customFields?: Record<string, any>;
}

export interface UpdateProductOptionGroupInput {
    code?: string;
    customFields?: Record<string, any>;
}

export interface ProductOptionGroupTranslationInput {
    languageCode: string;
    name: string;
}

/**
 * ORM-agnostic ProductOptionGroup adapter interface
 */
export interface IProductOptionGroupOrmAdapter {
    /**
     * Find a single product option group by ID
     */
    findOne(id: ID, includeRelations?: boolean): Promise<ProductOptionGroup | undefined>;

    /**
     * Find all product option groups with pagination and filtering
     */
    findAll(options?: ProductOptionGroupListOptions): Promise<PaginatedList<ProductOptionGroup>>;

    /**
     * Find product option groups by product ID
     */
    findByProduct(productId: ID): Promise<ProductOptionGroup[]>;

    /**
     * Find product option group by code
     */
    findByCode(code: string): Promise<ProductOptionGroup | undefined>;

    /**
     * Create a new product option group
     */
    create(data: CreateProductOptionGroupInput): Promise<ProductOptionGroup>;

    /**
     * Update an existing product option group
     */
    update(id: ID, data: UpdateProductOptionGroupInput): Promise<ProductOptionGroup>;

    /**
     * Soft delete a product option group
     */
    softDelete(id: ID): Promise<void>;

    /**
     * Restore a soft-deleted product option group
     */
    restore(id: ID): Promise<ProductOptionGroup>;

    /**
     * Add or update a translation for a product option group
     */
    upsertTranslation(groupId: ID, translation: ProductOptionGroupTranslationInput): Promise<void>;
}
