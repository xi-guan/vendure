/**
 * @description
 * ORM-agnostic adapter interface for Address entity operations.
 * This abstraction allows switching between TypeORM and Prisma implementations.
 *
 * @since 3.6.0
 */

import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { Address } from '../../entity/address/address.entity';

export interface AddressFilterInput {
    customerId?: string;
    countryId?: string;
    fullName?: string;
    company?: string;
    streetLine1?: string;
    city?: string;
    postalCode?: string;
    defaultShippingAddress?: boolean;
    defaultBillingAddress?: boolean;
}

export interface AddressListOptions {
    skip?: number;
    take?: number;
    filter?: AddressFilterInput;
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreateAddressInput {
    customerId: string;
    countryId: string;
    fullName?: string;
    company?: string;
    streetLine1: string;
    streetLine2?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    phoneNumber?: string;
    defaultShippingAddress?: boolean;
    defaultBillingAddress?: boolean;
    customFields?: Record<string, any>;
}

export interface UpdateAddressInput {
    fullName?: string;
    company?: string;
    streetLine1?: string;
    streetLine2?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    phoneNumber?: string;
    countryId?: string;
    defaultShippingAddress?: boolean;
    defaultBillingAddress?: boolean;
    customFields?: Record<string, any>;
}

/**
 * ORM-agnostic Address adapter interface
 */
export interface IAddressOrmAdapter {
    /**
     * Find a single address by ID
     */
    findOne(id: ID, includeRelations?: boolean): Promise<Address | undefined>;

    /**
     * Find all addresses with pagination and filtering
     */
    findAll(options?: AddressListOptions): Promise<PaginatedList<Address>>;

    /**
     * Find all addresses for a customer
     */
    findByCustomerId(customerId: ID): Promise<Address[]>;

    /**
     * Find addresses by IDs
     */
    findByIds(ids: ID[]): Promise<Address[]>;

    /**
     * Find addresses by country
     */
    findByCountryId(countryId: ID): Promise<Address[]>;

    /**
     * Get default shipping address for a customer
     */
    getDefaultShippingAddress(customerId: ID): Promise<Address | undefined>;

    /**
     * Get default billing address for a customer
     */
    getDefaultBillingAddress(customerId: ID): Promise<Address | undefined>;

    /**
     * Search addresses by search term
     */
    search(
        searchTerm: string,
        options?: { skip?: number; take?: number },
    ): Promise<PaginatedList<Address>>;

    /**
     * Create a new address
     */
    create(data: CreateAddressInput): Promise<Address>;

    /**
     * Update an existing address
     */
    update(id: ID, data: UpdateAddressInput): Promise<Address>;

    /**
     * Delete an address
     */
    delete(id: ID): Promise<void>;

    /**
     * Delete all addresses for a customer
     */
    deleteByCustomerId(customerId: ID): Promise<void>;

    /**
     * Set default shipping address
     */
    setDefaultShippingAddress(customerId: ID, addressId: ID): Promise<Address>;

    /**
     * Set default billing address
     */
    setDefaultBillingAddress(customerId: ID, addressId: ID): Promise<Address>;

    /**
     * Check if address exists
     */
    exists(id: ID): Promise<boolean>;

    /**
     * Validate address belongs to customer
     */
    validateOwnership(addressId: ID, customerId: ID): Promise<boolean>;

    /**
     * Count addresses matching criteria
     */
    count(filter?: AddressFilterInput): Promise<number>;
}
