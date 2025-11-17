import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../connection/prisma.service';

/**
 * @description
 * Repository for Channel entity using Prisma ORM.
 * This is part of Phase 2.6 - Continued migration from TypeORM to Prisma.
 *
 * @docsCategory services
 * @since 3.6.0
 */
@Injectable()
export class ChannelPrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findOne(id: string, includeRelations: boolean = true) {
        return this.prisma.channel.findUnique({
            where: { id },
            include: includeRelations
                ? {
                      roles: { include: { role: true } },
                      sellers: { include: { seller: true } },
                  }
                : undefined,
        });
    }

    async findByCode(code: string) {
        return this.prisma.channel.findUnique({
            where: { code },
        });
    }

    async findByToken(token: string) {
        return this.prisma.channel.findUnique({
            where: { token },
        });
    }

    async findMany(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.ChannelWhereUniqueInput;
        where?: Prisma.ChannelWhereInput;
        orderBy?: Prisma.ChannelOrderByWithRelationInput;
    }) {
        const { skip, take, cursor, where, orderBy } = params;

        const [items, count] = await Promise.all([
            this.prisma.channel.findMany({ skip, take, cursor, where, orderBy }),
            this.prisma.channel.count({ where }),
        ]);

        return { items, totalItems: count };
    }

    async create(data: Prisma.ChannelCreateInput) {
        return this.prisma.channel.create({ data });
    }

    async update(id: string, data: Prisma.ChannelUpdateInput) {
        return this.prisma.channel.update({ where: { id }, data });
    }

    async delete(id: string) {
        return this.prisma.channel.delete({ where: { id } });
    }

    async count(where?: Prisma.ChannelWhereInput) {
        return this.prisma.channel.count({ where });
    }

    async exists(id: string): Promise<boolean> {
        return (await this.prisma.channel.count({ where: { id } })) > 0;
    }

    async findByIds(ids: string[]) {
        return this.prisma.channel.findMany({ where: { id: { in: ids } } });
    }
}
