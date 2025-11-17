/**
 * Code Generator for Prisma Repositories and Adapters
 *
 * This script generates boilerplate code for Prisma repositories and ORM adapters
 * based on entity definitions. It creates:
 * 1. Prisma Repository (prisma/*.repository.ts)
 * 2. ORM Adapter Interface (*-orm.adapter.ts)
 * 3. Prisma Adapter Implementation (*-prisma.adapter.ts)
 *
 * Usage:
 *   ts-node scripts/generate-prisma-adapters.ts
 */

interface EntityField {
    name: string;
    type: string;
    isOptional?: boolean;
    isArray?: boolean;
    isRelation?: boolean;
}

interface EntityDefinition {
    name: string;
    tableName: string;
    fields: EntityField[];
    hasCustomFields?: boolean;
    hasSoftDelete?: boolean;
    hasTranslations?: boolean;
    relations?: string[];
}

// Entities that need repositories and adapters
const ENTITIES_TO_GENERATE: EntityDefinition[] = [
    {
        name: 'ProductVariant',
        tableName: 'product_variant',
        hasCustomFields: true,
        hasSoftDelete: true,
        fields: [
            { name: 'sku', type: 'string' },
            { name: 'name', type: 'string' },
            { name: 'enabled', type: 'boolean' },
            { name: 'productId', type: 'ID', isRelation: true },
            { name: 'price', type: 'number' },
            { name: 'taxCategoryId', type: 'ID', isRelation: true, isOptional: true },
            { name: 'stockOnHand', type: 'number' },
            { name: 'trackInventory', type: 'boolean' },
        ],
        relations: ['product', 'taxCategory', 'options', 'assets', 'facetValues'],
    },
    {
        name: 'OrderLine',
        tableName: 'order_line',
        hasCustomFields: true,
        fields: [
            { name: 'orderId', type: 'ID', isRelation: true },
            { name: 'productVariantId', type: 'ID', isRelation: true },
            { name: 'quantity', type: 'number' },
            { name: 'linePrice', type: 'number' },
            { name: 'unitPrice', type: 'number' },
            { name: 'taxRate', type: 'number' },
        ],
        relations: ['order', 'productVariant'],
    },
    {
        name: 'Payment',
        tableName: 'payment',
        hasCustomFields: true,
        fields: [
            { name: 'orderId', type: 'ID', isRelation: true },
            { name: 'amount', type: 'number' },
            { name: 'method', type: 'string' },
            { name: 'state', type: 'string' },
            { name: 'transactionId', type: 'string', isOptional: true },
            { name: 'metadata', type: 'any', isOptional: true },
        ],
        relations: ['order', 'refunds'],
    },
    {
        name: 'Refund',
        tableName: 'refund',
        hasCustomFields: false,
        fields: [
            { name: 'paymentId', type: 'ID', isRelation: true },
            { name: 'amount', type: 'number' },
            { name: 'reason', type: 'string' },
            { name: 'state', type: 'string' },
            { name: 'transactionId', type: 'string', isOptional: true },
            { name: 'metadata', type: 'any', isOptional: true },
        ],
        relations: ['payment'],
    },
    {
        name: 'User',
        tableName: 'user',
        hasCustomFields: false,
        hasSoftDelete: true,
        fields: [
            { name: 'identifier', type: 'string' },
            { name: 'verified', type: 'boolean' },
            { name: 'lastLogin', type: 'Date', isOptional: true },
        ],
        relations: ['roles', 'authenticationMethods'],
    },
    {
        name: 'Role',
        tableName: 'role',
        hasCustomFields: false,
        fields: [
            { name: 'code', type: 'string' },
            { name: 'description', type: 'string' },
            { name: 'permissions', type: 'string', isArray: true },
        ],
        relations: ['channels', 'users'],
    },
    {
        name: 'Administrator',
        tableName: 'administrator',
        hasCustomFields: true,
        hasSoftDelete: true,
        fields: [
            { name: 'firstName', type: 'string' },
            { name: 'lastName', type: 'string' },
            { name: 'emailAddress', type: 'string' },
            { name: 'userId', type: 'ID', isRelation: true },
        ],
        relations: ['user'],
    },
    {
        name: 'Channel',
        tableName: 'channel',
        hasCustomFields: true,
        fields: [
            { name: 'code', type: 'string' },
            { name: 'token', type: 'string' },
            { name: 'defaultLanguageCode', type: 'string' },
            { name: 'availableLanguageCodes', type: 'string', isArray: true },
            { name: 'pricesIncludeTax', type: 'boolean' },
            { name: 'defaultCurrencyCode', type: 'string' },
            { name: 'availableCurrencyCodes', type: 'string', isArray: true },
        ],
        relations: ['sellers', 'defaultTaxZone', 'defaultShippingZone'],
    },
    {
        name: 'Zone',
        tableName: 'zone',
        hasCustomFields: true,
        fields: [
            { name: 'name', type: 'string' },
        ],
        relations: ['members'],
    },
    {
        name: 'Country',
        tableName: 'country',
        hasCustomFields: true,
        hasTranslations: true,
        fields: [
            { name: 'code', type: 'string' },
            { name: 'enabled', type: 'boolean' },
        ],
        relations: ['translations'],
    },
    {
        name: 'Region',
        tableName: 'region',
        hasCustomFields: false,
        hasTranslations: true,
        fields: [
            { name: 'code', type: 'string' },
            { name: 'type', type: 'string' },
            { name: 'enabled', type: 'boolean' },
            { name: 'parentId', type: 'ID', isRelation: true, isOptional: true },
        ],
        relations: ['parent', 'translations'],
    },
    {
        name: 'Asset',
        tableName: 'asset',
        hasCustomFields: true,
        fields: [
            { name: 'name', type: 'string' },
            { name: 'type', type: 'string' },
            { name: 'mimeType', type: 'string' },
            { name: 'width', type: 'number' },
            { name: 'height', type: 'number' },
            { name: 'fileSize', type: 'number' },
            { name: 'source', type: 'string' },
            { name: 'preview', type: 'string' },
            { name: 'focalPointX', type: 'number', isOptional: true },
            { name: 'focalPointY', type: 'number', isOptional: true },
        ],
        relations: ['tags'],
    },
    {
        name: 'AssetTag',
        tableName: 'asset_tag',
        fields: [
            { name: 'value', type: 'string' },
        ],
        relations: ['assets'],
    },
    {
        name: 'Fulfillment',
        tableName: 'fulfillment',
        hasCustomFields: true,
        fields: [
            { name: 'state', type: 'string' },
            { name: 'method', type: 'string' },
            { name: 'trackingCode', type: 'string', isOptional: true },
        ],
        relations: ['orderLines'],
    },
    {
        name: 'ShippingMethod',
        tableName: 'shipping_method',
        hasCustomFields: true,
        hasSoftDelete: true,
        hasTranslations: true,
        fields: [
            { name: 'code', type: 'string' },
            { name: 'fulfillmentHandlerCode', type: 'string' },
            { name: 'checker', type: 'any' },
            { name: 'calculator', type: 'any' },
        ],
        relations: ['translations', 'channels'],
    },
    {
        name: 'Promotion',
        tableName: 'promotion',
        hasCustomFields: true,
        hasSoftDelete: true,
        hasTranslations: true,
        fields: [
            { name: 'name', type: 'string' },
            { name: 'enabled', type: 'boolean' },
            { name: 'startsAt', type: 'Date', isOptional: true },
            { name: 'endsAt', type: 'Date', isOptional: true },
            { name: 'couponCode', type: 'string', isOptional: true },
            { name: 'perCustomerUsageLimit', type: 'number', isOptional: true },
            { name: 'usageLimit', type: 'number', isOptional: true },
            { name: 'conditions', type: 'any' },
            { name: 'actions', type: 'any' },
            { name: 'priorityScore', type: 'number' },
        ],
        relations: ['translations', 'channels'],
    },
];

