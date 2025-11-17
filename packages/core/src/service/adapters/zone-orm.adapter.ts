import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { Zone } from '../../entity/zone/zone.entity';

export interface CreateZoneData {
    name: string;
    customFields?: any;
}

export interface UpdateZoneData {
    name?: string;
    customFields?: any;
}

export interface ZoneListOptions {
    skip?: number;
    take?: number;
    filter?: any;
    sort?: any;
}

export interface IZoneOrmAdapter {
    findOne(id: ID, includeRelations?: string[]): Promise<Zone | undefined>;
    findByName(name: string): Promise<Zone | undefined>;
    findAll(options: ZoneListOptions): Promise<PaginatedList<Zone>>;
    create(data: CreateZoneData): Promise<Zone>;
    update(id: ID, data: UpdateZoneData): Promise<Zone>;
    delete(id: ID): Promise<void>;
    exists(id: ID): Promise<boolean>;
    count(filter?: any): Promise<number>;
}

export function getZoneOrmAdapter(
    usePrisma: boolean,
    typeormAdapter: IZoneOrmAdapter,
    prismaAdapter: IZoneOrmAdapter,
): IZoneOrmAdapter {
    return usePrisma ? prismaAdapter : typeormAdapter;
}
