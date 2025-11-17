import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { PrismaService } from '../../connection/prisma.service';
import { Zone } from '../../entity/zone/zone.entity';
import { CreateZoneData, IZoneOrmAdapter, UpdateZoneData, ZoneListOptions } from './zone-orm.adapter';

@Injectable()
export class ZonePrismaAdapter implements IZoneOrmAdapter {
    constructor(private prisma: PrismaService) {}

    async findOne(id: ID, includeRelations: string[] = []): Promise<Zone | undefined> {
        const zone = await this.prisma.zone.findUnique({
            where: { id: String(id) },
            include: { members: includeRelations.includes('members') },
        });
        return zone ? this.mapToEntity(zone) : undefined;
    }

    async findByName(name: string): Promise<Zone | undefined> {
        const zone = await this.prisma.zone.findUnique({ where: { name } });
        return zone ? this.mapToEntity(zone) : undefined;
    }

    async findAll(options: ZoneListOptions): Promise<PaginatedList<Zone>> {
        const { skip = 0, take = 20, filter = {} } = options;
        const [items, totalItems] = await Promise.all([
            this.prisma.zone.findMany({ skip, take, where: filter }),
            this.prisma.zone.count({ where: filter }),
        ]);
        return { items: items.map(item => this.mapToEntity(item)), totalItems };
    }

    async create(data: CreateZoneData): Promise<Zone> {
        const zone = await this.prisma.zone.create({ data: data as any });
        return this.mapToEntity(zone);
    }

    async update(id: ID, data: UpdateZoneData): Promise<Zone> {
        const zone = await this.prisma.zone.update({ where: { id: String(id) }, data: data as any });
        return this.mapToEntity(zone);
    }

    async delete(id: ID): Promise<void> {
        await this.prisma.zone.delete({ where: { id: String(id) } });
    }

    async exists(id: ID): Promise<boolean> {
        return (await this.prisma.zone.count({ where: { id: String(id) } })) > 0;
    }

    async count(filter: any = {}): Promise<number> {
        return this.prisma.zone.count({ where: filter });
    }

    private mapToEntity(prismaZone: any): Zone {
        return new Zone({
            id: prismaZone.id,
            createdAt: prismaZone.createdAt,
            updatedAt: prismaZone.updatedAt,
            name: prismaZone.name,
            customFields: prismaZone.customFields,
        });
    }
}
