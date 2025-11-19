import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { TransactionalConnection } from '../../connection/transactional-connection';
import { ShippingLine } from '../../entity/shipping-line/shipping-line.entity';

import { IShippingLineOrmAdapter } from './shipping-line-orm.adapter';

/**
 * @description
 * TypeORM implementation of the ShippingLine ORM adapter.
 * Wraps existing TypeORM operations to provide a unified interface.
 *
 * @since 3.6.0
 */
@Injectable()
export class ShippingLineTypeOrmAdapter implements IShippingLineOrmAdapter {
    constructor(private connection: TransactionalConnection) {}

    async findOne(id: ID, includeRelations: string[] = []): Promise<ShippingLine | undefined> {
        const repository = this.connection.getRepository(ShippingLine);
        const entity = await repository.findOne({
            where: { id } as any,
            relations: includeRelations,
        });
        return entity || undefined;
    }

    async findAll(options: any = {}): Promise<PaginatedList<ShippingLine>> {
        const { skip = 0, take = 20, filter = {}, sort = {} } = options;
        const repository = this.connection.getRepository(ShippingLine);

        const [items, totalItems] = await repository.findAndCount({
            where: filter,
            skip,
            take,
            order: sort,
        });

        return { items, totalItems };
    }

    async create(data: any): Promise<ShippingLine> {
        const repository = this.connection.getRepository(ShippingLine);
        const entity = repository.create(data);
        await repository.save(entity);
        return entity;
    }

    async update(id: ID, data: any): Promise<ShippingLine> {
        const repository = this.connection.getRepository(ShippingLine);
        await repository.update(id, data);
        const entity = await repository.findOne({ where: { id } as any });
        if (!entity) {
            throw new Error(`ShippingLine with id ${id} not found`);
        }
        return entity;
    }

    async delete(id: ID): Promise<void> {
        const repository = this.connection.getRepository(ShippingLine);
        await repository.delete(id);
    }

    async exists(id: ID): Promise<boolean> {
        const repository = this.connection.getRepository(ShippingLine);
        const count = await repository.count({ where: { id } as any });
        return count > 0;
    }

    async count(filter: any = {}): Promise<number> {
        const repository = this.connection.getRepository(ShippingLine);
        return repository.count({ where: filter });
    }

    // Additional methods specific to ShippingLine should be implemented here
    // based on the interface definition in shipping-line-orm.adapter.ts
}
