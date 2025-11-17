import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { PrismaService } from '../../connection/prisma.service';
import { Country } from '../../entity/region/country.entity';
import {
    CreateCountryData,
    ICountryOrmAdapter,
    UpdateCountryData,
    CountryListOptions,
} from './country-orm.adapter';

@Injectable()
export class CountryPrismaAdapter implements ICountryOrmAdapter {
    constructor(private prisma: PrismaService) {}

    async findOne(id: ID, includeRelations: string[] = []): Promise<Country | undefined> {
        const country = await this.prisma.country.findUnique({
            where: { id: String(id) },
            include: { translations: includeRelations.includes('translations') },
        });
        return country ? this.mapToEntity(country) : undefined;
    }

    async findByCode(code: string): Promise<Country | undefined> {
        const country = await this.prisma.country.findUnique({
            where: { code },
            include: { translations: true },
        });
        return country ? this.mapToEntity(country) : undefined;
    }

    async findAll(options: CountryListOptions): Promise<PaginatedList<Country>> {
        const { skip = 0, take = 20, filter = {} } = options;
        const [items, totalItems] = await Promise.all([
            this.prisma.country.findMany({ skip, take, where: filter, include: { translations: true } }),
            this.prisma.country.count({ where: filter }),
        ]);
        return { items: items.map(item => this.mapToEntity(item)), totalItems };
    }

    async create(data: CreateCountryData): Promise<Country> {
        const country = await this.prisma.country.create({ data: data as any, include: { translations: true } });
        return this.mapToEntity(country);
    }

    async update(id: ID, data: UpdateCountryData): Promise<Country> {
        const country = await this.prisma.country.update({
            where: { id: String(id) },
            data: data as any,
            include: { translations: true },
        });
        return this.mapToEntity(country);
    }

    async delete(id: ID): Promise<void> {
        await this.prisma.country.delete({ where: { id: String(id) } });
    }

    async exists(id: ID): Promise<boolean> {
        return (await this.prisma.country.count({ where: { id: String(id) } })) > 0;
    }

    async count(filter: any = {}): Promise<number> {
        return this.prisma.country.count({ where: filter });
    }

    async findEnabled(): Promise<Country[]> {
        const countries = await this.prisma.country.findMany({
            where: { enabled: true },
            include: { translations: true },
        });
        return countries.map(c => this.mapToEntity(c));
    }

    private mapToEntity(prismaCountry: any): Country {
        return new Country({
            id: prismaCountry.id,
            createdAt: prismaCountry.createdAt,
            updatedAt: prismaCountry.updatedAt,
            code: prismaCountry.code,
            name: prismaCountry.name,
            enabled: prismaCountry.enabled,
            customFields: prismaCountry.customFields,
        });
    }
}
