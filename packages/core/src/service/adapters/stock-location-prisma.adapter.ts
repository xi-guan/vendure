import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { PrismaService } from '../../connection/prisma.service';
import { StockLocation } from '../../entity/stock-location/stock-location.entity';
import {
    CreateStockLocationData,
    IStockLocationOrmAdapter,
    UpdateStockLocationData,
    StockLocationListOptions,
} from './stock-location-orm.adapter';

@Injectable()
export class StockLocationPrismaAdapter implements IStockLocationOrmAdapter {
    constructor(private prisma: PrismaService) {}

    async findOne(id: ID, includeRelations: string[] = []): Promise<StockLocation | undefined> {
        const location = await this.prisma.stockLocation.findUnique({ where: { id: String(id) } });
        return location ? this.mapToEntity(location) : undefined;
    }

    async findByName(name: string): Promise<StockLocation | undefined> {
        const location = await this.prisma.stockLocation.findUnique({ where: { name } });
        return location ? this.mapToEntity(location) : undefined;
    }

    async findAll(options: StockLocationListOptions): Promise<PaginatedList<StockLocation>> {
        const { skip = 0, take = 20, filter = {} } = options;
        const [items, totalItems] = await Promise.all([
            this.prisma.stockLocation.findMany({ skip, take, where: filter }),
            this.prisma.stockLocation.count({ where: filter }),
        ]);
        return { items: items.map(item => this.mapToEntity(item)), totalItems };
    }

    async create(data: CreateStockLocationData): Promise<StockLocation> {
        const location = await this.prisma.stockLocation.create({ data: data as any });
        return this.mapToEntity(location);
    }

    async update(id: ID, data: UpdateStockLocationData): Promise<StockLocation> {
        const location = await this.prisma.stockLocation.update({
            where: { id: String(id) },
            data: data as any,
        });
        return this.mapToEntity(location);
    }

    async delete(id: ID): Promise<void> {
        await this.prisma.stockLocation.delete({ where: { id: String(id) } });
    }

    async exists(id: ID): Promise<boolean> {
        return (await this.prisma.stockLocation.count({ where: { id: String(id) } })) > 0;
    }

    async count(filter: any = {}): Promise<number> {
        return this.prisma.stockLocation.count({ where: filter });
    }

    private mapToEntity(prismaLocation: any): StockLocation {
        return new StockLocation({
            id: prismaLocation.id,
            createdAt: prismaLocation.createdAt,
            updatedAt: prismaLocation.updatedAt,
            name: prismaLocation.name,
            description: prismaLocation.description,
            customFields: prismaLocation.customFields,
        });
    }
}
