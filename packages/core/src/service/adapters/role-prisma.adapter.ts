import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { PrismaService } from '../../connection/prisma.service';
import { Channel } from '../../entity/channel/channel.entity';
import { Role } from '../../entity/role/role.entity';
import { User } from '../../entity/user/user.entity';

import { CreateRoleData, IRoleOrmAdapter, RoleListOptions, UpdateRoleData } from './role-orm.adapter';

/**
 * @description
 * Prisma implementation of the Role ORM adapter.
 * Translates Role operations to Prisma Client calls and maps results
 * to TypeORM entity instances for backward compatibility.
 *
 * @since 3.6.0
 */
@Injectable()
export class RolePrismaAdapter implements IRoleOrmAdapter {
    constructor(private prisma: PrismaService) {}

    async findOne(id: ID, includeRelations: string[] = []): Promise<Role | undefined> {
        const role = await this.prisma.role.findUnique({
            where: { id: String(id) },
            include: {
                channels: includeRelations.includes('channels')
                    ? {
                          include: {
                              channel: true,
                          },
                      }
                    : false,
                users: includeRelations.includes('users')
                    ? {
                          include: {
                              user: true,
                          },
                      }
                    : false,
            },
        });

        return role ? this.mapToEntity(role) : undefined;
    }

    async findByCode(code: string): Promise<Role | undefined> {
        const role = await this.prisma.role.findUnique({
            where: { code },
            include: {
                channels: {
                    include: {
                        channel: true,
                    },
                },
                users: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        return role ? this.mapToEntity(role) : undefined;
    }

    async findAll(options: RoleListOptions): Promise<PaginatedList<Role>> {
        const { skip = 0, take = 20, filter = {}, sort = {} } = options;

        const [items, totalItems] = await Promise.all([
            this.prisma.role.findMany({
                skip,
                take,
                where: this.mapFilter(filter),
                orderBy: this.mapSort(sort),
                include: {
                    channels: {
                        include: {
                            channel: true,
                        },
                    },
                },
            }),
            this.prisma.role.count({
                where: this.mapFilter(filter),
            }),
        ]);

        return {
            items: items.map(item => this.mapToEntity(item)),
            totalItems,
        };
    }

    async create(data: CreateRoleData): Promise<Role> {
        const role = await this.prisma.role.create({
            data: {
                code: data.code,
                description: data.description,
                permissions: data.permissions,
                customFields: data.customFields || undefined,
            },
            include: {
                channels: {
                    include: {
                        channel: true,
                    },
                },
            },
        });

        return this.mapToEntity(role);
    }

    async update(id: ID, data: UpdateRoleData): Promise<Role> {
        const role = await this.prisma.role.update({
            where: { id: String(id) },
            data: {
                code: data.code,
                description: data.description,
                permissions: data.permissions,
                customFields: data.customFields,
            },
            include: {
                channels: {
                    include: {
                        channel: true,
                    },
                },
            },
        });

        return this.mapToEntity(role);
    }

    async delete(id: ID): Promise<void> {
        await this.prisma.role.delete({
            where: { id: String(id) },
        });
    }

    async exists(id: ID): Promise<boolean> {
        const count = await this.prisma.role.count({
            where: { id: String(id) },
        });
        return count > 0;
    }

    async count(filter: any = {}): Promise<number> {
        return this.prisma.role.count({
            where: this.mapFilter(filter),
        });
    }

    async addToChannel(roleId: ID, channelId: ID): Promise<void> {
        await this.prisma.roleChannel.create({
            data: {
                roleId: String(roleId),
                channelId: String(channelId),
            },
        });
    }

    async removeFromChannel(roleId: ID, channelId: ID): Promise<void> {
        await this.prisma.roleChannel.delete({
            where: {
                roleId_channelId: {
                    roleId: String(roleId),
                    channelId: String(channelId),
                },
            },
        });
    }

    async getChannels(roleId: ID): Promise<Channel[]> {
        const roleChannels = await this.prisma.roleChannel.findMany({
            where: { roleId: String(roleId) },
            include: {
                channel: true,
            },
        });

        return roleChannels.map(rc => this.mapToChannelEntity(rc.channel));
    }

    async getUsers(roleId: ID): Promise<User[]> {
        const userRoles = await this.prisma.userRole.findMany({
            where: { roleId: String(roleId) },
            include: {
                user: true,
            },
        });

        return userRoles.map(ur => this.mapToUserEntity(ur.user));
    }

    async findByPermission(permission: string): Promise<Role[]> {
        const roles = await this.prisma.role.findMany({
            where: {
                permissions: {
                    has: permission,
                },
            },
            include: {
                channels: {
                    include: {
                        channel: true,
                    },
                },
            },
        });

        return roles.map(r => this.mapToEntity(r));
    }

    /**
     * Map Prisma role to TypeORM entity for backward compatibility
     * @private
     */
    private mapToEntity(prismaRole: any): Role {
        const role = new Role({
            id: prismaRole.id,
            createdAt: prismaRole.createdAt,
            updatedAt: prismaRole.updatedAt,
            code: prismaRole.code,
            description: prismaRole.description,
            permissions: prismaRole.permissions,
            customFields: prismaRole.customFields,
        });

        // Map relations if included
        if (prismaRole.channels) {
            role.channels = prismaRole.channels.map((rc: any) => this.mapToChannelEntity(rc.channel));
        }

        return role;
    }

    /**
     * Map Prisma channel to TypeORM entity
     * @private
     */
    private mapToChannelEntity(prismaChannel: any): Channel {
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

    /**
     * Map Prisma user to TypeORM entity
     * @private
     */
    private mapToUserEntity(prismaUser: any): User {
        return new User({
            id: prismaUser.id,
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt,
            deletedAt: prismaUser.deletedAt,
            identifier: prismaUser.identifier,
            verified: prismaUser.verified,
            lastLogin: prismaUser.lastLogin,
            customFields: prismaUser.customFields,
        });
    }

    /**
     * Map filter object to Prisma where clause
     * @private
     */
    private mapFilter(filter: any): any {
        const prismaFilter: any = {};

        if (filter.code) {
            prismaFilter.code = { contains: filter.code, mode: 'insensitive' };
        }
        if (filter.description) {
            prismaFilter.description = { contains: filter.description, mode: 'insensitive' };
        }

        return prismaFilter;
    }

    /**
     * Map sort object to Prisma orderBy clause
     * @private
     */
    private mapSort(sort: any): any {
        const prismaOrderBy: any = {};

        if (sort.createdAt) {
            prismaOrderBy.createdAt = sort.createdAt === 'ASC' ? 'asc' : 'desc';
        }
        if (sort.code) {
            prismaOrderBy.code = sort.code === 'ASC' ? 'asc' : 'desc';
        }

        return Object.keys(prismaOrderBy).length > 0 ? prismaOrderBy : { createdAt: 'desc' };
    }
}
