import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { PrismaService } from '../../connection/prisma.service';
import { Channel } from '../../entity/channel/channel.entity';
import {
    CreateChannelData,
    IChannelOrmAdapter,
    UpdateChannelData,
    ChannelListOptions,
} from './channel-orm.adapter';

/**
 * @description
 * Prisma implementation of the Channel ORM adapter.
 * @since 3.6.0
 */
@Injectable()
export class ChannelPrismaAdapter implements IChannelOrmAdapter {
    constructor(private prisma: PrismaService) {}

    async findOne(id: ID, includeRelations: string[] = []): Promise<Channel | undefined> {
        const channel = await this.prisma.channel.findUnique({ where: { id: String(id) } });
        return channel ? this.mapToEntity(channel) : undefined;
    }

    async findByCode(code: string): Promise<Channel | undefined> {
        const channel = await this.prisma.channel.findUnique({ where: { code } });
        return channel ? this.mapToEntity(channel) : undefined;
    }

    async findByToken(token: string): Promise<Channel | undefined> {
        const channel = await this.prisma.channel.findUnique({ where: { token } });
        return channel ? this.mapToEntity(channel) : undefined;
    }

    async findAll(options: ChannelListOptions): Promise<PaginatedList<Channel>> {
        const { skip = 0, take = 20, filter = {}, sort = {} } = options;
        const [items, totalItems] = await Promise.all([
            this.prisma.channel.findMany({ skip, take, where: filter, orderBy: this.mapSort(sort) }),
            this.prisma.channel.count({ where: filter }),
        ]);
        return { items: items.map(item => this.mapToEntity(item)), totalItems };
    }

    async create(data: CreateChannelData): Promise<Channel> {
        const channel = await this.prisma.channel.create({ data: data as any });
        return this.mapToEntity(channel);
    }

    async update(id: ID, data: UpdateChannelData): Promise<Channel> {
        const channel = await this.prisma.channel.update({ where: { id: String(id) }, data: data as any });
        return this.mapToEntity(channel);
    }

    async delete(id: ID): Promise<void> {
        await this.prisma.channel.delete({ where: { id: String(id) } });
    }

    async exists(id: ID): Promise<boolean> {
        return (await this.prisma.channel.count({ where: { id: String(id) } })) > 0;
    }

    async count(filter: any = {}): Promise<number> {
        return this.prisma.channel.count({ where: filter });
    }

    private mapToEntity(prismaChannel: any): Channel {
        return new Channel({
            id: prismaChannel.id,
            createdAt: prismaChannel.createdAt,
            updatedAt: prismaChannel.updatedAt,
            code: prismaChannel.code,
            token: prismaChannel.token,
            defaultLanguageCode: prismaChannel.defaultLanguageCode,
            availableLanguageCodes: prismaChannel.availableLanguageCodes,
            defaultCurrencyCode: prismaChannel.defaultCurrencyCode,
            availableCurrencyCodes: prismaChannel.availableCurrencyCodes,
            pricesIncludeTax: prismaChannel.pricesIncludeTax,
            customFields: prismaChannel.customFields,
        });
    }

    private mapSort(sort: any): any {
        const prismaOrderBy: any = {};
        if (sort.createdAt) prismaOrderBy.createdAt = sort.createdAt === 'ASC' ? 'asc' : 'desc';
        if (sort.code) prismaOrderBy.code = sort.code === 'ASC' ? 'asc' : 'desc';
        return Object.keys(prismaOrderBy).length > 0 ? prismaOrderBy : { createdAt: 'desc' };
    }
}
