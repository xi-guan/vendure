import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { Asset } from '../../entity/asset/asset.entity';

export interface CreateAssetData {
    name: string;
    type: string;
    mimeType: string;
    width?: number;
    height?: number;
    fileSize: number;
    source: string;
    preview: string;
    focalPoint?: any;
    customFields?: any;
}

export interface UpdateAssetData {
    name?: string;
    focalPoint?: any;
    customFields?: any;
}

export interface AssetListOptions {
    skip?: number;
    take?: number;
    filter?: any;
    sort?: any;
}

export interface IAssetOrmAdapter {
    findOne(id: ID, includeRelations?: string[]): Promise<Asset | undefined>;
    findAll(options: AssetListOptions): Promise<PaginatedList<Asset>>;
    create(data: CreateAssetData): Promise<Asset>;
    update(id: ID, data: UpdateAssetData): Promise<Asset>;
    delete(id: ID): Promise<void>;
    exists(id: ID): Promise<boolean>;
    count(filter?: any): Promise<number>;
    findByType(type: string): Promise<Asset[]>;
}

export function getAssetOrmAdapter(
    usePrisma: boolean,
    typeormAdapter: IAssetOrmAdapter,
    prismaAdapter: IAssetOrmAdapter,
): IAssetOrmAdapter {
    return usePrisma ? prismaAdapter : typeormAdapter;
}
