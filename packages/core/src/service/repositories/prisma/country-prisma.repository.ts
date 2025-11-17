import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../connection/prisma.service';

@Injectable()
export class CountryPrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findOne(id: string, includeRelations: boolean = true) {
        return this.prisma.country.findUnique({
            where: { id },
            include: includeRelations ? { addresses: true, translations: true } : undefined,
        });
    }

    async findByCode(code: string) {
        return this.prisma.country.findUnique({ where: { code }, include: { translations: true } });
    }

    async findMany(params: {
        skip?: number;
        take?: number;
        where?: Prisma.CountryWhereInput;
        orderBy?: Prisma.CountryOrderByWithRelationInput;
    }) {
        const { skip, take, where, orderBy } = params;
        const [items, count] = await Promise.all([
            this.prisma.country.findMany({ skip, take, where, orderBy, include: { translations: true } }),
            this.prisma.country.count({ where }),
        ]);
        return { items, totalItems: count };
    }

    async create(data: Prisma.CountryCreateInput) {
        return this.prisma.country.create({ data, include: { translations: true } });
    }

    async update(id: string, data: Prisma.CountryUpdateInput) {
        return this.prisma.country.update({ where: { id }, data, include: { translations: true } });
    }

    async delete(id: string) {
        return this.prisma.country.delete({ where: { id } });
    }

    async count(where?: Prisma.CountryWhereInput) {
        return this.prisma.country.count({ where });
    }

    async exists(id: string): Promise<boolean> {
        return (await this.prisma.country.count({ where: { id } })) > 0;
    }

    async findEnabled() {
        return this.prisma.country.findMany({ where: { enabled: true }, include: { translations: true } });
    }
}
