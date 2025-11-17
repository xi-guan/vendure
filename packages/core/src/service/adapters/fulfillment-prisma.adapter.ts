/**
 * @description
 * Prisma implementation of the Fulfillment ORM adapter.
 * Converts Prisma results to TypeORM Fulfillment entities for backward compatibility.
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { Fulfillment } from '../../entity/fulfillment/fulfillment.entity';
import { FulfillmentPrismaRepository } from '../repositories/prisma/fulfillment-prisma.repository';

import {
    CreateFulfillmentInput,
    IFulfillmentOrmAdapter,
    FulfillmentListOptions,
    UpdateFulfillmentInput,
} from './fulfillment-orm.adapter';

@Injectable()
export class FulfillmentPrismaAdapter implements IFulfillmentOrmAdapter {
    constructor(private readonly repository: FulfillmentPrismaRepository) {}

    async findOne(id: ID, includeRelations: boolean = true): Promise<Fulfillment | undefined> {
        const prismaFulfillment = await this.repository.findOne(id, includeRelations);

        if (!prismaFulfillment) {
            return undefined;
        }

        return this.mapToEntity(prismaFulfillment);
    }

    async findAll(options: FulfillmentListOptions = {}): Promise<PaginatedList<Fulfillment>> {
        const result = await this.repository.findAll({
            skip: options.skip,
            take: options.take,
            filter: options.filter,
            sort: options.sort,
        });

        return {
            items: result.items.map(item => this.mapToEntity(item)),
            totalItems: result.totalItems,
        };
    }

    async findByState(state: string): Promise<Fulfillment[]> {
        const prismaFulfillments = await this.repository.findByState(state);
        return prismaFulfillments.map(fulfillment => this.mapToEntity(fulfillment));
    }

    async findByTrackingCode(trackingCode: string): Promise<Fulfillment[]> {
        const prismaFulfillments = await this.repository.findByTrackingCode(trackingCode);
        return prismaFulfillments.map(fulfillment => this.mapToEntity(fulfillment));
    }

    async create(data: CreateFulfillmentInput): Promise<Fulfillment> {
        const prismaFulfillment = await this.repository.create({
            state: data.state,
            method: data.method,
            trackingCode: data.trackingCode,
            customFields: data.customFields,
        });

        return this.mapToEntity(prismaFulfillment);
    }

    async update(id: ID, data: UpdateFulfillmentInput): Promise<Fulfillment> {
        const prismaFulfillment = await this.repository.update(id, {
            state: data.state,
            method: data.method,
            trackingCode: data.trackingCode,
            customFields: data.customFields,
        });

        return this.mapToEntity(prismaFulfillment);
    }

    async delete(id: ID): Promise<void> {
        await this.repository.delete(id);
    }

    async addOrder(fulfillmentId: ID, orderId: ID): Promise<void> {
        await this.repository.addOrder(fulfillmentId, orderId);
    }

    async removeOrder(fulfillmentId: ID, orderId: ID): Promise<void> {
        await this.repository.removeOrder(fulfillmentId, orderId);
    }

    async getOrders(fulfillmentId: ID): Promise<any[]> {
        return this.repository.getOrders(fulfillmentId);
    }

    /**
     * Map Prisma Fulfillment to TypeORM Fulfillment entity
     * This ensures backward compatibility with existing code
     */
    private mapToEntity(prismaFulfillment: any): Fulfillment {
        const fulfillment = new Fulfillment({
            id: prismaFulfillment.id,
            createdAt: prismaFulfillment.createdAt,
            updatedAt: prismaFulfillment.updatedAt,
            state: prismaFulfillment.state,
            method: prismaFulfillment.method,
            trackingCode: prismaFulfillment.trackingCode,
            customFields: prismaFulfillment.customFields,
        });

        // Map orders (if loaded)
        if (prismaFulfillment.orders) {
            // Extract just the order from the join table
            fulfillment.orders = prismaFulfillment.orders.map((of: any) => of.order);
        }

        return fulfillment;
    }
}
