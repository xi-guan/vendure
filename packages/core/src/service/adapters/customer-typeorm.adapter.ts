import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { TransactionalConnection } from '../../connection/transactional-connection';
import { Channel } from '../../entity/channel/channel.entity';
import { CustomerGroup } from '../../entity/customer-group/customer-group.entity';
import { Customer } from '../../entity/customer/customer.entity';

import {
    CreateCustomerData,
    CustomerListOptions,
    ICustomerOrmAdapter,
    UpdateCustomerData,
} from './customer-orm.adapter';

/**
 * TypeORM implementation of Customer ORM adapter
 */
@Injectable()
export class CustomerTypeOrmAdapter implements ICustomerOrmAdapter {
    constructor(private connection: TransactionalConnection) {}

    async findOne(id: ID, includeRelations: string[] = []): Promise<Customer | undefined> {
        const repository = this.connection.getRepository(Customer);
        const relations = includeRelations.filter(r => ['addresses', 'user', 'groups', 'channels'].includes(r));
        const customer = await repository.findOne({
            where: { id } as any,
            relations,
        });
        return customer || undefined;
    }

    async findByEmail(emailAddress: string): Promise<Customer | undefined> {
        const repository = this.connection.getRepository(Customer);
        const customer = await repository.findOne({
            where: { emailAddress },
            relations: ['addresses', 'user'],
        });
        return customer || undefined;
    }

    async findByUserId(userId: ID): Promise<Customer | undefined> {
        const repository = this.connection.getRepository(Customer);
        const customer = await repository.findOne({
            where: { user: { id: userId }, deletedAt: null as any },
            relations: ['addresses', 'user'],
        });
        return customer || undefined;
    }

    async findAll(options: CustomerListOptions): Promise<PaginatedList<Customer>> {
        const { skip = 0, take = 20 } = options;
        const repository = this.connection.getRepository(Customer);
        const [items, totalItems] = await repository.findAndCount({
            where: { deletedAt: null as any },
            relations: ['addresses', 'user'],
            skip,
            take,
        });
        return { items, totalItems };
    }

    async create(data: CreateCustomerData): Promise<Customer> {
        const repository = this.connection.getRepository(Customer);
        const customer = repository.create(data as any);
        await repository.save(customer);
        return customer;
    }

    async update(id: ID, data: UpdateCustomerData): Promise<Customer> {
        const repository = this.connection.getRepository(Customer);
        await repository.update(id, data as any);
        const customer = await repository.findOne({ where: { id } as any });
        if (!customer) throw new Error('Customer not found');
        return customer;
    }

    async softDelete(id: ID): Promise<void> {
        const repository = this.connection.getRepository(Customer);
        await repository.update(id, { deletedAt: new Date() } as any);
    }

    async restore(id: ID): Promise<Customer> {
        const repository = this.connection.getRepository(Customer);
        await repository.update(id, { deletedAt: null } as any);
        const customer = await repository.findOne({ where: { id } as any });
        if (!customer) throw new Error('Customer not found');
        return customer;
    }

    async exists(id: ID): Promise<boolean> {
        const repository = this.connection.getRepository(Customer);
        const count = await repository.count({ where: { id } as any });
        return count > 0;
    }

    async count(filter: any = {}): Promise<number> {
        const repository = this.connection.getRepository(Customer);
        return repository.count({ where: { deletedAt: null as any, ...filter } });
    }

    async addToGroup(customerId: ID, groupId: ID): Promise<void> {
        const repository = this.connection.getRepository(Customer);
        const customer = await repository.findOne({ where: { id: customerId } as any, relations: ['groups'] });
        if (!customer) throw new Error('Customer not found');
        const groupRepository = this.connection.getRepository(CustomerGroup);
        const group = await groupRepository.findOne({ where: { id: groupId } as any });
        if (!group) throw new Error('Group not found');
        if (!customer.groups) customer.groups = [];
        if (!customer.groups.find(g => g.id === groupId)) {
            customer.groups.push(group);
            await repository.save(customer);
        }
    }

    async removeFromGroup(customerId: ID, groupId: ID): Promise<void> {
        const repository = this.connection.getRepository(Customer);
        const customer = await repository.findOne({ where: { id: customerId } as any, relations: ['groups'] });
        if (!customer) throw new Error('Customer not found');
        if (customer.groups) {
            customer.groups = customer.groups.filter(g => g.id !== groupId);
            await repository.save(customer);
        }
    }

    async getGroups(customerId: ID): Promise<CustomerGroup[]> {
        const repository = this.connection.getRepository(Customer);
        const customer = await repository.findOne({ where: { id: customerId } as any, relations: ['groups'] });
        return customer?.groups || [];
    }

    async addToChannel(customerId: ID, channelId: ID): Promise<void> {
        const repository = this.connection.getRepository(Customer);
        const customer = await repository.findOne({ where: { id: customerId } as any, relations: ['channels'] });
        if (!customer) throw new Error('Customer not found');
        const channelRepository = this.connection.getRepository(Channel);
        const channel = await channelRepository.findOne({ where: { id: channelId } as any });
        if (!channel) throw new Error('Channel not found');
        if (!customer.channels) customer.channels = [];
        if (!customer.channels.find(c => c.id === channelId)) {
            customer.channels.push(channel);
            await repository.save(customer);
        }
    }

    async removeFromChannel(customerId: ID, channelId: ID): Promise<void> {
        const repository = this.connection.getRepository(Customer);
        const customer = await repository.findOne({ where: { id: customerId } as any, relations: ['channels'] });
        if (!customer) throw new Error('Customer not found');
        if (customer.channels) {
            customer.channels = customer.channels.filter(c => c.id !== channelId);
            await repository.save(customer);
        }
    }

    async getChannels(customerId: ID): Promise<Channel[]> {
        const repository = this.connection.getRepository(Customer);
        const customer = await repository.findOne({ where: { id: customerId } as any, relations: ['channels'] });
        return customer?.channels || [];
    }

    async search(searchTerm: string, options: CustomerListOptions = {}): Promise<PaginatedList<Customer>> {
        const { skip = 0, take = 20 } = options;
        const repository = this.connection.getRepository(Customer);
        const queryBuilder = repository
            .createQueryBuilder('customer')
            .where('customer.deletedAt IS NULL')
            .andWhere(
                '(customer.firstName LIKE :term OR customer.lastName LIKE :term OR customer.emailAddress LIKE :term)',
                { term: `%${searchTerm}%` }
            )
            .skip(skip)
            .take(take);
        const [items, totalItems] = await queryBuilder.getManyAndCount();
        return { items, totalItems };
    }
}
