/**
 * @description
 * ORM-agnostic adapter interface for ProductOption entity operations.
 * This abstraction allows switching between TypeORM and Prisma implementations.
 *
 * @since 3.6.0
 */

import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { ProductOption } from '../../entity/product-option/product-option.entity';

export interface ProductOptionFilterInput {
    code?: string;
    groupId?: string;
}

export interface ProductOptionListOptions {
    skip?: number;
    take?: number;
    filter?: ProductOptionFilterInput;
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreateProductOptionInput {
    code: string;
    groupId: string;
    customFields?: Record<string, any>;
}

export interface UpdateProductOptionInput {
    code?: string;
    customFields?: Record<string, any>;
}

export interface ProductOptionTranslationInput {
    languageCode: string;
    name: string;
}

/**
 * ORM-agnostic ProductOption adapter interface
 */
export interface IProductOptionOrmAdapter {
    /**
     * Find a single product option by ID
     */
    findOne(id: ID, includeRelations?: boolean): Promise<ProductOption | undefined>;

    /**
     * Find all product options with pagination and filtering
     */
    findAll(options?: ProductOptionListOptions): Promise<PaginatedList<ProductOption>>;

    /**
     * Find product options by group ID
     */
    findByGroup(groupId: ID): Promise<ProductOption[]>;

    /**
     * Find product option by code
     */
    findByCode(code: string): Promise<ProductOption | undefined>;

    /**
     * Create a new product option
     */
    create(data: CreateProductOptionInput): Promise<ProductOption>;

    /**
     * Update an existing product option
     */
    update(id: ID, data: UpdateProductOptionInput): Promise<ProductOption>;

    /**
     * Soft delete a product option
     */
    softDelete(id: ID): Promise<void>;

    /**
     * Restore a soft-deleted product option
     */
    restore(id: ID): Promise<ProductOption>;

    /**
     * Add or update a translation for a product option
     */
    upsertTranslation(optionId: ID, translation: ProductOptionTranslationInput): Promise<void>;
}
