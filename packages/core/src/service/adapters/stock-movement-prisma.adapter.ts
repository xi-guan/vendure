/**
 * @description
 * Prisma implementation of StockMovement ORM adapter.
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { StockMovement } from '../../entity/stock-movement/stock-movement.entity';
import { StockMovementPrismaRepository } from '../repositories/prisma/stock-movement-prisma.repository';

import {
    CreateStockMovementData,
    IStockMovementOrmAdapter,
    StockMovementListOptions,
} from './stock-movement-orm.adapter';

@Injectable()
export class StockMovementPrismaAdapter implements IStockMovementOrmAdapter {
    constructor(private readonly repository: StockMovementPrismaRepository) {}

    async findOne(id: ID): Promise<StockMovement | undefined> {
        const result = await this.repository.findOne(id);
        return result as StockMovement | undefined;
    }

    async findByProductVariant(
        productVariantId: ID,
        options?: StockMovementListOptions,
    ): Promise<PaginatedList<StockMovement>> {
        const result = await this.repository.findByProductVariant(productVariantId, options);
        return result as PaginatedList<StockMovement>;
    }

    async findByStockLocation(
        stockLocationId: ID,
        options?: StockMovementListOptions,
    ): Promise<PaginatedList<StockMovement>> {
        const result = await this.repository.findByStockLocation(stockLocationId, options);
        return result as PaginatedList<StockMovement>;
    }

    async findAll(options: StockMovementListOptions): Promise<PaginatedList<StockMovement>> {
        const result = await this.repository.findAll(options);
        return result as PaginatedList<StockMovement>;
    }

    async create(data: CreateStockMovementData): Promise<StockMovement> {
        const movementData = {
            ...data,
            productVariantId: String(data.productVariantId),
            stockLocationId: String(data.stockLocationId),
        };
        const result = await this.repository.create(movementData);
        return result as StockMovement;
    }

    async getStockLevelForVariant(productVariantId: ID, stockLocationId?: ID): Promise<number> {
        return this.repository.getStockLevelForVariant(productVariantId, stockLocationId);
    }

    async getAverageStockMovementRate(productVariantId: ID, days: number): Promise<number> {
        return this.repository.getAverageStockMovementRate(productVariantId, days);
    }
}
