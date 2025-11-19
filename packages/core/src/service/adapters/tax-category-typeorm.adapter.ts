import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { TransactionalConnection } from '../../connection/transactional-connection';
import { TaxCategory } from '../../entity/tax-category/tax-category.entity';

import { ITaxCategoryOrmAdapter } from './tax-category-orm.adapter';

/**
 * @description
 * TypeORM implementation of the TaxCategory ORM adapter.
 * Wraps existing TypeORM operations to provide a unified interface.
 *
 * @since 3.6.0
 */
@Injectable()
export class TaxCategoryTypeOrmAdapter implements ITaxCategoryOrmAdapter {
    constructor(private connection: TransactionalConnection) {}

    async findOne(id: ID, includeRelations: string[] = []): Promise<TaxCategory | undefined> {
        const repository = this.connection.getRepository(TaxCategory);
        const entity = await repository.findOne({
            where: { id } as any,
            relations: includeRelations,
        });
        return entity || undefined;
    }

    async findAll(options: any = {}): Promise<PaginatedList<TaxCategory>> {
        const { skip = 0, take = 20, filter = {}, sort = {} } = options;
        const repository = this.connection.getRepository(TaxCategory);

        const [items, totalItems] = await repository.findAndCount({
            where: filter,
            skip,
            take,
            order: sort,
        });

        return { items, totalItems };
    }

    async create(data: any): Promise<TaxCategory> {
        const repository = this.connection.getRepository(TaxCategory);
        const entity = repository.create(data);
        await repository.save(entity);
        return entity;
    }

    async update(id: ID, data: any): Promise<TaxCategory> {
        const repository = this.connection.getRepository(TaxCategory);
        await repository.update(id, data);
        const entity = await repository.findOne({ where: { id } as any });
        if (!entity) {
            throw new Error(`TaxCategory with id ${id} not found`);
        }
        return entity;
    }

    async delete(id: ID): Promise<void> {
        const repository = this.connection.getRepository(TaxCategory);
        await repository.delete(id);
    }

    async exists(id: ID): Promise<boolean> {
        const repository = this.connection.getRepository(TaxCategory);
        const count = await repository.count({ where: { id } as any });
        return count > 0;
    }

    async count(filter: any = {}): Promise<number> {
        const repository = this.connection.getRepository(TaxCategory);
        return repository.count({ where: filter });
    }

    // Additional methods specific to TaxCategory should be implemented here
    // based on the interface definition in tax-category-orm.adapter.ts
}
