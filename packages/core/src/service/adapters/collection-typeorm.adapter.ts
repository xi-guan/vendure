import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { TransactionalConnection } from '../../connection/transactional-connection';
import { Collection } from '../../entity/collection/collection.entity';

import { ICollectionOrmAdapter } from './collection-orm.adapter';

/**
 * @description
 * TypeORM implementation of the Collection ORM adapter.
 * Wraps existing TypeORM operations to provide a unified interface.
 *
 * @since 3.6.0
 */
@Injectable()
export class CollectionTypeOrmAdapter implements ICollectionOrmAdapter {
    constructor(private connection: TransactionalConnection) {}

    async findOne(id: ID, includeRelations: string[] = []): Promise<Collection | undefined> {
        const repository = this.connection.getRepository(Collection);
        const entity = await repository.findOne({
            where: { id } as any,
            relations: includeRelations,
        });
        return entity || undefined;
    }

    async findAll(options: any = {}): Promise<PaginatedList<Collection>> {
        const { skip = 0, take = 20, filter = {}, sort = {} } = options;
        const repository = this.connection.getRepository(Collection);

        const [items, totalItems] = await repository.findAndCount({
            where: filter,
            skip,
            take,
            order: sort,
        });

        return { items, totalItems };
    }

    async create(data: any): Promise<Collection> {
        const repository = this.connection.getRepository(Collection);
        const entity = repository.create(data);
        await repository.save(entity);
        return entity;
    }

    async update(id: ID, data: any): Promise<Collection> {
        const repository = this.connection.getRepository(Collection);
        await repository.update(id, data);
        const entity = await repository.findOne({ where: { id } as any });
        if (!entity) {
            throw new Error(`Collection with id ${id} not found`);
        }
        return entity;
    }

    async delete(id: ID): Promise<void> {
        const repository = this.connection.getRepository(Collection);
        await repository.delete(id);
    }

    async exists(id: ID): Promise<boolean> {
        const repository = this.connection.getRepository(Collection);
        const count = await repository.count({ where: { id } as any });
        return count > 0;
    }

    async count(filter: any = {}): Promise<number> {
        const repository = this.connection.getRepository(Collection);
        return repository.count({ where: filter });
    }

    // Additional methods specific to Collection should be implemented here
    // based on the interface definition in collection-orm.adapter.ts
}
