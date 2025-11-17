import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../connection/prisma.service';

@Injectable()
export class AssetPrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findOne(id: string, includeRelations: boolean = true) {
        return this.prisma.asset.findUnique({
            where: { id },
            include: includeRelations ? { tags: { include: { tag: true } } } : undefined,
        });
    }

    async findMany(params: {
        skip?: number;
        take?: number;
        where?: Prisma.AssetWhereInput;
        orderBy?: Prisma.AssetOrderByWithRelationInput;
    }) {
        const { skip, take, where, orderBy } = params;
        const [items, count] = await Promise.all([
            this.prisma.asset.findMany({ skip, take, where, orderBy }),
            this.prisma.asset.count({ where }),
        ]);
        return { items, totalItems: count };
    }

    async create(data: Prisma.AssetCreateInput) {
        return this.prisma.asset.create({ data });
    }

    async update(id: string, data: Prisma.AssetUpdateInput) {
        return this.prisma.asset.update({ where: { id }, data });
    }

    async delete(id: string) {
        return this.prisma.asset.delete({ where: { id } });
    }

    async count(where?: Prisma.AssetWhereInput) {
        return this.prisma.asset.count({ where });
    }

    async exists(id: string): Promise<boolean> {
        return (await this.prisma.asset.count({ where: { id } })) > 0;
    }

    async findByType(type: string) {
        return this.prisma.asset.findMany({ where: { type } });
    }
}
