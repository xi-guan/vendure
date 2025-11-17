import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import { CustomerGroup } from '../../entity/customer-group/customer-group.entity';

export interface CreateCustomerGroupData {
    name: string;
    customFields?: any;
}

export interface UpdateCustomerGroupData {
    name?: string;
    customFields?: any;
}

export interface CustomerGroupListOptions {
    skip?: number;
    take?: number;
    filter?: any;
    sort?: any;
}

export interface ICustomerGroupOrmAdapter {
    findOne(id: ID, includeRelations?: string[]): Promise<CustomerGroup | undefined>;
    findByName(name: string): Promise<CustomerGroup | undefined>;
    findAll(options: CustomerGroupListOptions): Promise<PaginatedList<CustomerGroup>>;
    create(data: CreateCustomerGroupData): Promise<CustomerGroup>;
    update(id: ID, data: UpdateCustomerGroupData): Promise<CustomerGroup>;
    delete(id: ID): Promise<void>;
    exists(id: ID): Promise<boolean>;
    count(filter?: any): Promise<number>;
}

export function getCustomerGroupOrmAdapter(
    usePrisma: boolean,
    typeormAdapter: ICustomerGroupOrmAdapter,
    prismaAdapter: ICustomerGroupOrmAdapter,
): ICustomerGroupOrmAdapter {
    return usePrisma ? prismaAdapter : typeormAdapter;
}
