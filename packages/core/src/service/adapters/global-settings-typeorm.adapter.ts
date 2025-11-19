import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { TransactionalConnection } from '../../connection/transactional-connection';
import { GlobalSettings } from '../../entity/global-settings/global-settings.entity';

import { IGlobalSettingsOrmAdapter } from './global-settings-orm.adapter';

/**
 * @description
 * TypeORM implementation of the GlobalSettings ORM adapter.
 * Wraps existing TypeORM operations to provide a unified interface.
 *
 * @since 3.6.0
 */
@Injectable()
export class GlobalSettingsTypeOrmAdapter implements IGlobalSettingsOrmAdapter {
    constructor(private connection: TransactionalConnection) {}

    async findOne(id: ID, includeRelations: string[] = []): Promise<GlobalSettings | undefined> {
        const repository = this.connection.getRepository(GlobalSettings);
        const entity = await repository.findOne({
            where: { id } as any,
            relations: includeRelations,
        });
        return entity || undefined;
    }

    async findAll(options: any = {}): Promise<PaginatedList<GlobalSettings>> {
        const { skip = 0, take = 20, filter = {}, sort = {} } = options;
        const repository = this.connection.getRepository(GlobalSettings);

        const [items, totalItems] = await repository.findAndCount({
            where: filter,
            skip,
            take,
            order: sort,
        });

        return { items, totalItems };
    }

    async create(data: any): Promise<GlobalSettings> {
        const repository = this.connection.getRepository(GlobalSettings);
        const entity = repository.create(data);
        await repository.save(entity);
        return entity;
    }

    async update(id: ID, data: any): Promise<GlobalSettings> {
        const repository = this.connection.getRepository(GlobalSettings);
        await repository.update(id, data);
        const entity = await repository.findOne({ where: { id } as any });
        if (!entity) {
            throw new Error(`GlobalSettings with id ${id} not found`);
        }
        return entity;
    }

    async delete(id: ID): Promise<void> {
        const repository = this.connection.getRepository(GlobalSettings);
        await repository.delete(id);
    }

    async exists(id: ID): Promise<boolean> {
        const repository = this.connection.getRepository(GlobalSettings);
        const count = await repository.count({ where: { id } as any });
        return count > 0;
    }

    async count(filter: any = {}): Promise<number> {
        const repository = this.connection.getRepository(GlobalSettings);
        return repository.count({ where: filter });
    }

    // Additional methods specific to GlobalSettings should be implemented here
    // based on the interface definition in global-settings-orm.adapter.ts
}
