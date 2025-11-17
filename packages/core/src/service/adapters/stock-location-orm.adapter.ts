import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { StockLocation } from '../../entity/stock-location/stock-location.entity';

export interface CreateStockLocationData {
    name: string;
    description?: string;
    customFields?: any;
}

export interface UpdateStockLocationData {
    name?: string;
    description?: string;
    customFields?: any;
}

export interface StockLocationListOptions {
    skip?: number;
    take?: number;
    filter?: any;
    sort?: any;
}

export interface IStockLocationOrmAdapter {
    findOne(id: ID, includeRelations?: string[]): Promise<StockLocation | undefined>;
    findByName(name: string): Promise<StockLocation | undefined>;
    findAll(options: StockLocationListOptions): Promise<PaginatedList<StockLocation>>;
    create(data: CreateStockLocationData): Promise<StockLocation>;
    update(id: ID, data: UpdateStockLocationData): Promise<StockLocation>;
    delete(id: ID): Promise<void>;
    exists(id: ID): Promise<boolean>;
    count(filter?: any): Promise<number>;
}

export function getStockLocationOrmAdapter(
    usePrisma: boolean,
    typeormAdapter: IStockLocationOrmAdapter,
    prismaAdapter: IStockLocationOrmAdapter,
): IStockLocationOrmAdapter {
    return usePrisma ? prismaAdapter : typeormAdapter;
}
