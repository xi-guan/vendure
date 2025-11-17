/**
 * @description
 * Prisma-based repository for AssetTag entity operations.
 * Handles CRUD operations for AssetTags with their relations (assets).
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { PrismaService } from '../../../connection/prisma.service';

export interface AssetTagListOptions {
    skip?: number;
    take?: number;
    filter?: {
        value?: string;
    };
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreateAssetTagData {
    value: string;
}

export interface UpdateAssetTagData {
    value?: string;
}

/**
 * Default include for loading AssetTag relations
 */
const DEFAULT_ASSET_TAG_INCLUDE = {
    assets: {
        include: {
            asset: true,
        },
    },
} satisfies Prisma.AssetTagInclude;

@Injectable()
export class AssetTagPrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Find a single asset tag by ID
     */
    async findOne(id: ID, includeRelations: boolean = true): Promise<any | undefined> {
        const include = includeRelations ? DEFAULT_ASSET_TAG_INCLUDE : undefined;

        const assetTag = await this.prisma.assetTag.findUnique({
            where: { id: String(id) },
            include,
        });

        return assetTag || undefined;
    }

    /**
     * Find an asset tag by value
     */
    async findByValue(value: string): Promise<any | undefined> {
        const assetTag = await this.prisma.assetTag.findUnique({
            where: { value },
            include: DEFAULT_ASSET_TAG_INCLUDE,
        });

        return assetTag || undefined;
    }

    /**
     * Find all asset tags with pagination and filtering
     */
    async findAll(options: AssetTagListOptions = {}): Promise<PaginatedList<any>> {
        const { skip = 0, take = 10, filter, sort } = options;

        // Build where clause
        const where: Prisma.AssetTagWhereInput = {};

        if (filter?.value) {
            where.value = {
                contains: filter.value,
                mode: 'insensitive',
            };
        }

        // Build orderBy
        let orderBy: Prisma.AssetTagOrderByWithRelationInput = {
            createdAt: 'desc',
        };

        if (sort?.field) {
            orderBy = {
                [sort.field]: sort.order || 'asc',
            };
        }

        // Execute query
        const [items, totalItems] = await Promise.all([
            this.prisma.assetTag.findMany({
                where,
                include: DEFAULT_ASSET_TAG_INCLUDE,
                skip,
                take,
                orderBy,
            }),
            this.prisma.assetTag.count({ where }),
        ]);

        return {
            items,
            totalItems,
        };
    }

    /**
     * Create a new asset tag
     */
    async create(data: CreateAssetTagData): Promise<any> {
        const assetTag = await this.prisma.assetTag.create({
            data: {
                value: data.value,
            },
            include: DEFAULT_ASSET_TAG_INCLUDE,
        });

        return assetTag;
    }

    /**
     * Update an existing asset tag
     */
    async update(id: ID, data: UpdateAssetTagData): Promise<any> {
        const updateData: Prisma.AssetTagUpdateInput = {};

        if (data.value !== undefined) {
            updateData.value = data.value;
        }

        const assetTag = await this.prisma.assetTag.update({
            where: { id: String(id) },
            data: updateData,
            include: DEFAULT_ASSET_TAG_INCLUDE,
        });

        return assetTag;
    }

    /**
     * Delete an asset tag
     */
    async delete(id: ID): Promise<void> {
        await this.prisma.assetTag.delete({
            where: { id: String(id) },
        });
    }

    /**
     * Add an asset to a tag
     */
    async addAsset(tagId: ID, assetId: ID): Promise<void> {
        await this.prisma.assetTagAsset.create({
            data: {
                tagId: String(tagId),
                assetId: String(assetId),
            },
        });
    }

    /**
     * Remove an asset from a tag
     */
    async removeAsset(tagId: ID, assetId: ID): Promise<void> {
        await this.prisma.assetTagAsset.delete({
            where: {
                assetId_tagId: {
                    assetId: String(assetId),
                    tagId: String(tagId),
                },
            },
        });
    }

    /**
     * Get all assets for a tag
     */
    async getAssets(tagId: ID): Promise<any[]> {
        const assetTagAssets = await this.prisma.assetTagAsset.findMany({
            where: {
                tagId: String(tagId),
            },
            include: {
                asset: true,
            },
        });

        return assetTagAssets.map(ata => ata.asset);
    }
}
