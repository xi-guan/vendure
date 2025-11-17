import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { TaxCategory } from '../../entity/tax-category/tax-category.entity';

export interface CreateTaxCategoryData {
    name: string;
    isDefault?: boolean;
    customFields?: any;
}

export interface UpdateTaxCategoryData {
    name?: string;
    isDefault?: boolean;
    customFields?: any;
}

export interface TaxCategoryListOptions {
    skip?: number;
    take?: number;
    filter?: any;
    sort?: any;
}

export interface ITaxCategoryOrmAdapter {
    findOne(id: ID, includeRelations?: string[]): Promise<TaxCategory | undefined>;
    findByName(name: string): Promise<TaxCategory | undefined>;
    findAll(options: TaxCategoryListOptions): Promise<PaginatedList<TaxCategory>>;
    create(data: CreateTaxCategoryData): Promise<TaxCategory>;
    update(id: ID, data: UpdateTaxCategoryData): Promise<TaxCategory>;
    delete(id: ID): Promise<void>;
    exists(id: ID): Promise<boolean>;
    count(filter?: any): Promise<number>;
    findDefault(): Promise<TaxCategory | undefined>;
}

export function getTaxCategoryOrmAdapter(
    usePrisma: boolean,
    typeormAdapter: ITaxCategoryOrmAdapter,
    prismaAdapter: ITaxCategoryOrmAdapter,
): ITaxCategoryOrmAdapter {
    return usePrisma ? prismaAdapter : typeormAdapter;
}
