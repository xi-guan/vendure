/**
 * @description
 * Adapter layer for Channel ORM operations.
 * @since 3.6.0
 */

import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { Channel } from '../../entity/channel/channel.entity';

export interface CreateChannelData {
    code: string;
    token: string;
    defaultLanguageCode: string;
    availableLanguageCodes: string[];
    pricesIncludeTax: boolean;
    defaultCurrencyCode: string;
    availableCurrencyCodes: string[];
    customFields?: any;
}

export interface UpdateChannelData {
    code?: string;
    defaultLanguageCode?: string;
    availableLanguageCodes?: string[];
    pricesIncludeTax?: boolean;
    defaultCurrencyCode?: string;
    availableCurrencyCodes?: string[];
    customFields?: any;
}

export interface ChannelListOptions {
    skip?: number;
    take?: number;
    filter?: any;
    sort?: any;
}

export interface IChannelOrmAdapter {
    findOne(id: ID, includeRelations?: string[]): Promise<Channel | undefined>;
    findByCode(code: string): Promise<Channel | undefined>;
    findByToken(token: string): Promise<Channel | undefined>;
    findAll(options: ChannelListOptions): Promise<PaginatedList<Channel>>;
    create(data: CreateChannelData): Promise<Channel>;
    update(id: ID, data: UpdateChannelData): Promise<Channel>;
    delete(id: ID): Promise<void>;
    exists(id: ID): Promise<boolean>;
    count(filter?: any): Promise<number>;
}

export function getChannelOrmAdapter(
    usePrisma: boolean,
    typeormAdapter: IChannelOrmAdapter,
    prismaAdapter: IChannelOrmAdapter,
): IChannelOrmAdapter {
    return usePrisma ? prismaAdapter : typeormAdapter;
}
