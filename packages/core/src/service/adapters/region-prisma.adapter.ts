import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { PrismaService } from '../../connection/prisma.service';
import { Region } from '../../entity/region/region.entity';
import {
    CreateRegionData,
    IRegionOrmAdapter,
    UpdateRegionData,
    RegionListOptions,
} from './region-orm.adapter';

@Injectable()
export class RegionPrismaAdapter implements IRegionOrmAdapter {
    constructor(private prisma: PrismaService) {}

    async findOne(id: ID, includeRelations: string[] = []): Promise<Region | undefined> {
        const region = await this.prisma.region.findUnique({
            where: { id: String(id) },
            include: {
                translations: includeRelations.includes('translations'),
                parent: includeRelations.includes('parent'),
                children: includeRelations.includes('children'),
            },
        });
        return region ? this.mapToEntity(region) : undefined;
    }

    async findByCode(code: string): Promise<Region | undefined> {
        const region = await this.prisma.region.findUnique({ where: { code }, include: { translations: true } });
        return region ? this.mapToEntity(region) : undefined;
    }

    async findAll(options: RegionListOptions): Promise<PaginatedList<Region>> {
        const { skip = 0, take = 20, filter = {} } = options;
        const [items, totalItems] = await Promise.all([
            this.prisma.region.findMany({ skip, take, where: filter, include: { translations: true } }),
            this.prisma.region.count({ where: filter }),
        ]);
        return { items: items.map(item => this.mapToEntity(item)), totalItems };
    }

    async create(data: CreateRegionData): Promise<Region> {
        const region = await this.prisma.region.create({ data: data as any, include: { translations: true } });
        return this.mapToEntity(region);
    }

    async update(id: ID, data: UpdateRegionData): Promise<Region> {
        const region = await this.prisma.region.update({
            where: { id: String(id) },
            data: data as any,
            include: { translations: true },
        });
        return this.mapToEntity(region);
    }

    async delete(id: ID): Promise<void> {
        await this.prisma.region.delete({ where: { id: String(id) } });
    }

    async exists(id: ID): Promise<boolean> {
        return (await this.prisma.region.count({ where: { id: String(id) } })) > 0;
    }

    async count(filter: any = {}): Promise<number> {
        return this.prisma.region.count({ where: filter });
    }

    async findByType(type: string): Promise<Region[]> {
        const regions = await this.prisma.region.findMany({ where: { type }, include: { translations: true } });
        return regions.map(r => this.mapToEntity(r));
    }

    private mapToEntity(prismaRegion: any): Region {
        return new Region({
            id: prismaRegion.id,
            createdAt: prismaRegion.createdAt,
            updatedAt: prismaRegion.updatedAt,
            code: prismaRegion.code,
            type: prismaRegion.type,
            name: prismaRegion.name,
            enabled: prismaRegion.enabled,
            customFields: prismaRegion.customFields,
        });
    }
}
