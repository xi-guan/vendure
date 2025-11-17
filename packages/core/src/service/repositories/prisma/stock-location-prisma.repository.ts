import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../connection/prisma.service';

@Injectable()
export class StockLocationPrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findOne(id: string, includeRelations: boolean = true) {
        return this.prisma.stockLocation.findUnique({
            where: { id },
            include: includeRelations ? { stockLevels: true, stockMovements: true } : undefined,
        });
    }

    async findByName(name: string) {
        return this.prisma.stockLocation.findUnique({ where: { name } });
    }

    async findMany(params: {
        skip?: number;
        take?: number;
        where?: Prisma.StockLocationWhereInput;
        orderBy?: Prisma.StockLocationOrderByWithRelationInput;
    }) {
        const { skip, take, where, orderBy } = params;
        const [items, count] = await Promise.all([
            this.prisma.stockLocation.findMany({ skip, take, where, orderBy }),
            this.prisma.stockLocation.count({ where }),
        ]);
        return { items, totalItems: count };
    }

    async create(data: Prisma.StockLocationCreateInput) {
        return this.prisma.stockLocation.create({ data });
    }

    async update(id: string, data: Prisma.StockLocationUpdateInput) {
        return this.prisma.stockLocation.update({ where: { id }, data });
    }

    async delete(id: string) {
        return this.prisma.stockLocation.delete({ where: { id } });
    }

    async count(where?: Prisma.StockLocationWhereInput) {
        return this.prisma.stockLocation.count({ where });
    }

    async exists(id: string): Promise<boolean> {
        return (await this.prisma.stockLocation.count({ where: { id } })) > 0;
    }
}
