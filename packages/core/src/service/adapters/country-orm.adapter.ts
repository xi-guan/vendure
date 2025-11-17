import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { Country } from '../../entity/region/country.entity';

export interface CreateCountryData {
    code: string;
    name: string;
    enabled?: boolean;
    customFields?: any;
}

export interface UpdateCountryData {
    code?: string;
    name?: string;
    enabled?: boolean;
    customFields?: any;
}

export interface CountryListOptions {
    skip?: number;
    take?: number;
    filter?: any;
    sort?: any;
}

export interface ICountryOrmAdapter {
    findOne(id: ID, includeRelations?: string[]): Promise<Country | undefined>;
    findByCode(code: string): Promise<Country | undefined>;
    findAll(options: CountryListOptions): Promise<PaginatedList<Country>>;
    create(data: CreateCountryData): Promise<Country>;
    update(id: ID, data: UpdateCountryData): Promise<Country>;
    delete(id: ID): Promise<void>;
    exists(id: ID): Promise<boolean>;
    count(filter?: any): Promise<number>;
    findEnabled(): Promise<Country[]>;
}

export function getCountryOrmAdapter(
    usePrisma: boolean,
    typeormAdapter: ICountryOrmAdapter,
    prismaAdapter: ICountryOrmAdapter,
): ICountryOrmAdapter {
    return usePrisma ? prismaAdapter : typeormAdapter;
}
