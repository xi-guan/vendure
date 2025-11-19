/**
 * Script to generate TypeORM adapter implementations for all entities
 *
 * This script creates basic TypeORM adapters that implement the ORM adapter interfaces.
 * These adapters wrap existing TypeORM operations to provide a unified interface.
 *
 * Usage:
 *   ts-node scripts/generate-typeorm-adapters.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const adaptersDir = path.join(__dirname, '../src/service/adapters');

// Entity name mappings (kebab-case to PascalCase)
const entityNameMappings: Record<string, string> = {
    'address': 'Address',
    'administrator': 'Administrator',
    'asset': 'Asset',
    'asset-tag': 'AssetTag',
    'channel': 'Channel',
    'collection': 'Collection',
    'country': 'Country',
    'customer-group': 'CustomerGroup',
    'customer': 'Customer',
    'facet': 'Facet',
    'facet-value': 'FacetValue',
    'fulfillment': 'Fulfillment',
    'global-settings': 'GlobalSettings',
    'order': 'Order',
    'order-line': 'OrderLine',
    'payment': 'Payment',
    'product': 'Product',
    'product-option': 'ProductOption',
    'product-option-group': 'ProductOptionGroup',
    'product-variant': 'ProductVariant',
    'promotion': 'Promotion',
    'refund': 'Refund',
    'region': 'Region',
    'role': 'Role',
    'session': 'Session',
    'shipping-line': 'ShippingLine',
    'shipping-method': 'ShippingMethod',
    'stock-level': 'StockLevel',
    'stock-location': 'StockLocation',
    'stock-movement': 'StockMovement',
    'surcharge': 'Surcharge',
    'tax-category': 'TaxCategory',
    'tax-rate': 'TaxRate',
    'user': 'User',
    'zone': 'Zone',
};

// Entity path mappings
const entityPathMappings: Record<string, string> = {
    'AssetTag': '../../entity/asset/asset-tag.entity',
    'GlobalSettings': '../../entity/global-settings/global-settings.entity',
    'ProductOption': '../../entity/product-option/product-option.entity',
    'ProductOptionGroup': '../../entity/product-option-group/product-option-group.entity',
    'ProductVariant': '../../entity/product-variant/product-variant.entity',
    'CustomerGroup': '../../entity/customer-group/customer-group.entity',
    'FacetValue': '../../entity/facet-value/facet-value.entity',
    'OrderLine': '../../entity/order-line/order-line.entity',
    'ShippingLine': '../../entity/shipping-line/shipping-line.entity',
    'ShippingMethod': '../../entity/shipping-method/shipping-method.entity',
    'StockLevel': '../../entity/stock-level/stock-level.entity',
    'StockLocation': '../../entity/stock-location/stock-location.entity',
    'StockMovement': '../../entity/stock-movement/stock-movement.entity',
    'TaxCategory': '../../entity/tax-category/tax-category.entity',
    'TaxRate': '../../entity/tax-rate/tax-rate.entity',
};

function getEntityPath(entityName: string): string {
    if (entityPathMappings[entityName]) {
        return entityPathMappings[entityName];
    }
    const kebabCase = entityName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
    return `../../entity/${kebabCase}/${kebabCase}.entity`;
}

function generateTypeOrmAdapter(kebabName: string): string {
    const entityName = entityNameMappings[kebabName];
    const interfaceName = `I${entityName}OrmAdapter`;
    const className = `${entityName}TypeOrmAdapter`;
    const entityPath = getEntityPath(entityName);

    return `import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { TransactionalConnection } from '../../connection/transactional-connection';
import { ${entityName} } from '${entityPath}';

import { ${interfaceName} } from './${kebabName}-orm.adapter';

/**
 * @description
 * TypeORM implementation of the ${entityName} ORM adapter.
 * Wraps existing TypeORM operations to provide a unified interface.
 *
 * @since 3.6.0
 */
@Injectable()
export class ${className} implements ${interfaceName} {
    constructor(private connection: TransactionalConnection) {}

    async findOne(id: ID, includeRelations: string[] = []): Promise<${entityName} | undefined> {
        const repository = this.connection.getRepository(${entityName});
        const entity = await repository.findOne({
            where: { id } as any,
            relations: includeRelations,
        });
        return entity || undefined;
    }

    async findAll(options: any = {}): Promise<PaginatedList<${entityName}>> {
        const { skip = 0, take = 20, filter = {}, sort = {} } = options;
        const repository = this.connection.getRepository(${entityName});

        const [items, totalItems] = await repository.findAndCount({
            where: filter,
            skip,
            take,
            order: sort,
        });

        return { items, totalItems };
    }

    async create(data: any): Promise<${entityName}> {
        const repository = this.connection.getRepository(${entityName});
        const entity = repository.create(data);
        await repository.save(entity);
        return entity;
    }

    async update(id: ID, data: any): Promise<${entityName}> {
        const repository = this.connection.getRepository(${entityName});
        await repository.update(id, data);
        const entity = await repository.findOne({ where: { id } as any });
        if (!entity) {
            throw new Error(\`${entityName} with id \${id} not found\`);
        }
        return entity;
    }

    async delete(id: ID): Promise<void> {
        const repository = this.connection.getRepository(${entityName});
        await repository.delete(id);
    }

    async exists(id: ID): Promise<boolean> {
        const repository = this.connection.getRepository(${entityName});
        const count = await repository.count({ where: { id } as any });
        return count > 0;
    }

    async count(filter: any = {}): Promise<number> {
        const repository = this.connection.getRepository(${entityName});
        return repository.count({ where: filter });
    }

    // Additional methods specific to ${entityName} should be implemented here
    // based on the interface definition in ${kebabName}-orm.adapter.ts
}
`;
}

async function main() {
    console.log('Generating TypeORM adapters...\n');

    const files = fs.readdirSync(adaptersDir);
    const ormAdapterFiles = files.filter(f => f.endsWith('-orm.adapter.ts'));

    let generated = 0;
    let skipped = 0;

    for (const file of ormAdapterFiles) {
        const kebabName = file.replace('-orm.adapter.ts', '');
        const typeormAdapterFile = `${kebabName}-typeorm.adapter.ts`;
        const typeormAdapterPath = path.join(adaptersDir, typeormAdapterFile);

        // Skip if TypeORM adapter already exists
        if (fs.existsSync(typeormAdapterPath)) {
            console.log(`⏭️  Skipped: ${typeormAdapterFile} (already exists)`);
            skipped++;
            continue;
        }

        const content = generateTypeOrmAdapter(kebabName);
        fs.writeFileSync(typeormAdapterPath, content);
        console.log(`✅ Generated: ${typeormAdapterFile}`);
        generated++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Generated: ${generated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${generated + skipped}\n`);
}

main().catch(console.error);