function generateRepository(entity: EntityDefinition): string {
    const createDataFields = entity.fields
        .map(f => {
            const optional = f.isOptional ? '?' : '';
            return `    ${f.name}${optional}: ${f.type}${f.isArray ? '[]' : ''};`;
        })
        .join('\n');

    const updateDataFields = entity.fields
        .map(f => `    ${f.name}?: ${f.type}${f.isArray ? '[]' : ''};`)
        .join('\n');

    return `/**
 * @description
 * Prisma-based repository for ${entity.name} entity operations.
 * Auto-generated - customize as needed.
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { PrismaService } from '../../../connection/prisma.service';

export interface Create${entity.name}Data {
${createDataFields}${entity.hasCustomFields ? '\n    customFields?: Record<string, any>;' : ''}
}

export interface Update${entity.name}Data {
${updateDataFields}${entity.hasCustomFields ? '\n    customFields?: Record<string, any>;' : ''}
}

export interface ${entity.name}ListOptions {
    skip?: number;
    take?: number;
    filter?: any;
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

@Injectable()
export class ${entity.name}PrismaRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findOne(id: ID): Promise<any | undefined> {
        const result = await this.prisma.${entity.tableName.replace(/-/g, '_')}.findUnique({
            where: { id: String(id) },
        });
        return result || undefined;
    }

    async findAll(options: ${entity.name}ListOptions): Promise<PaginatedList<any>> {
        const skip = options.skip || 0;
        const take = options.take || 10;

        const [items, total] = await Promise.all([
            this.prisma.${entity.tableName.replace(/-/g, '_')}.findMany({
                skip,
                take,${entity.hasSoftDelete ? '\n                where: { deletedAt: null },' : ''}
            }),
            this.prisma.${entity.tableName.replace(/-/g, '_')}.count(${entity.hasSoftDelete ? '{ where: { deletedAt: null } }' : ''}),
        ]);

        return {
            items,
            totalItems: total,
        };
    }

    async create(data: Create${entity.name}Data): Promise<any> {
        const result = await this.prisma.${entity.tableName.replace(/-/g, '_')}.create({
            data: data as any,
        });
        return result;
    }

    async update(id: ID, data: Update${entity.name}Data): Promise<any> {
        const result = await this.prisma.${entity.tableName.replace(/-/g, '_')}.update({
            where: { id: String(id) },
            data: data as any,
        });
        return result;
    }

    ${entity.hasSoftDelete ? `async delete(id: ID): Promise<void> {
        await this.prisma.${entity.tableName.replace(/-/g, '_')}.update({
            where: { id: String(id) },
            data: { deletedAt: new Date() },
        });
    }` : `async delete(id: ID): Promise<void> {
        await this.prisma.${entity.tableName.replace(/-/g, '_')}.delete({
            where: { id: String(id) },
        });
    }`}
}
`;
}

