import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { PrismaService } from '../../connection/prisma.service';
import { Role } from '../../entity/role/role.entity';
import { User } from '../../entity/user/user.entity';

import { CreateUserData, IUserOrmAdapter, UpdateUserData, UserListOptions } from './user-orm.adapter';

/**
 * @description
 * Prisma implementation of the User ORM adapter.
 * Translates User operations to Prisma Client calls and maps results
 * to TypeORM entity instances for backward compatibility.
 *
 * @since 3.6.0
 */
@Injectable()
export class UserPrismaAdapter implements IUserOrmAdapter {
    constructor(private prisma: PrismaService) {}

    async findOne(id: ID, includeRelations: string[] = []): Promise<User | undefined> {
        const user = await this.prisma.user.findUnique({
            where: { id: String(id) },
            include: {
                customer: includeRelations.includes('customer'),
                administrator: includeRelations.includes('administrator'),
                authenticationMethods: includeRelations.includes('authenticationMethods'),
                roles: includeRelations.includes('roles')
                    ? {
                          include: {
                              role: true,
                          },
                      }
                    : false,
                sessions: includeRelations.includes('sessions'),
            },
        });

        return user ? this.mapToEntity(user) : undefined;
    }

    async findByIdentifier(identifier: string): Promise<User | undefined> {
        const user = await this.prisma.user.findFirst({
            where: {
                identifier,
                deletedAt: null,
            },
            include: {
                customer: true,
                administrator: true,
                authenticationMethods: true,
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        });

        return user ? this.mapToEntity(user) : undefined;
    }

    async findAll(options: UserListOptions): Promise<PaginatedList<User>> {
        const { skip = 0, take = 20, filter = {}, sort = {} } = options;

        const [items, totalItems] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take,
                where: {
                    ...this.mapFilter(filter),
                    deletedAt: null,
                },
                orderBy: this.mapSort(sort),
                include: {
                    customer: true,
                    administrator: true,
                    roles: {
                        include: {
                            role: true,
                        },
                    },
                },
            }),
            this.prisma.user.count({
                where: {
                    ...this.mapFilter(filter),
                    deletedAt: null,
                },
            }),
        ]);

        return {
            items: items.map(item => this.mapToEntity(item)),
            totalItems,
        };
    }

    async create(data: CreateUserData): Promise<User> {
        const user = await this.prisma.user.create({
            data: {
                identifier: data.identifier,
                verified: data.verified ?? false,
                lastLogin: data.lastLogin,
                customFields: data.customFields || undefined,
            },
            include: {
                customer: true,
                administrator: true,
                authenticationMethods: true,
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        });

        return this.mapToEntity(user);
    }

    async update(id: ID, data: UpdateUserData): Promise<User> {
        const user = await this.prisma.user.update({
            where: { id: String(id) },
            data: {
                identifier: data.identifier,
                verified: data.verified,
                lastLogin: data.lastLogin,
                customFields: data.customFields,
            },
            include: {
                customer: true,
                administrator: true,
                authenticationMethods: true,
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        });

        return this.mapToEntity(user);
    }

    async softDelete(id: ID): Promise<void> {
        await this.prisma.user.update({
            where: { id: String(id) },
            data: { deletedAt: new Date() },
        });
    }

    async restore(id: ID): Promise<User> {
        const user = await this.prisma.user.update({
            where: { id: String(id) },
            data: { deletedAt: null },
            include: {
                customer: true,
                administrator: true,
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        });

        return this.mapToEntity(user);
    }

    async exists(id: ID): Promise<boolean> {
        const count = await this.prisma.user.count({
            where: {
                id: String(id),
                deletedAt: null,
            },
        });
        return count > 0;
    }

    async count(filter: any = {}): Promise<number> {
        return this.prisma.user.count({
            where: {
                ...this.mapFilter(filter),
                deletedAt: null,
            },
        });
    }

    async addToRole(userId: ID, roleId: ID): Promise<void> {
        await this.prisma.userRole.create({
            data: {
                userId: String(userId),
                roleId: String(roleId),
            },
        });
    }

    async removeFromRole(userId: ID, roleId: ID): Promise<void> {
        await this.prisma.userRole.delete({
            where: {
                userId_roleId: {
                    userId: String(userId),
                    roleId: String(roleId),
                },
            },
        });
    }

    async getRoles(userId: ID): Promise<Role[]> {
        const userRoles = await this.prisma.userRole.findMany({
            where: { userId: String(userId) },
            include: {
                role: true,
            },
        });

        return userRoles.map(ur => this.mapToRoleEntity(ur.role));
    }

    async updateLastLogin(id: ID): Promise<User> {
        const user = await this.prisma.user.update({
            where: { id: String(id) },
            data: {
                lastLogin: new Date(),
            },
            include: {
                customer: true,
                administrator: true,
            },
        });

        return this.mapToEntity(user);
    }

    async setVerified(id: ID, verified: boolean = true): Promise<User> {
        const user = await this.prisma.user.update({
            where: { id: String(id) },
            data: { verified },
            include: {
                customer: true,
                administrator: true,
            },
        });

        return this.mapToEntity(user);
    }

    async findVerified(): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            where: {
                verified: true,
                deletedAt: null,
            },
            include: {
                customer: true,
                administrator: true,
            },
        });

        return users.map(u => this.mapToEntity(u));
    }

    async findUnverified(): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            where: {
                verified: false,
                deletedAt: null,
            },
            include: {
                customer: true,
                administrator: true,
            },
        });

        return users.map(u => this.mapToEntity(u));
    }

    /**
     * Map Prisma user to TypeORM entity for backward compatibility
     * @private
     */
    private mapToEntity(prismaUser: any): User {
        const user = new User({
            id: prismaUser.id,
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt,
            deletedAt: prismaUser.deletedAt,
            identifier: prismaUser.identifier,
            verified: prismaUser.verified,
            lastLogin: prismaUser.lastLogin,
            customFields: prismaUser.customFields,
        });

        // Map relations if included
        if (prismaUser.customer) {
            user.customer = prismaUser.customer;
        }
        if (prismaUser.administrator) {
            user.administrator = prismaUser.administrator;
        }
        if (prismaUser.authenticationMethods) {
            user.authenticationMethods = prismaUser.authenticationMethods;
        }
        if (prismaUser.roles) {
            user.roles = prismaUser.roles.map((ur: any) => this.mapToRoleEntity(ur.role));
        }

        return user;
    }

    /**
     * Map Prisma role to TypeORM entity
     * @private
     */
    private mapToRoleEntity(prismaRole: any): Role {
        return new Role({
            id: prismaRole.id,
            createdAt: prismaRole.createdAt,
            updatedAt: prismaRole.updatedAt,
            code: prismaRole.code,
            description: prismaRole.description,
            permissions: prismaRole.permissions,
            customFields: prismaRole.customFields,
        });
    }

    /**
     * Map filter object to Prisma where clause
     * @private
     */
    private mapFilter(filter: any): any {
        const prismaFilter: any = {};

        if (filter.identifier) {
            prismaFilter.identifier = { contains: filter.identifier, mode: 'insensitive' };
        }
        if (filter.verified !== undefined) {
            prismaFilter.verified = filter.verified;
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
        if (sort.identifier) {
            prismaOrderBy.identifier = sort.identifier === 'ASC' ? 'asc' : 'desc';
        }

        return Object.keys(prismaOrderBy).length > 0 ? prismaOrderBy : { createdAt: 'desc' };
    }
}
