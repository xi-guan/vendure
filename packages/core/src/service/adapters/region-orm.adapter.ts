import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { Region } from '../../entity/region/region.entity';

export interface CreateRegionData {
    code: string;
    type: string;
    name: string;
    enabled?: boolean;
    parentId?: ID;
    customFields?: any;
}

export interface UpdateRegionData {
    code?: string;
    type?: string;
    name?: string;
    enabled?: boolean;
    parentId?: ID;
    customFields?: any;
}

export interface RegionListOptions {
    skip?: number;
    take?: number;
    filter?: any;
    sort?: any;
}

export interface IRegionOrmAdapter {
    findOne(id: ID, includeRelations?: string[]): Promise<Region | undefined>;
    findByCode(code: string): Promise<Region | undefined>;
    findAll(options: RegionListOptions): Promise<PaginatedList<Region>>;
    create(data: CreateRegionData): Promise<Region>;
    update(id: ID, data: UpdateRegionData): Promise<Region>;
    delete(id: ID): Promise<void>;
    exists(id: ID): Promise<boolean>;
    count(filter?: any): Promise<number>;
    findByType(type: string): Promise<Region[]>;
}

export function getRegionOrmAdapter(
    usePrisma: boolean,
    typeormAdapter: IRegionOrmAdapter,
    prismaAdapter: IRegionOrmAdapter,
): IRegionOrmAdapter {
    return usePrisma ? prismaAdapter : typeormAdapter;
}
