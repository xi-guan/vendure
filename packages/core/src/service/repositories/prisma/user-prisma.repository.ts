import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../connection/prisma.service';

/**
 * @description
 * Repository for User entity using Prisma ORM.
 * This is part of Phase 2.6 - Continued migration from TypeORM to Prisma.
 *
 * Provides type-safe database operations for User entity with
 * improved query performance and better developer experience.
 *
 * @example
 * ```typescript
 * const user = await userPrismaRepo.findOne('user-id');
 * const users = await userPrismaRepo.findMany({
 *   where: { verified: true },
 *   skip: 0,
 *   take: 10,
 * });
 * ```
 *
 * @docsCategory services
 * @since 3.6.0
 */
@Injectable()
export class UserPrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Find a single user by ID
     * @param id - User ID
     * @param includeRelations - Whether to include related entities
     */
    async findOne(id: string, includeRelations: boolean = true) {
        return this.prisma.user.findUnique({
            where: { id },
            include: includeRelations
                ? {
                      customer: true,
                      administrator: true,
                      authenticationMethods: true,
                      roles: {
                          include: {
                              role: true,
                          },
                      },
                      sessions: true,
                  }
                : undefined,
        });
    }

    /**
     * Find a user by identifier (email/username)
     * @param identifier - User identifier
     */
    async findByIdentifier(identifier: string) {
        return this.prisma.user.findFirst({
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
    }

    /**
     * Find users with pagination and filtering
     * @param params - Query parameters
     */
    async findMany(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.UserWhereUniqueInput;
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput;
    }) {
        const { skip, take, cursor, where, orderBy } = params;

        const [items, count] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take,
                cursor,
                where: {
                    ...where,
                    deletedAt: null, // Exclude soft-deleted users
                },
                orderBy,
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
                    ...where,
                    deletedAt: null,
                },
            }),
        ]);

        return {
            items,
            totalItems: count,
        };
    }

    /**
     * Create a new user
     * @param data - User data
     */
    async create(data: Prisma.UserCreateInput) {
        return this.prisma.user.create({
            data,
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
    }

    /**
     * Update a user
     * @param id - User ID
     * @param data - Update data
     */
    async update(id: string, data: Prisma.UserUpdateInput) {
        return this.prisma.user.update({
            where: { id },
            data,
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
    }

    /**
     * Soft delete a user
     * @param id - User ID
     */
    async softDelete(id: string) {
        return this.prisma.user.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    /**
     * Restore a soft-deleted user
     * @param id - User ID
     */
    async restore(id: string) {
        return this.prisma.user.update({
            where: { id },
            data: {
                deletedAt: null,
            },
        });
    }

    /**
     * Hard delete a user (use with caution!)
     * @param id - User ID
     */
    async hardDelete(id: string) {
        return this.prisma.user.delete({
            where: { id },
        });
    }

    /**
     * Count users matching criteria
     * @param where - Filter criteria
     */
    async count(where?: Prisma.UserWhereInput) {
        return this.prisma.user.count({
            where: {
                ...where,
                deletedAt: null,
            },
        });
    }

    /**
     * Check if user exists
     * @param id - User ID
     */
    async exists(id: string): Promise<boolean> {
        const count = await this.prisma.user.count({
            where: { id, deletedAt: null },
        });
        return count > 0;
    }

    /**
     * Find users by IDs
     * @param ids - Array of user IDs
     */
    async findByIds(ids: string[]) {
        return this.prisma.user.findMany({
            where: {
                id: { in: ids },
                deletedAt: null,
            },
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
    }

    /**
     * Add user to role
     * @param userId - User ID
     * @param roleId - Role ID
     */
    async addToRole(userId: string, roleId: string) {
        return this.prisma.userRole.create({
            data: {
                userId,
                roleId,
            },
        });
    }

    /**
     * Remove user from role
     * @param userId - User ID
     * @param roleId - Role ID
     */
    async removeFromRole(userId: string, roleId: string) {
        return this.prisma.userRole.delete({
            where: {
                userId_roleId: {
                    userId,
                    roleId,
                },
            },
        });
    }

    /**
     * Get user roles
     * @param userId - User ID
     */
    async getRoles(userId: string) {
        const userRoles = await this.prisma.userRole.findMany({
            where: { userId },
            include: {
                role: true,
            },
        });

        return userRoles.map(ur => ur.role);
    }

    /**
     * Update last login timestamp
     * @param id - User ID
     */
    async updateLastLogin(id: string) {
        return this.prisma.user.update({
            where: { id },
            data: {
                lastLogin: new Date(),
            },
        });
    }

    /**
     * Mark user as verified
     * @param id - User ID
     */
    async setVerified(id: string, verified: boolean = true) {
        return this.prisma.user.update({
            where: { id },
            data: { verified },
        });
    }

    /**
     * Find verified users
     */
    async findVerified() {
        return this.prisma.user.findMany({
            where: {
                verified: true,
                deletedAt: null,
            },
            include: {
                customer: true,
                administrator: true,
            },
        });
    }

    /**
     * Find unverified users
     */
    async findUnverified() {
        return this.prisma.user.findMany({
            where: {
                verified: false,
                deletedAt: null,
            },
            include: {
                customer: true,
                administrator: true,
            },
        });
    }
}
