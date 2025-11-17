/**
 * @description
 * Adapter layer for ProductVariant ORM operations.
 *
 * @since 3.6.0
 */

import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { ProductVariant } from '../../entity/product-variant/product-variant.entity';

export interface CreateProductVariantData {
    sku: string;
    name: string;
    enabled: boolean;
    productId: ID;
    price: number;
    taxCategoryId?: ID;
    stockOnHand?: number;
    trackInventory?: boolean;
    customFields?: any;
}

export interface UpdateProductVariantData {
    sku?: string;
    name?: string;
    enabled?: boolean;
    price?: number;
    taxCategoryId?: ID;
    stockOnHand?: number;
    trackInventory?: boolean;
    customFields?: any;
}

export interface ProductVariantListOptions {
    skip?: number;
    take?: number;
    filter?: {
        productId?: ID;
        enabled?: boolean;
        sku?: string;
    };
    sort?: any;
}

/**
 * ORM-agnostic interface for ProductVariant operations
 */
export interface IProductVariantOrmAdapter {
    findOne(id: ID, includeRelations?: boolean): Promise<ProductVariant | undefined>;
    findBySku(sku: string, includeRelations?: boolean): Promise<ProductVariant | undefined>;
    findByProductId(productId: ID, options?: ProductVariantListOptions): Promise<PaginatedList<ProductVariant>>;
    findAll(options: ProductVariantListOptions): Promise<PaginatedList<ProductVariant>>;
    create(data: CreateProductVariantData): Promise<ProductVariant>;
    update(id: ID, data: UpdateProductVariantData): Promise<ProductVariant>;
    delete(id: ID): Promise<void>;
    adjustStockOnHand(id: ID, adjustment: number): Promise<ProductVariant>;
    setStockOnHand(id: ID, stockOnHand: number): Promise<ProductVariant>;
    getStockLevel(id: ID): Promise<number>;
    isInStock(id: ID, quantity?: number): Promise<boolean>;
}
