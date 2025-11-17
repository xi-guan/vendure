import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../connection/prisma.service';

@Injectable()
export class CustomerGroupPrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findOne(id: string, includeRelations: boolean = true) {
        return this.prisma.customerGroup.findUnique({
            where: { id },
            include: includeRelations ? { customers: { include: { customer: true } }, taxRates: true } : undefined,
        });
    }

    async findByName(name: string) {
        return this.prisma.customerGroup.findUnique({ where: { name } });
    }

    async findMany(params: {
        skip?: number;
        take?: number;
        where?: Prisma.CustomerGroupWhereInput;
        orderBy?: Prisma.CustomerGroupOrderByWithRelationInput;
    }) {
        const { skip, take, where, orderBy } = params;
        const [items, count] = await Promise.all([
            this.prisma.customerGroup.findMany({ skip, take, where, orderBy }),
            this.prisma.customerGroup.count({ where }),
        ]);
        return { items, totalItems: count };
    }

    async create(data: Prisma.CustomerGroupCreateInput) {
        return this.prisma.customerGroup.create({ data });
    }

    async update(id: string, data: Prisma.CustomerGroupUpdateInput) {
        return this.prisma.customerGroup.update({ where: { id }, data });
    }

    async delete(id: string) {
        return this.prisma.customerGroup.delete({ where: { id } });
    }

    async count(where?: Prisma.CustomerGroupWhereInput) {
        return this.prisma.customerGroup.count({ where });
    }

    async exists(id: string): Promise<boolean> {
        return (await this.prisma.customerGroup.count({ where: { id } })) > 0;
    }
}
