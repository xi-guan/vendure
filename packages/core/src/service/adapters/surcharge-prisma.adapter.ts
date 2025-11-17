/**
 * @description
 * Prisma implementation of the Surcharge ORM adapter.
 * Converts Prisma results to TypeORM Surcharge entities for backward compatibility.
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { Surcharge } from '../../entity/surcharge/surcharge.entity';
import { SurchargePrismaRepository } from '../repositories/prisma/surcharge-prisma.repository';

import {
    CreateSurchargeInput,
    ISurchargeOrmAdapter,
    SurchargeListOptions,
    UpdateSurchargeInput,
} from './surcharge-orm.adapter';

@Injectable()
export class SurchargePrismaAdapter implements ISurchargeOrmAdapter {
    constructor(private readonly repository: SurchargePrismaRepository) {}

    async findOne(id: ID, includeRelations: boolean = true): Promise<Surcharge | undefined> {
        const prismaSurcharge = await this.repository.findOne(id, includeRelations);

        if (!prismaSurcharge) {
            return undefined;
        }

        return this.mapToEntity(prismaSurcharge);
    }

    async findAll(options: SurchargeListOptions = {}): Promise<PaginatedList<Surcharge>> {
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

    async findByOrder(orderId: ID): Promise<Surcharge[]> {
        const prismaSurcharges = await this.repository.findByOrder(orderId);
        return prismaSurcharges.map(surcharge => this.mapToEntity(surcharge));
    }

    async create(data: CreateSurchargeInput): Promise<Surcharge> {
        const prismaSurcharge = await this.repository.create({
            orderId: data.orderId,
            description: data.description,
            sku: data.sku,
            listPrice: data.listPrice,
            listPriceIncludesTax: data.listPriceIncludesTax,
            price: data.price,
            priceWithTax: data.priceWithTax,
            taxRate: data.taxRate,
            taxLines: data.taxLines,
        });

        return this.mapToEntity(prismaSurcharge);
    }

    async update(id: ID, data: UpdateSurchargeInput): Promise<Surcharge> {
        const prismaSurcharge = await this.repository.update(id, {
            description: data.description,
            sku: data.sku,
            listPrice: data.listPrice,
            listPriceIncludesTax: data.listPriceIncludesTax,
            price: data.price,
            priceWithTax: data.priceWithTax,
            taxRate: data.taxRate,
            taxLines: data.taxLines,
        });

        return this.mapToEntity(prismaSurcharge);
    }

    async delete(id: ID): Promise<void> {
        await this.repository.delete(id);
    }

    /**
     * Map Prisma Surcharge to TypeORM Surcharge entity
     * This ensures backward compatibility with existing code
     */
    private mapToEntity(prismaSurcharge: any): Surcharge {
        const surcharge = new Surcharge({
            id: prismaSurcharge.id,
            createdAt: prismaSurcharge.createdAt,
            updatedAt: prismaSurcharge.updatedAt,
            description: prismaSurcharge.description,
            sku: prismaSurcharge.sku,
            listPrice: prismaSurcharge.listPrice,
            listPriceIncludesTax: prismaSurcharge.listPriceIncludesTax,
            price: prismaSurcharge.price,
            priceWithTax: prismaSurcharge.priceWithTax,
            taxRate: prismaSurcharge.taxRate,
            taxLines: prismaSurcharge.taxLines,
        });

        // Map order (if loaded)
        if (prismaSurcharge.order) {
            surcharge.order = prismaSurcharge.order;
        }

        return surcharge;
    }
}
