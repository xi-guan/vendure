import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../connection/prisma.service';

@Injectable()
export class ZonePrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findOne(id: string, includeRelations: boolean = true) {
        return this.prisma.zone.findUnique({
            where: { id },
            include: includeRelations ? { members: true, taxRates: true } : undefined,
        });
    }

    async findByName(name: string) {
        return this.prisma.zone.findUnique({ where: { name } });
    }

    async findMany(params: {
        skip?: number;
        take?: number;
        where?: Prisma.ZoneWhereInput;
        orderBy?: Prisma.ZoneOrderByWithRelationInput;
    }) {
        const { skip, take, where, orderBy } = params;
        const [items, count] = await Promise.all([
            this.prisma.zone.findMany({ skip, take, where, orderBy, include: { members: true } }),
            this.prisma.zone.count({ where }),
        ]);
        return { items, totalItems: count };
    }

    async create(data: Prisma.ZoneCreateInput) {
        return this.prisma.zone.create({ data, include: { members: true } });
    }

    async update(id: string, data: Prisma.ZoneUpdateInput) {
        return this.prisma.zone.update({ where: { id }, data, include: { members: true } });
    }

    async delete(id: string) {
        return this.prisma.zone.delete({ where: { id } });
    }

    async count(where?: Prisma.ZoneWhereInput) {
        return this.prisma.zone.count({ where });
    }

    async exists(id: string): Promise<boolean> {
        return (await this.prisma.zone.count({ where: { id } })) > 0;
    }
}
