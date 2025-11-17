/**
 * @description
 * Prisma implementation of the AssetTag ORM adapter.
 * Converts Prisma results to TypeORM AssetTag entities for backward compatibility.
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { AssetTag } from '../../entity/asset/asset-tag.entity';
import { AssetTagPrismaRepository } from '../repositories/prisma/asset-tag-prisma.repository';

import {
    CreateAssetTagInput,
    IAssetTagOrmAdapter,
    AssetTagListOptions,
    UpdateAssetTagInput,
} from './asset-tag-orm.adapter';

@Injectable()
export class AssetTagPrismaAdapter implements IAssetTagOrmAdapter {
    constructor(private readonly repository: AssetTagPrismaRepository) {}

    async findOne(id: ID, includeRelations: boolean = true): Promise<AssetTag | undefined> {
        const prismaAssetTag = await this.repository.findOne(id, includeRelations);

        if (!prismaAssetTag) {
            return undefined;
        }

        return this.mapToEntity(prismaAssetTag);
    }

    async findByValue(value: string): Promise<AssetTag | undefined> {
        const prismaAssetTag = await this.repository.findByValue(value);

        if (!prismaAssetTag) {
            return undefined;
        }

        return this.mapToEntity(prismaAssetTag);
    }

    async findAll(options: AssetTagListOptions = {}): Promise<PaginatedList<AssetTag>> {
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

    async create(data: CreateAssetTagInput): Promise<AssetTag> {
        const prismaAssetTag = await this.repository.create({
            value: data.value,
        });

        return this.mapToEntity(prismaAssetTag);
    }

    async update(id: ID, data: UpdateAssetTagInput): Promise<AssetTag> {
        const prismaAssetTag = await this.repository.update(id, {
            value: data.value,
        });

        return this.mapToEntity(prismaAssetTag);
    }

    async delete(id: ID): Promise<void> {
        await this.repository.delete(id);
    }

    async addAsset(tagId: ID, assetId: ID): Promise<void> {
        await this.repository.addAsset(tagId, assetId);
    }

    async removeAsset(tagId: ID, assetId: ID): Promise<void> {
        await this.repository.removeAsset(tagId, assetId);
    }

    async getAssets(tagId: ID): Promise<any[]> {
        return this.repository.getAssets(tagId);
    }

    /**
     * Map Prisma AssetTag to TypeORM AssetTag entity
     * This ensures backward compatibility with existing code
     */
    private mapToEntity(prismaAssetTag: any): AssetTag {
        const assetTag = new AssetTag({
            id: prismaAssetTag.id,
            createdAt: prismaAssetTag.createdAt,
            updatedAt: prismaAssetTag.updatedAt,
            value: prismaAssetTag.value,
        });

        // Map assets (if loaded)
        if (prismaAssetTag.assets) {
            // Extract just the asset from the join table
            assetTag.assets = prismaAssetTag.assets.map((ata: any) => ata.asset);
        }

        return assetTag;
    }
}
