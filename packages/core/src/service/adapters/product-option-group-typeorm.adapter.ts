import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { TransactionalConnection } from '../../connection/transactional-connection';
import { ProductOptionGroup } from '../../entity/product-option-group/product-option-group.entity';

import { IProductOptionGroupOrmAdapter } from './product-option-group-orm.adapter';

/**
 * @description
 * TypeORM implementation of the ProductOptionGroup ORM adapter.
 * Wraps existing TypeORM operations to provide a unified interface.
 *
 * @since 3.6.0
 */
@Injectable()
export class ProductOptionGroupTypeOrmAdapter implements IProductOptionGroupOrmAdapter {
    constructor(private connection: TransactionalConnection) {}

    async findOne(id: ID, includeRelations: string[] = []): Promise<ProductOptionGroup | undefined> {
        const repository = this.connection.getRepository(ProductOptionGroup);
        const entity = await repository.findOne({
            where: { id } as any,
            relations: includeRelations,
        });
        return entity || undefined;
    }

    async findAll(options: any = {}): Promise<PaginatedList<ProductOptionGroup>> {
        const { skip = 0, take = 20, filter = {}, sort = {} } = options;
        const repository = this.connection.getRepository(ProductOptionGroup);

        const [items, totalItems] = await repository.findAndCount({
            where: filter,
            skip,
            take,
            order: sort,
        });

        return { items, totalItems };
    }

    async create(data: any): Promise<ProductOptionGroup> {
        const repository = this.connection.getRepository(ProductOptionGroup);
        const entity = repository.create(data);
        await repository.save(entity);
        return entity;
    }

    async update(id: ID, data: any): Promise<ProductOptionGroup> {
        const repository = this.connection.getRepository(ProductOptionGroup);
        await repository.update(id, data);
        const entity = await repository.findOne({ where: { id } as any });
        if (!entity) {
            throw new Error(`ProductOptionGroup with id ${id} not found`);
        }
        return entity;
    }

    async delete(id: ID): Promise<void> {
        const repository = this.connection.getRepository(ProductOptionGroup);
        await repository.delete(id);
    }

    async exists(id: ID): Promise<boolean> {
        const repository = this.connection.getRepository(ProductOptionGroup);
        const count = await repository.count({ where: { id } as any });
        return count > 0;
    }

    async count(filter: any = {}): Promise<number> {
        const repository = this.connection.getRepository(ProductOptionGroup);
        return repository.count({ where: filter });
    }

    // Additional methods specific to ProductOptionGroup should be implemented here
    // based on the interface definition in product-option-group-orm.adapter.ts
}
