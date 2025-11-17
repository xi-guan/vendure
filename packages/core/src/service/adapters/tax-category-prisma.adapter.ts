import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { PrismaService } from '../../connection/prisma.service';
import { TaxCategory } from '../../entity/tax-category/tax-category.entity';
import {
    CreateTaxCategoryData,
    ITaxCategoryOrmAdapter,
    UpdateTaxCategoryData,
    TaxCategoryListOptions,
} from './tax-category-orm.adapter';

@Injectable()
export class TaxCategoryPrismaAdapter implements ITaxCategoryOrmAdapter {
    constructor(private prisma: PrismaService) {}

    async findOne(id: ID, includeRelations: string[] = []): Promise<TaxCategory | undefined> {
        const taxCategory = await this.prisma.taxCategory.findUnique({ where: { id: String(id) } });
        return taxCategory ? this.mapToEntity(taxCategory) : undefined;
    }

    async findByName(name: string): Promise<TaxCategory | undefined> {
        const taxCategory = await this.prisma.taxCategory.findUnique({ where: { name } });
        return taxCategory ? this.mapToEntity(taxCategory) : undefined;
    }

    async findAll(options: TaxCategoryListOptions): Promise<PaginatedList<TaxCategory>> {
        const { skip = 0, take = 20, filter = {} } = options;
        const [items, totalItems] = await Promise.all([
            this.prisma.taxCategory.findMany({ skip, take, where: filter }),
            this.prisma.taxCategory.count({ where: filter }),
        ]);
        return { items: items.map(item => this.mapToEntity(item)), totalItems };
    }

    async create(data: CreateTaxCategoryData): Promise<TaxCategory> {
        const taxCategory = await this.prisma.taxCategory.create({ data: data as any });
        return this.mapToEntity(taxCategory);
    }

    async update(id: ID, data: UpdateTaxCategoryData): Promise<TaxCategory> {
        const taxCategory = await this.prisma.taxCategory.update({
            where: { id: String(id) },
            data: data as any,
        });
        return this.mapToEntity(taxCategory);
    }

    async delete(id: ID): Promise<void> {
        await this.prisma.taxCategory.delete({ where: { id: String(id) } });
    }

    async exists(id: ID): Promise<boolean> {
        return (await this.prisma.taxCategory.count({ where: { id: String(id) } })) > 0;
    }

    async count(filter: any = {}): Promise<number> {
        return this.prisma.taxCategory.count({ where: filter });
    }

    async findDefault(): Promise<TaxCategory | undefined> {
        const taxCategory = await this.prisma.taxCategory.findFirst({ where: { isDefault: true } });
        return taxCategory ? this.mapToEntity(taxCategory) : undefined;
    }

    private mapToEntity(prismaTaxCategory: any): TaxCategory {
        return new TaxCategory({
            id: prismaTaxCategory.id,
            createdAt: prismaTaxCategory.createdAt,
            updatedAt: prismaTaxCategory.updatedAt,
            name: prismaTaxCategory.name,
            isDefault: prismaTaxCategory.isDefault,
            customFields: prismaTaxCategory.customFields,
        });
    }
}
