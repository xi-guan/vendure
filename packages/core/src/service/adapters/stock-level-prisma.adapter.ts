/**
 * @description
 * Prisma implementation of the StockLevel ORM adapter.
 * Converts Prisma results to TypeORM StockLevel entities for backward compatibility.
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { StockLevel } from '../../entity/stock-level/stock-level.entity';
import { StockLevelPrismaRepository } from '../repositories/prisma/stock-level-prisma.repository';

import {
    CreateStockLevelInput,
    IStockLevelOrmAdapter,
    StockLevelListOptions,
    UpdateStockLevelInput,
} from './stock-level-orm.adapter';

@Injectable()
export class StockLevelPrismaAdapter implements IStockLevelOrmAdapter {
    constructor(private readonly repository: StockLevelPrismaRepository) {}

    async findOne(id: ID, includeRelations: boolean = true): Promise<StockLevel | undefined> {
        const prismaStockLevel = await this.repository.findOne(id, includeRelations);

        if (!prismaStockLevel) {
            return undefined;
        }

        return this.mapToEntity(prismaStockLevel);
    }

    async findByVariantAndLocation(
        productVariantId: ID,
        stockLocationId: ID,
    ): Promise<StockLevel | undefined> {
        const prismaStockLevel = await this.repository.findByVariantAndLocation(
            productVariantId,
            stockLocationId,
        );

        if (!prismaStockLevel) {
            return undefined;
        }

        return this.mapToEntity(prismaStockLevel);
    }

    async findAll(options: StockLevelListOptions = {}): Promise<PaginatedList<StockLevel>> {
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

    async findByVariant(productVariantId: ID): Promise<StockLevel[]> {
        const prismaStockLevels = await this.repository.findByVariant(productVariantId);
        return prismaStockLevels.map(level => this.mapToEntity(level));
    }

    async findByLocation(stockLocationId: ID): Promise<StockLevel[]> {
        const prismaStockLevels = await this.repository.findByLocation(stockLocationId);
        return prismaStockLevels.map(level => this.mapToEntity(level));
    }

    async create(data: CreateStockLevelInput): Promise<StockLevel> {
        const prismaStockLevel = await this.repository.create({
            productVariantId: data.productVariantId,
            stockLocationId: data.stockLocationId,
            stockOnHand: data.stockOnHand,
            stockAllocated: data.stockAllocated,
        });

        return this.mapToEntity(prismaStockLevel);
    }

    async update(id: ID, data: UpdateStockLevelInput): Promise<StockLevel> {
        const prismaStockLevel = await this.repository.update(id, {
            stockOnHand: data.stockOnHand,
            stockAllocated: data.stockAllocated,
        });

        return this.mapToEntity(prismaStockLevel);
    }

    async delete(id: ID): Promise<void> {
        await this.repository.delete(id);
    }

    async adjustStockOnHand(id: ID, delta: number): Promise<StockLevel> {
        const prismaStockLevel = await this.repository.adjustStockOnHand(id, delta);
        return this.mapToEntity(prismaStockLevel);
    }

    async adjustStockAllocated(id: ID, delta: number): Promise<StockLevel> {
        const prismaStockLevel = await this.repository.adjustStockAllocated(id, delta);
        return this.mapToEntity(prismaStockLevel);
    }

    async getAvailableStock(id: ID): Promise<number> {
        return this.repository.getAvailableStock(id);
    }

    /**
     * Map Prisma StockLevel to TypeORM StockLevel entity
     * This ensures backward compatibility with existing code
     */
    private mapToEntity(prismaStockLevel: any): StockLevel {
        const stockLevel = new StockLevel({
            id: prismaStockLevel.id,
            createdAt: prismaStockLevel.createdAt,
            updatedAt: prismaStockLevel.updatedAt,
            stockOnHand: prismaStockLevel.stockOnHand,
            stockAllocated: prismaStockLevel.stockAllocated,
        });

        // Map product variant (if loaded)
        if (prismaStockLevel.productVariant) {
            stockLevel.productVariant = prismaStockLevel.productVariant;
        }

        // Map stock location (if loaded)
        if (prismaStockLevel.stockLocation) {
            stockLevel.stockLocation = prismaStockLevel.stockLocation;
        }

        return stockLevel;
    }
}
