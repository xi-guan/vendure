import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../connection/prisma.service';

/**
 * @description
 * Repository for Role entity using Prisma ORM.
 * This is part of Phase 2.6 - Continued migration from TypeORM to Prisma.
 *
 * Provides type-safe database operations for Role entity with
 * improved query performance and better developer experience.
 *
 * @example
 * ```typescript
 * const role = await rolePrismaRepo.findOne('role-id');
 * const roles = await rolePrismaRepo.findMany({
 *   where: { code: 'admin' },
 *   skip: 0,
 *   take: 10,
 * });
 * ```
 *
 * @docsCategory services
 * @since 3.6.0
 */
@Injectable()
export class RolePrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Find a single role by ID
     * @param id - Role ID
     * @param includeRelations - Whether to include related entities
     */
    async findOne(id: string, includeRelations: boolean = true) {
        return this.prisma.role.findUnique({
            where: { id },
            include: includeRelations
                ? {
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
                  }
                : undefined,
        });
    }

    /**
     * Find a role by code
     * @param code - Role code
     */
    async findByCode(code: string) {
        return this.prisma.role.findUnique({
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
    }

    /**
     * Find roles with pagination and filtering
     * @param params - Query parameters
     */
    async findMany(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.RoleWhereUniqueInput;
        where?: Prisma.RoleWhereInput;
        orderBy?: Prisma.RoleOrderByWithRelationInput;
    }) {
        const { skip, take, cursor, where, orderBy } = params;

        const [items, count] = await Promise.all([
            this.prisma.role.findMany({
                skip,
                take,
                cursor,
                where,
                orderBy,
                include: {
                    channels: {
                        include: {
                            channel: true,
                        },
                    },
                },
            }),
            this.prisma.role.count({
                where,
            }),
        ]);

        return {
            items,
            totalItems: count,
        };
    }

    /**
     * Create a new role
     * @param data - Role data
     */
    async create(data: Prisma.RoleCreateInput) {
        return this.prisma.role.create({
            data,
            include: {
                channels: {
                    include: {
                        channel: true,
                    },
                },
            },
        });
    }

    /**
     * Update a role
     * @param id - Role ID
     * @param data - Update data
     */
    async update(id: string, data: Prisma.RoleUpdateInput) {
        return this.prisma.role.update({
            where: { id },
            data,
            include: {
                channels: {
                    include: {
                        channel: true,
                    },
                },
            },
        });
    }

    /**
     * Delete a role
     * @param id - Role ID
     */
    async delete(id: string) {
        return this.prisma.role.delete({
            where: { id },
        });
    }

    /**
     * Count roles matching criteria
     * @param where - Filter criteria
     */
    async count(where?: Prisma.RoleWhereInput) {
        return this.prisma.role.count({
            where,
        });
    }

    /**
     * Check if role exists
     * @param id - Role ID
     */
    async exists(id: string): Promise<boolean> {
        const count = await this.prisma.role.count({
            where: { id },
        });
        return count > 0;
    }

    /**
     * Find roles by IDs
     * @param ids - Array of role IDs
     */
    async findByIds(ids: string[]) {
        return this.prisma.role.findMany({
            where: {
                id: { in: ids },
            },
            include: {
                channels: {
                    include: {
                        channel: true,
                    },
                },
            },
        });
    }

    /**
     * Add role to channel
     * @param roleId - Role ID
     * @param channelId - Channel ID
     */
    async addToChannel(roleId: string, channelId: string) {
        return this.prisma.roleChannel.create({
            data: {
                roleId,
                channelId,
            },
        });
    }

    /**
     * Remove role from channel
     * @param roleId - Role ID
     * @param channelId - Channel ID
     */
    async removeFromChannel(roleId: string, channelId: string) {
        return this.prisma.roleChannel.delete({
            where: {
                roleId_channelId: {
                    roleId,
                    channelId,
                },
            },
        });
    }

    /**
     * Get role channels
     * @param roleId - Role ID
     */
    async getChannels(roleId: string) {
        const roleChannels = await this.prisma.roleChannel.findMany({
            where: { roleId },
            include: {
                channel: true,
            },
        });

        return roleChannels.map(rc => rc.channel);
    }

    /**
     * Get users with this role
     * @param roleId - Role ID
     */
    async getUsers(roleId: string) {
        const userRoles = await this.prisma.userRole.findMany({
            where: { roleId },
            include: {
                user: true,
            },
        });

        return userRoles.map(ur => ur.user);
    }

    /**
     * Find roles with specific permission
     * @param permission - Permission code
     */
    async findByPermission(permission: string) {
        return this.prisma.role.findMany({
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
    }
}
