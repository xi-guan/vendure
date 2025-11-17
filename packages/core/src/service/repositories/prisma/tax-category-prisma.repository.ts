import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../connection/prisma.service';

@Injectable()
export class TaxCategoryPrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findOne(id: string, includeRelations: boolean = true) {
        return this.prisma.taxCategory.findUnique({
            where: { id },
            include: includeRelations ? { productVariants: true, orderLines: true, taxRates: true } : undefined,
        });
    }

    async findByName(name: string) {
        return this.prisma.taxCategory.findUnique({ where: { name } });
    }

    async findMany(params: {
        skip?: number;
        take?: number;
        where?: Prisma.TaxCategoryWhereInput;
        orderBy?: Prisma.TaxCategoryOrderByWithRelationInput;
    }) {
        const { skip, take, where, orderBy } = params;
        const [items, count] = await Promise.all([
            this.prisma.taxCategory.findMany({ skip, take, where, orderBy }),
            this.prisma.taxCategory.count({ where }),
        ]);
        return { items, totalItems: count };
    }

    async create(data: Prisma.TaxCategoryCreateInput) {
        return this.prisma.taxCategory.create({ data });
    }

    async update(id: string, data: Prisma.TaxCategoryUpdateInput) {
        return this.prisma.taxCategory.update({ where: { id }, data });
    }

    async delete(id: string) {
        return this.prisma.taxCategory.delete({ where: { id } });
    }

    async count(where?: Prisma.TaxCategoryWhereInput) {
        return this.prisma.taxCategory.count({ where });
    }

    async exists(id: string): Promise<boolean> {
        return (await this.prisma.taxCategory.count({ where: { id } })) > 0;
    }

    async findDefault() {
        return this.prisma.taxCategory.findFirst({ where: { isDefault: true } });
    }
}
