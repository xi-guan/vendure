/**
 * @description
 * Prisma implementation of the Address ORM adapter.
 * Converts Prisma results to TypeORM Address entities for backward compatibility.
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { Address } from '../../entity/address/address.entity';
import { AddressPrismaRepository } from '../repositories/prisma/address-prisma.repository';

import {
    CreateAddressInput,
    IAddressOrmAdapter,
    AddressListOptions,
    UpdateAddressInput,
    AddressFilterInput,
} from './address-orm.adapter';

@Injectable()
export class AddressPrismaAdapter implements IAddressOrmAdapter {
    constructor(private readonly repository: AddressPrismaRepository) {}

    async findOne(id: ID, includeRelations: boolean = true): Promise<Address | undefined> {
        const prismaAddress = await this.repository.findOne(String(id), includeRelations);

        if (!prismaAddress) {
            return undefined;
        }

        return this.mapToEntity(prismaAddress);
    }

    async findAll(options: AddressListOptions = {}): Promise<PaginatedList<Address>> {
        const { skip = 0, take = 10, filter, sort } = options;

        // Build where clause
        const where: Prisma.AddressWhereInput = {};

        if (filter?.customerId) {
            where.customerId = filter.customerId;
        }

        if (filter?.countryId) {
            where.countryId = filter.countryId;
        }

        if (filter?.fullName) {
            where.fullName = {
                contains: filter.fullName,
                mode: 'insensitive',
            };
        }

        if (filter?.company) {
            where.company = {
                contains: filter.company,
                mode: 'insensitive',
            };
        }

        if (filter?.streetLine1) {
            where.streetLine1 = {
                contains: filter.streetLine1,
                mode: 'insensitive',
            };
        }

        if (filter?.city) {
            where.city = {
                contains: filter.city,
                mode: 'insensitive',
            };
        }

        if (filter?.postalCode) {
            where.postalCode = {
                contains: filter.postalCode,
                mode: 'insensitive',
            };
        }

        if (filter?.defaultShippingAddress !== undefined) {
            where.defaultShippingAddress = filter.defaultShippingAddress;
        }

        if (filter?.defaultBillingAddress !== undefined) {
            where.defaultBillingAddress = filter.defaultBillingAddress;
        }

        // Build orderBy
        let orderBy: Prisma.AddressOrderByWithRelationInput = {
            createdAt: 'desc',
        };

        if (sort?.field) {
            orderBy = {
                [sort.field]: sort.order || 'asc',
            };
        }

        const result = await this.repository.findMany({
            skip,
            take,
            where,
            orderBy,
        });

        return {
            items: result.items.map(item => this.mapToEntity(item)),
            totalItems: result.totalItems,
        };
    }

    async findByCustomerId(customerId: ID): Promise<Address[]> {
        const prismaAddresses = await this.repository.findByCustomerId(String(customerId));
        return prismaAddresses.map(address => this.mapToEntity(address));
    }

    async findByIds(ids: ID[]): Promise<Address[]> {
        const prismaAddresses = await this.repository.findByIds(ids.map(String));
        return prismaAddresses.map(address => this.mapToEntity(address));
    }

    async findByCountryId(countryId: ID): Promise<Address[]> {
        const prismaAddresses = await this.repository.findByCountryId(String(countryId));
        return prismaAddresses.map(address => this.mapToEntity(address));
    }

    async getDefaultShippingAddress(customerId: ID): Promise<Address | undefined> {
        const prismaAddress = await this.repository.getDefaultShippingAddress(String(customerId));

        if (!prismaAddress) {
            return undefined;
        }

        return this.mapToEntity(prismaAddress);
    }

    async getDefaultBillingAddress(customerId: ID): Promise<Address | undefined> {
        const prismaAddress = await this.repository.getDefaultBillingAddress(String(customerId));

        if (!prismaAddress) {
            return undefined;
        }

        return this.mapToEntity(prismaAddress);
    }

    async search(
        searchTerm: string,
        options: { skip?: number; take?: number } = {},
    ): Promise<PaginatedList<Address>> {
        const result = await this.repository.search(searchTerm, options);

        return {
            items: result.items.map(item => this.mapToEntity(item)),
            totalItems: result.totalItems,
        };
    }

    async create(data: CreateAddressInput): Promise<Address> {
        const prismaAddress = await this.repository.create({
            customer: {
                connect: { id: data.customerId },
            },
            country: {
                connect: { id: data.countryId },
            },
            fullName: data.fullName || '',
            company: data.company || '',
            streetLine1: data.streetLine1,
            streetLine2: data.streetLine2 || '',
            city: data.city || '',
            province: data.province || '',
            postalCode: data.postalCode || '',
            phoneNumber: data.phoneNumber || '',
            defaultShippingAddress: data.defaultShippingAddress || false,
            defaultBillingAddress: data.defaultBillingAddress || false,
            customFields: data.customFields as Prisma.JsonValue,
        });

        return this.mapToEntity(prismaAddress);
    }

    async update(id: ID, data: UpdateAddressInput): Promise<Address> {
        const updateData: Prisma.AddressUpdateInput = {};

        if (data.fullName !== undefined) {
            updateData.fullName = data.fullName;
        }

        if (data.company !== undefined) {
            updateData.company = data.company;
        }

        if (data.streetLine1 !== undefined) {
            updateData.streetLine1 = data.streetLine1;
        }

        if (data.streetLine2 !== undefined) {
            updateData.streetLine2 = data.streetLine2;
        }

        if (data.city !== undefined) {
            updateData.city = data.city;
        }

        if (data.province !== undefined) {
            updateData.province = data.province;
        }

        if (data.postalCode !== undefined) {
            updateData.postalCode = data.postalCode;
        }

        if (data.phoneNumber !== undefined) {
            updateData.phoneNumber = data.phoneNumber;
        }

        if (data.countryId !== undefined) {
            updateData.country = {
                connect: { id: data.countryId },
            };
        }

        if (data.defaultShippingAddress !== undefined) {
            updateData.defaultShippingAddress = data.defaultShippingAddress;
        }

        if (data.defaultBillingAddress !== undefined) {
            updateData.defaultBillingAddress = data.defaultBillingAddress;
        }

        if (data.customFields !== undefined) {
            updateData.customFields = data.customFields as Prisma.JsonValue;
        }

        const prismaAddress = await this.repository.update(String(id), updateData);

        return this.mapToEntity(prismaAddress);
    }

    async delete(id: ID): Promise<void> {
        await this.repository.delete(String(id));
    }

    async deleteByCustomerId(customerId: ID): Promise<void> {
        await this.repository.deleteByCustomerId(String(customerId));
    }

    async setDefaultShippingAddress(customerId: ID, addressId: ID): Promise<Address> {
        const prismaAddress = await this.repository.setDefaultShippingAddress(
            String(customerId),
            String(addressId),
        );

        return this.mapToEntity(prismaAddress);
    }

    async setDefaultBillingAddress(customerId: ID, addressId: ID): Promise<Address> {
        const prismaAddress = await this.repository.setDefaultBillingAddress(
            String(customerId),
            String(addressId),
        );

        return this.mapToEntity(prismaAddress);
    }

    async exists(id: ID): Promise<boolean> {
        return this.repository.exists(String(id));
    }

    async validateOwnership(addressId: ID, customerId: ID): Promise<boolean> {
        return this.repository.validateOwnership(String(addressId), String(customerId));
    }

    async count(filter?: AddressFilterInput): Promise<number> {
        const where: Prisma.AddressWhereInput = {};

        if (filter?.customerId) {
            where.customerId = filter.customerId;
        }

        if (filter?.countryId) {
            where.countryId = filter.countryId;
        }

        return this.repository.count(where);
    }

    /**
     * Map Prisma Address to TypeORM Address entity
     * This ensures backward compatibility with existing code
     */
    private mapToEntity(prismaAddress: any): Address {
        const address = new Address({
            id: prismaAddress.id,
            createdAt: prismaAddress.createdAt,
            updatedAt: prismaAddress.updatedAt,
            fullName: prismaAddress.fullName,
            company: prismaAddress.company,
            streetLine1: prismaAddress.streetLine1,
            streetLine2: prismaAddress.streetLine2,
            city: prismaAddress.city,
            province: prismaAddress.province,
            postalCode: prismaAddress.postalCode,
            phoneNumber: prismaAddress.phoneNumber,
            defaultShippingAddress: prismaAddress.defaultShippingAddress,
            defaultBillingAddress: prismaAddress.defaultBillingAddress,
            customFields: prismaAddress.customFields,
        });

        // Map customer (if loaded)
        if (prismaAddress.customer) {
            address.customer = prismaAddress.customer;
        }

        // Map country (if loaded)
        if (prismaAddress.country) {
            address.country = prismaAddress.country;
        }

        return address;
    }
}
