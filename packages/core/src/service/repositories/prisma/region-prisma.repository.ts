import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../connection/prisma.service';

@Injectable()
export class RegionPrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findOne(id: string, includeRelations: boolean = true) {
        return this.prisma.region.findUnique({
            where: { id },
            include: includeRelations ? { translations: true, parent: true, children: true } : undefined,
        });
    }

    async findByCode(code: string) {
        return this.prisma.region.findUnique({ where: { code }, include: { translations: true } });
    }

    async findMany(params: {
        skip?: number;
        take?: number;
        where?: Prisma.RegionWhereInput;
        orderBy?: Prisma.RegionOrderByWithRelationInput;
    }) {
        const { skip, take, where, orderBy } = params;
        const [items, count] = await Promise.all([
            this.prisma.region.findMany({ skip, take, where, orderBy, include: { translations: true } }),
            this.prisma.region.count({ where }),
        ]);
        return { items, totalItems: count };
    }

    async create(data: Prisma.RegionCreateInput) {
        return this.prisma.region.create({ data, include: { translations: true } });
    }

    async update(id: string, data: Prisma.RegionUpdateInput) {
        return this.prisma.region.update({ where: { id }, data, include: { translations: true } });
    }

    async delete(id: string) {
        return this.prisma.region.delete({ where: { id } });
    }

    async count(where?: Prisma.RegionWhereInput) {
        return this.prisma.region.count({ where });
    }

    async exists(id: string): Promise<boolean> {
        return (await this.prisma.region.count({ where: { id } })) > 0;
    }

    async findByType(type: string) {
        return this.prisma.region.findMany({ where: { type }, include: { translations: true } });
    }
}
