import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { PrismaService } from '../../connection/prisma.service';
import { Administrator } from '../../entity/administrator/administrator.entity';

import {
    AdministratorListOptions,
    CreateAdministratorData,
    IAdministratorOrmAdapter,
    UpdateAdministratorData,
} from './administrator-orm.adapter';

/**
 * @description
 * Prisma implementation of the Administrator ORM adapter.
 * Translates Administrator operations to Prisma Client calls and maps results
 * to TypeORM entity instances for backward compatibility.
 *
 * @since 3.6.0
 */
@Injectable()
export class AdministratorPrismaAdapter implements IAdministratorOrmAdapter {
    constructor(private prisma: PrismaService) {}

    async findOne(id: ID, includeRelations: string[] = []): Promise<Administrator | undefined> {
        const administrator = await this.prisma.administrator.findUnique({
            where: { id: String(id) },
            include: {
                user: includeRelations.includes('user'),
                historyEntries: includeRelations.includes('historyEntries'),
            },
        });

        return administrator ? this.mapToEntity(administrator) : undefined;
    }

    async findByEmail(emailAddress: string): Promise<Administrator | undefined> {
        const administrator = await this.prisma.administrator.findFirst({
            where: {
                emailAddress,
                deletedAt: null,
            },
            include: {
                user: true,
            },
        });

        return administrator ? this.mapToEntity(administrator) : undefined;
    }

    async findByUserId(userId: ID): Promise<Administrator | undefined> {
        const administrator = await this.prisma.administrator.findFirst({
            where: {
                userId: String(userId),
                deletedAt: null,
            },
            include: {
                user: true,
            },
        });

        return administrator ? this.mapToEntity(administrator) : undefined;
    }

    async findAll(options: AdministratorListOptions): Promise<PaginatedList<Administrator>> {
        const { skip = 0, take = 20, filter = {}, sort = {} } = options;

        const [items, totalItems] = await Promise.all([
            this.prisma.administrator.findMany({
                skip,
                take,
                where: {
                    ...this.mapFilter(filter),
                    deletedAt: null,
                },
                orderBy: this.mapSort(sort),
                include: {
                    user: true,
                },
            }),
            this.prisma.administrator.count({
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

    async create(data: CreateAdministratorData): Promise<Administrator> {
        const administrator = await this.prisma.administrator.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                emailAddress: data.emailAddress,
                user: {
                    connect: { id: String(data.userId) },
                },
                customFields: data.customFields || undefined,
            },
            include: {
                user: true,
            },
        });

        return this.mapToEntity(administrator);
    }

    async update(id: ID, data: UpdateAdministratorData): Promise<Administrator> {
        const administrator = await this.prisma.administrator.update({
            where: { id: String(id) },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                emailAddress: data.emailAddress,
                customFields: data.customFields,
            },
            include: {
                user: true,
            },
        });

        return this.mapToEntity(administrator);
    }

    async softDelete(id: ID): Promise<void> {
        await this.prisma.administrator.update({
            where: { id: String(id) },
            data: { deletedAt: new Date() },
        });
    }

    async restore(id: ID): Promise<Administrator> {
        const administrator = await this.prisma.administrator.update({
            where: { id: String(id) },
            data: { deletedAt: null },
            include: {
                user: true,
            },
        });

        return this.mapToEntity(administrator);
    }

    async exists(id: ID): Promise<boolean> {
        const count = await this.prisma.administrator.count({
            where: {
                id: String(id),
                deletedAt: null,
            },
        });
        return count > 0;
    }

    async count(filter: any = {}): Promise<number> {
        return this.prisma.administrator.count({
            where: {
                ...this.mapFilter(filter),
                deletedAt: null,
            },
        });
    }

    async search(
        searchTerm: string,
        options: AdministratorListOptions = {},
    ): Promise<PaginatedList<Administrator>> {
        const { skip = 0, take = 20 } = options;

        return this.findAll({
            skip,
            take,
            filter: {
                OR: [
                    { firstName: { contains: searchTerm, mode: 'insensitive' } },
                    { lastName: { contains: searchTerm, mode: 'insensitive' } },
                    { emailAddress: { contains: searchTerm, mode: 'insensitive' } },
                ],
            },
            sort: {
                createdAt: 'DESC',
            },
        });
    }

    /**
     * Map Prisma administrator to TypeORM entity for backward compatibility
     * @private
     */
    private mapToEntity(prismaAdministrator: any): Administrator {
        const administrator = new Administrator({
            id: prismaAdministrator.id,
            createdAt: prismaAdministrator.createdAt,
            updatedAt: prismaAdministrator.updatedAt,
            deletedAt: prismaAdministrator.deletedAt,
            firstName: prismaAdministrator.firstName,
            lastName: prismaAdministrator.lastName,
            emailAddress: prismaAdministrator.emailAddress,
            customFields: prismaAdministrator.customFields,
        });

        // Map relations if included
        if (prismaAdministrator.user) {
            administrator.user = prismaAdministrator.user;
        }

        return administrator;
    }

    /**
     * Map filter object to Prisma where clause
     * @private
     */
    private mapFilter(filter: any): any {
        const prismaFilter: any = {};

        if (filter.firstName) {
            prismaFilter.firstName = { contains: filter.firstName, mode: 'insensitive' };
        }
        if (filter.lastName) {
            prismaFilter.lastName = { contains: filter.lastName, mode: 'insensitive' };
        }
        if (filter.emailAddress) {
            prismaFilter.emailAddress = { contains: filter.emailAddress, mode: 'insensitive' };
        }
        if (filter.OR) {
            prismaFilter.OR = filter.OR;
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
        if (sort.lastName) {
            prismaOrderBy.lastName = sort.lastName === 'ASC' ? 'asc' : 'desc';
        }

        return Object.keys(prismaOrderBy).length > 0 ? prismaOrderBy : { createdAt: 'desc' };
    }
}
