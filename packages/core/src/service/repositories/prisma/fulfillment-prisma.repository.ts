/**
 * @description
 * Prisma-based repository for Fulfillment entity operations.
 * Handles CRUD operations for Fulfillments with their relations (orders).
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { PrismaService } from '../../../connection/prisma.service';

export interface FulfillmentListOptions {
    skip?: number;
    take?: number;
    filter?: {
        state?: string;
        method?: string;
        trackingCode?: string;
    };
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreateFulfillmentData {
    state: string;
    method: string;
    trackingCode?: string | null;
    customFields?: Record<string, any>;
}

export interface UpdateFulfillmentData {
    state?: string;
    method?: string;
    trackingCode?: string | null;
    customFields?: Record<string, any>;
}

/**
 * Default include for loading Fulfillment relations
 */
const DEFAULT_FULFILLMENT_INCLUDE = {
    orders: {
        include: {
            order: true,
        },
    },
} satisfies Prisma.FulfillmentInclude;

@Injectable()
export class FulfillmentPrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Find a single fulfillment by ID
     */
    async findOne(id: ID, includeRelations: boolean = true): Promise<any | undefined> {
        const include = includeRelations ? DEFAULT_FULFILLMENT_INCLUDE : undefined;

        const fulfillment = await this.prisma.fulfillment.findUnique({
            where: { id: String(id) },
            include,
        });

        return fulfillment || undefined;
    }

    /**
     * Find all fulfillments with pagination and filtering
     */
    async findAll(options: FulfillmentListOptions = {}): Promise<PaginatedList<any>> {
        const { skip = 0, take = 10, filter, sort } = options;

        // Build where clause
        const where: Prisma.FulfillmentWhereInput = {};

        if (filter?.state) {
            where.state = filter.state;
        }

        if (filter?.method) {
            where.method = {
                contains: filter.method,
                mode: 'insensitive',
            };
        }

        if (filter?.trackingCode) {
            where.trackingCode = {
                contains: filter.trackingCode,
                mode: 'insensitive',
            };
        }

        // Build orderBy
        let orderBy: Prisma.FulfillmentOrderByWithRelationInput = {
            createdAt: 'desc',
        };

        if (sort?.field) {
            orderBy = {
                [sort.field]: sort.order || 'asc',
            };
        }

        // Execute query
        const [items, totalItems] = await Promise.all([
            this.prisma.fulfillment.findMany({
                where,
                include: DEFAULT_FULFILLMENT_INCLUDE,
                skip,
                take,
                orderBy,
            }),
            this.prisma.fulfillment.count({ where }),
        ]);

        return {
            items,
            totalItems,
        };
    }

    /**
     * Find fulfillments by state
     */
    async findByState(state: string): Promise<any[]> {
        const fulfillments = await this.prisma.fulfillment.findMany({
            where: {
                state,
            },
            include: DEFAULT_FULFILLMENT_INCLUDE,
        });

        return fulfillments;
    }

    /**
     * Find fulfillments by tracking code
     */
    async findByTrackingCode(trackingCode: string): Promise<any[]> {
        const fulfillments = await this.prisma.fulfillment.findMany({
            where: {
                trackingCode: {
                    contains: trackingCode,
                    mode: 'insensitive',
                },
            },
            include: DEFAULT_FULFILLMENT_INCLUDE,
        });

        return fulfillments;
    }

    /**
     * Create a new fulfillment
     */
    async create(data: CreateFulfillmentData): Promise<any> {
        const fulfillment = await this.prisma.fulfillment.create({
            data: {
                state: data.state,
                method: data.method,
                trackingCode: data.trackingCode,
                customFields: data.customFields as Prisma.JsonValue,
            },
            include: DEFAULT_FULFILLMENT_INCLUDE,
        });

        return fulfillment;
    }

    /**
     * Update an existing fulfillment
     */
    async update(id: ID, data: UpdateFulfillmentData): Promise<any> {
        const updateData: Prisma.FulfillmentUpdateInput = {};

        if (data.state !== undefined) {
            updateData.state = data.state;
        }

        if (data.method !== undefined) {
            updateData.method = data.method;
        }

        if (data.trackingCode !== undefined) {
            updateData.trackingCode = data.trackingCode;
        }

        if (data.customFields !== undefined) {
            updateData.customFields = data.customFields as Prisma.JsonValue;
        }

        const fulfillment = await this.prisma.fulfillment.update({
            where: { id: String(id) },
            data: updateData,
            include: DEFAULT_FULFILLMENT_INCLUDE,
        });

        return fulfillment;
    }

    /**
     * Delete a fulfillment
     */
    async delete(id: ID): Promise<void> {
        await this.prisma.fulfillment.delete({
            where: { id: String(id) },
        });
    }

    /**
     * Add an order to a fulfillment
     */
    async addOrder(fulfillmentId: ID, orderId: ID): Promise<void> {
        await this.prisma.orderFulfillment.create({
            data: {
                fulfillmentId: String(fulfillmentId),
                orderId: String(orderId),
            },
        });
    }

    /**
     * Remove an order from a fulfillment
     */
    async removeOrder(fulfillmentId: ID, orderId: ID): Promise<void> {
        await this.prisma.orderFulfillment.delete({
            where: {
                orderId_fulfillmentId: {
                    orderId: String(orderId),
                    fulfillmentId: String(fulfillmentId),
                },
            },
        });
    }

    /**
     * Get all orders for a fulfillment
     */
    async getOrders(fulfillmentId: ID): Promise<any[]> {
        const orderFulfillments = await this.prisma.orderFulfillment.findMany({
            where: {
                fulfillmentId: String(fulfillmentId),
            },
            include: {
                order: true,
            },
        });

        return orderFulfillments.map(of => of.order);
    }
}
