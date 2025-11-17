/**
 * @description
 * ORM-agnostic adapter interface for AssetTag entity operations.
 * This abstraction allows switching between TypeORM and Prisma implementations.
 *
 * @since 3.6.0
 */

import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { AssetTag } from '../../entity/asset/asset-tag.entity';

export interface AssetTagFilterInput {
    value?: string;
}

export interface AssetTagListOptions {
    skip?: number;
    take?: number;
    filter?: AssetTagFilterInput;
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreateAssetTagInput {
    value: string;
}

export interface UpdateAssetTagInput {
    value?: string;
}

/**
 * ORM-agnostic AssetTag adapter interface
 */
export interface IAssetTagOrmAdapter {
    /**
     * Find a single asset tag by ID
     */
    findOne(id: ID, includeRelations?: boolean): Promise<AssetTag | undefined>;

    /**
     * Find an asset tag by value
     */
    findByValue(value: string): Promise<AssetTag | undefined>;

    /**
     * Find all asset tags with pagination and filtering
     */
    findAll(options?: AssetTagListOptions): Promise<PaginatedList<AssetTag>>;

    /**
     * Create a new asset tag
     */
    create(data: CreateAssetTagInput): Promise<AssetTag>;

    /**
     * Update an existing asset tag
     */
    update(id: ID, data: UpdateAssetTagInput): Promise<AssetTag>;

    /**
     * Delete an asset tag
     */
    delete(id: ID): Promise<void>;

    /**
     * Add an asset to a tag
     */
    addAsset(tagId: ID, assetId: ID): Promise<void>;

    /**
     * Remove an asset from a tag
     */
    removeAsset(tagId: ID, assetId: ID): Promise<void>;

    /**
     * Get all assets for a tag
     */
    getAssets(tagId: ID): Promise<any[]>;
}
