import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../connection/prisma.service';

/**
 * @description
 * Repository for Administrator entity using Prisma ORM.
 * This is part of Phase 2.6 - Continued migration from TypeORM to Prisma.
 *
 * Provides type-safe database operations for Administrator entity with
 * improved query performance and better developer experience.
 *
 * @example
 * ```typescript
 * const administrator = await administratorPrismaRepo.findOne('admin-id');
 * const administrators = await administratorPrismaRepo.findMany({
 *   where: { emailAddress: { contains: '@example.com' } },
 *   skip: 0,
 *   take: 10,
 * });
 * ```
 *
 * @docsCategory services
 * @since 3.6.0
 */
@Injectable()
export class AdministratorPrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Find a single administrator by ID
     * @param id - Administrator ID
     * @param includeRelations - Whether to include related entities
     */
    async findOne(id: string, includeRelations: boolean = true) {
        return this.prisma.administrator.findUnique({
            where: { id },
            include: includeRelations
                ? {
                      user: true,
                      historyEntries: true,
                  }
                : undefined,
        });
    }

    /**
     * Find an administrator by email address
     * @param emailAddress - Administrator email
     */
    async findByEmail(emailAddress: string) {
        return this.prisma.administrator.findFirst({
            where: {
                emailAddress,
                deletedAt: null,
            },
            include: {
                user: true,
            },
        });
    }

    /**
     * Find an administrator by user ID
     * @param userId - User ID
     */
    async findByUserId(userId: string) {
        return this.prisma.administrator.findFirst({
            where: {
                userId,
                deletedAt: null,
            },
            include: {
                user: true,
            },
        });
    }

    /**
     * Find administrators with pagination and filtering
     * @param params - Query parameters
     */
    async findMany(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.AdministratorWhereUniqueInput;
        where?: Prisma.AdministratorWhereInput;
        orderBy?: Prisma.AdministratorOrderByWithRelationInput;
    }) {
        const { skip, take, cursor, where, orderBy } = params;

        const [items, count] = await Promise.all([
            this.prisma.administrator.findMany({
                skip,
                take,
                cursor,
                where: {
                    ...where,
                    deletedAt: null, // Exclude soft-deleted administrators
                },
                orderBy,
                include: {
                    user: true,
                },
            }),
            this.prisma.administrator.count({
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
     * Create a new administrator
     * @param data - Administrator data
     */
    async create(data: Prisma.AdministratorCreateInput) {
        return this.prisma.administrator.create({
            data,
            include: {
                user: true,
            },
        });
    }

    /**
     * Update an administrator
     * @param id - Administrator ID
     * @param data - Update data
     */
    async update(id: string, data: Prisma.AdministratorUpdateInput) {
        return this.prisma.administrator.update({
            where: { id },
            data,
            include: {
                user: true,
            },
        });
    }

    /**
     * Soft delete an administrator
     * @param id - Administrator ID
     */
    async softDelete(id: string) {
        return this.prisma.administrator.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    /**
     * Restore a soft-deleted administrator
     * @param id - Administrator ID
     */
    async restore(id: string) {
        return this.prisma.administrator.update({
            where: { id },
            data: {
                deletedAt: null,
            },
        });
    }

    /**
     * Hard delete an administrator (use with caution!)
     * @param id - Administrator ID
     */
    async hardDelete(id: string) {
        return this.prisma.administrator.delete({
            where: { id },
        });
    }

    /**
     * Count administrators matching criteria
     * @param where - Filter criteria
     */
    async count(where?: Prisma.AdministratorWhereInput) {
        return this.prisma.administrator.count({
            where: {
                ...where,
                deletedAt: null,
            },
        });
    }

    /**
     * Check if administrator exists
     * @param id - Administrator ID
     */
    async exists(id: string): Promise<boolean> {
        const count = await this.prisma.administrator.count({
            where: { id, deletedAt: null },
        });
        return count > 0;
    }

    /**
     * Find administrators by IDs
     * @param ids - Array of administrator IDs
     */
    async findByIds(ids: string[]) {
        return this.prisma.administrator.findMany({
            where: {
                id: { in: ids },
                deletedAt: null,
            },
            include: {
                user: true,
            },
        });
    }

    /**
     * Search administrators by name or email
     * @param searchTerm - Search term
     * @param options - Pagination options
     */
    async search(searchTerm: string, options: { skip?: number; take?: number } = {}) {
        const { skip = 0, take = 20 } = options;

        return this.findMany({
            skip,
            take,
            where: {
                OR: [
                    { firstName: { contains: searchTerm, mode: 'insensitive' } },
                    { lastName: { contains: searchTerm, mode: 'insensitive' } },
                    { emailAddress: { contains: searchTerm, mode: 'insensitive' } },
                ],
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}
