import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { PrismaService } from '../../connection/prisma.service';
import { Asset } from '../../entity/asset/asset.entity';
import { CreateAssetData, IAssetOrmAdapter, UpdateAssetData, AssetListOptions } from './asset-orm.adapter';

@Injectable()
export class AssetPrismaAdapter implements IAssetOrmAdapter {
    constructor(private prisma: PrismaService) {}

    async findOne(id: ID, includeRelations: string[] = []): Promise<Asset | undefined> {
        const asset = await this.prisma.asset.findUnique({ where: { id: String(id) } });
        return asset ? this.mapToEntity(asset) : undefined;
    }

    async findAll(options: AssetListOptions): Promise<PaginatedList<Asset>> {
        const { skip = 0, take = 20, filter = {} } = options;
        const [items, totalItems] = await Promise.all([
            this.prisma.asset.findMany({ skip, take, where: filter }),
            this.prisma.asset.count({ where: filter }),
        ]);
        return { items: items.map(item => this.mapToEntity(item)), totalItems };
    }

    async create(data: CreateAssetData): Promise<Asset> {
        const asset = await this.prisma.asset.create({ data: data as any });
        return this.mapToEntity(asset);
    }

    async update(id: ID, data: UpdateAssetData): Promise<Asset> {
        const asset = await this.prisma.asset.update({ where: { id: String(id) }, data: data as any });
        return this.mapToEntity(asset);
    }

    async delete(id: ID): Promise<void> {
        await this.prisma.asset.delete({ where: { id: String(id) } });
    }

    async exists(id: ID): Promise<boolean> {
        return (await this.prisma.asset.count({ where: { id: String(id) } })) > 0;
    }

    async count(filter: any = {}): Promise<number> {
        return this.prisma.asset.count({ where: filter });
    }

    async findByType(type: string): Promise<Asset[]> {
        const assets = await this.prisma.asset.findMany({ where: { type } });
        return assets.map(a => this.mapToEntity(a));
    }

    private mapToEntity(prismaAsset: any): Asset {
        return new Asset({
            id: prismaAsset.id,
            createdAt: prismaAsset.createdAt,
            updatedAt: prismaAsset.updatedAt,
            name: prismaAsset.name,
            type: prismaAsset.type,
            mimeType: prismaAsset.mimeType,
            width: prismaAsset.width,
            height: prismaAsset.height,
            fileSize: prismaAsset.fileSize,
            source: prismaAsset.source,
            preview: prismaAsset.preview,
            focalPoint: prismaAsset.focalPoint,
            customFields: prismaAsset.customFields,
        });
    }
}
