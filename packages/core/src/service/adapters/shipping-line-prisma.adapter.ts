/**
 * @description
 * Prisma implementation of the ShippingLine ORM adapter.
 * Converts Prisma results to TypeORM ShippingLine entities for backward compatibility.
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { ShippingLine } from '../../entity/shipping-line/shipping-line.entity';
import { ShippingLinePrismaRepository } from '../repositories/prisma/shipping-line-prisma.repository';

import {
    CreateShippingLineInput,
    IShippingLineOrmAdapter,
    ShippingLineListOptions,
    UpdateShippingLineInput,
} from './shipping-line-orm.adapter';

@Injectable()
export class ShippingLinePrismaAdapter implements IShippingLineOrmAdapter {
    constructor(private readonly repository: ShippingLinePrismaRepository) {}

    async findOne(id: ID, includeRelations: boolean = true): Promise<ShippingLine | undefined> {
        const prismaShippingLine = await this.repository.findOne(id, includeRelations);

        if (!prismaShippingLine) {
            return undefined;
        }

        return this.mapToEntity(prismaShippingLine);
    }

    async findAll(options: ShippingLineListOptions = {}): Promise<PaginatedList<ShippingLine>> {
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

    async findByOrder(orderId: ID): Promise<ShippingLine[]> {
        const prismaShippingLines = await this.repository.findByOrder(orderId);
        return prismaShippingLines.map(line => this.mapToEntity(line));
    }

    async findByShippingMethod(shippingMethodId: ID): Promise<ShippingLine[]> {
        const prismaShippingLines = await this.repository.findByShippingMethod(shippingMethodId);
        return prismaShippingLines.map(line => this.mapToEntity(line));
    }

    async create(data: CreateShippingLineInput): Promise<ShippingLine> {
        const prismaShippingLine = await this.repository.create({
            orderId: data.orderId,
            shippingMethodId: data.shippingMethodId,
            listPrice: data.listPrice,
            listPriceIncludesTax: data.listPriceIncludesTax,
            price: data.price,
            priceWithTax: data.priceWithTax,
            discountedPrice: data.discountedPrice,
            discountedPriceWithTax: data.discountedPriceWithTax,
            discounts: data.discounts,
            taxLines: data.taxLines,
            customFields: data.customFields,
        });

        return this.mapToEntity(prismaShippingLine);
    }

    async update(id: ID, data: UpdateShippingLineInput): Promise<ShippingLine> {
        const prismaShippingLine = await this.repository.update(id, {
            shippingMethodId: data.shippingMethodId,
            listPrice: data.listPrice,
            listPriceIncludesTax: data.listPriceIncludesTax,
            price: data.price,
            priceWithTax: data.priceWithTax,
            discountedPrice: data.discountedPrice,
            discountedPriceWithTax: data.discountedPriceWithTax,
            discounts: data.discounts,
            taxLines: data.taxLines,
            customFields: data.customFields,
        });

        return this.mapToEntity(prismaShippingLine);
    }

    async delete(id: ID): Promise<void> {
        await this.repository.delete(id);
    }

    async getOrderLines(shippingLineId: ID): Promise<any[]> {
        return this.repository.getOrderLines(shippingLineId);
    }

    /**
     * Map Prisma ShippingLine to TypeORM ShippingLine entity
     * This ensures backward compatibility with existing code
     */
    private mapToEntity(prismaShippingLine: any): ShippingLine {
        const shippingLine = new ShippingLine({
            id: prismaShippingLine.id,
            createdAt: prismaShippingLine.createdAt,
            updatedAt: prismaShippingLine.updatedAt,
            listPrice: prismaShippingLine.listPrice,
            listPriceIncludesTax: prismaShippingLine.listPriceIncludesTax,
            price: prismaShippingLine.price,
            priceWithTax: prismaShippingLine.priceWithTax,
            discountedPrice: prismaShippingLine.discountedPrice,
            discountedPriceWithTax: prismaShippingLine.discountedPriceWithTax,
            discounts: prismaShippingLine.discounts,
            taxLines: prismaShippingLine.taxLines,
            customFields: prismaShippingLine.customFields,
        });

        // Map order (if loaded)
        if (prismaShippingLine.order) {
            shippingLine.order = prismaShippingLine.order;
        }

        // Map shipping method (if loaded)
        if (prismaShippingLine.shippingMethod) {
            shippingLine.shippingMethod = prismaShippingLine.shippingMethod;
        }

        // Map order lines (if loaded)
        if (prismaShippingLine.orderLines) {
            shippingLine.orderLines = prismaShippingLine.orderLines;
        }

        return shippingLine;
    }
}