function generateOrmAdapter(entity: EntityDefinition): string {
    return `/**
 * @description
 * Adapter layer for ${entity.name} ORM operations.
 * Provides a unified interface for both TypeORM and Prisma.
 * Auto-generated - customize as needed.
 *
 * @since 3.6.0
 */

import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { ${entity.name} } from '../../entity/${entity.tableName}/${entity.tableName}.entity';

export interface Create${entity.name}Data {
${entity.fields.map(f => {
    const optional = f.isOptional ? '?' : '';
    return `    ${f.name}${optional}: ${f.type}${f.isArray ? '[]' : ''};`;
}).join('\n')}${entity.hasCustomFields ? '\n    customFields?: any;' : ''}
}

export interface Update${entity.name}Data {
${entity.fields.map(f => `    ${f.name}?: ${f.type}${f.isArray ? '[]' : ''};`).join('\n')}${entity.hasCustomFields ? '\n    customFields?: any;' : ''}
}

export interface ${entity.name}ListOptions {
    skip?: number;
    take?: number;
    filter?: any;
    sort?: any;
}

/**
 * ORM-agnostic interface for ${entity.name} operations
 */
export interface I${entity.name}OrmAdapter {
    findOne(id: ID): Promise<${entity.name} | undefined>;
    findAll(options: ${entity.name}ListOptions): Promise<PaginatedList<${entity.name}>>;
    create(data: Create${entity.name}Data): Promise<${entity.name}>;
    update(id: ID, data: Update${entity.name}Data): Promise<${entity.name}>;
    delete(id: ID): Promise<void>;
}
`;
}

function generatePrismaAdapter(entity: EntityDefinition): string {
    return `/**
 * @description
 * Prisma implementation of ${entity.name} ORM adapter.
 * Auto-generated - customize as needed.
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { ${entity.name} } from '../../entity/${entity.tableName}/${entity.tableName}.entity';
import { ${entity.name}PrismaRepository } from '../repositories/prisma/${entity.tableName}-prisma.repository';

import {
    Create${entity.name}Data,
    I${entity.name}OrmAdapter,
    ${entity.name}ListOptions,
    Update${entity.name}Data,
} from './${entity.tableName}-orm.adapter';

@Injectable()
export class ${entity.name}PrismaAdapter implements I${entity.name}OrmAdapter {
    constructor(private readonly repository: ${entity.name}PrismaRepository) {}

    async findOne(id: ID): Promise<${entity.name} | undefined> {
        const result = await this.repository.findOne(id);
        return result as ${entity.name} | undefined;
    }

    async findAll(options: ${entity.name}ListOptions): Promise<PaginatedList<${entity.name}>> {
        const result = await this.repository.findAll(options);
        return result as PaginatedList<${entity.name}>;
    }

    async create(data: Create${entity.name}Data): Promise<${entity.name}> {
        const result = await this.repository.create(data);
        return result as ${entity.name};
    }

    async update(id: ID, data: Update${entity.name}Data): Promise<${entity.name}> {
        const result = await this.repository.update(id, data);
        return result as ${entity.name};
    }

    async delete(id: ID): Promise<void> {
        await this.repository.delete(id);
    }
}
`;
}

// Generate code for all entities
console.log('='.repeat(80));
console.log('PRISMA REPOSITORY & ADAPTER CODE GENERATOR');
console.log('='.repeat(80));
console.log('');

for (const entity of ENTITIES_TO_GENERATE) {
    console.log(`\nGenerating code for: ${entity.name}`);
    console.log('-'.repeat(80));

    const repositoryCode = generateRepository(entity);
    const ormAdapterCode = generateOrmAdapter(entity);
    const prismaAdapterCode = generatePrismaAdapter(entity);

    console.log(`\n// ========== REPOSITORY: ${entity.tableName}-prisma.repository.ts ==========`);
    console.log(repositoryCode);

    console.log(`\n// ========== ORM ADAPTER: ${entity.tableName}-orm.adapter.ts ==========`);
    console.log(ormAdapterCode);

    console.log(`\n// ========== PRISMA ADAPTER: ${entity.tableName}-prisma.adapter.ts ==========`);
    console.log(prismaAdapterCode);
}

console.log('\n' + '='.repeat(80));
console.log(`Generated code for ${ENTITIES_TO_GENERATE.length} entities`);
console.log('='.repeat(80));
console.log('\nNext steps:');
console.log('1. Copy generated code to appropriate files');
console.log('2. Review and customize as needed');
console.log('3. Add entity-specific methods');
console.log('4. Create tests');
console.log('5. Update OrmAdapterFactory');
