import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { PrismaService } from '../../connection/prisma.service';
import { CustomerGroup } from '../../entity/customer-group/customer-group.entity';
import {
    CreateCustomerGroupData,
    ICustomerGroupOrmAdapter,
    UpdateCustomerGroupData,
    CustomerGroupListOptions,
} from './customer-group-orm.adapter';

@Injectable()
export class CustomerGroupPrismaAdapter implements ICustomerGroupOrmAdapter {
    constructor(private prisma: PrismaService) {}

    async findOne(id: ID, includeRelations: string[] = []): Promise<CustomerGroup | undefined> {
        const group = await this.prisma.customerGroup.findUnique({ where: { id: String(id) } });
        return group ? this.mapToEntity(group) : undefined;
    }

    async findByName(name: string): Promise<CustomerGroup | undefined> {
        const group = await this.prisma.customerGroup.findUnique({ where: { name } });
        return group ? this.mapToEntity(group) : undefined;
    }

    async findAll(options: CustomerGroupListOptions): Promise<PaginatedList<CustomerGroup>> {
        const { skip = 0, take = 20, filter = {} } = options;
        const [items, totalItems] = await Promise.all([
            this.prisma.customerGroup.findMany({ skip, take, where: filter }),
            this.prisma.customerGroup.count({ where: filter }),
        ]);
        return { items: items.map(item => this.mapToEntity(item)), totalItems };
    }

    async create(data: CreateCustomerGroupData): Promise<CustomerGroup> {
        const group = await this.prisma.customerGroup.create({ data: data as any });
        return this.mapToEntity(group);
    }

    async update(id: ID, data: UpdateCustomerGroupData): Promise<CustomerGroup> {
        const group = await this.prisma.customerGroup.update({
            where: { id: String(id) },
            data: data as any,
        });
        return this.mapToEntity(group);
    }

    async delete(id: ID): Promise<void> {
        await this.prisma.customerGroup.delete({ where: { id: String(id) } });
    }

    async exists(id: ID): Promise<boolean> {
        return (await this.prisma.customerGroup.count({ where: { id: String(id) } })) > 0;
    }

    async count(filter: any = {}): Promise<number> {
        return this.prisma.customerGroup.count({ where: filter });
    }

    private mapToEntity(prismaGroup: any): CustomerGroup {
        return new CustomerGroup({
            id: prismaGroup.id,
            createdAt: prismaGroup.createdAt,
            updatedAt: prismaGroup.updatedAt,
            name: prismaGroup.name,
            customFields: prismaGroup.customFields,
        });
    }
}
