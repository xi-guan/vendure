/**
 * @description
 * Factory for creating ORM adapters based on runtime configuration.
 * Allows switching between TypeORM and Prisma implementations.
 *
 * This factory provides access to all entity adapters in the system.
 * Each adapter provides a database-agnostic interface that can be implemented
 * by different ORMs (currently Prisma, with TypeORM support planned).
 *
 * @since 3.6.0
 */

import { Injectable, Logger, NotImplementedException } from '@nestjs/common';

import { PrismaConfigService } from '../config/prisma-config.service';

// Import all adapter interfaces and implementations
import { IAddressOrmAdapter } from './address-orm.adapter';
import { AddressPrismaAdapter } from './address-prisma.adapter';
import { IAdministratorOrmAdapter } from './administrator-orm.adapter';
import { AdministratorPrismaAdapter } from './administrator-prisma.adapter';
import { IAssetOrmAdapter } from './asset-orm.adapter';
import { AssetPrismaAdapter } from './asset-prisma.adapter';
import { IAssetTagOrmAdapter } from './asset-tag-orm.adapter';
import { AssetTagPrismaAdapter } from './asset-tag-prisma.adapter';
import { IChannelOrmAdapter } from './channel-orm.adapter';
import { ChannelPrismaAdapter } from './channel-prisma.adapter';
import { ICollectionOrmAdapter } from './collection-orm.adapter';
import { CollectionPrismaAdapter } from './collection-prisma.adapter';
import { ICountryOrmAdapter } from './country-orm.adapter';
import { CountryPrismaAdapter } from './country-prisma.adapter';
import { ICustomerOrmAdapter } from './customer-orm.adapter';
import { CustomerPrismaAdapter } from './customer-prisma.adapter';
import { ICustomerGroupOrmAdapter } from './customer-group-orm.adapter';
import { CustomerGroupPrismaAdapter } from './customer-group-prisma.adapter';
import { IFacetOrmAdapter } from './facet-orm.adapter';
import { FacetPrismaAdapter } from './facet-prisma.adapter';
import { IFacetValueOrmAdapter } from './facet-value-orm.adapter';
import { FacetValuePrismaAdapter } from './facet-value-prisma.adapter';
import { IFulfillmentOrmAdapter } from './fulfillment-orm.adapter';
import { FulfillmentPrismaAdapter } from './fulfillment-prisma.adapter';
import { IGlobalSettingsOrmAdapter } from './global-settings-orm.adapter';
import { GlobalSettingsPrismaAdapter } from './global-settings-prisma.adapter';
import { IOrderOrmAdapter } from './order-orm.adapter';
import { OrderPrismaAdapter } from './order-prisma.adapter';
import { IOrderLineOrmAdapter } from './order-line-orm.adapter';
import { OrderLinePrismaAdapter } from './order-line-prisma.adapter';
import { IPaymentOrmAdapter } from './payment-orm.adapter';
import { PaymentPrismaAdapter } from './payment-prisma.adapter';
import { IProductOrmAdapter } from './product-orm.adapter';
import { ProductPrismaAdapter } from './product-prisma.adapter';
import { IProductOptionOrmAdapter } from './product-option-orm.adapter';
import { ProductOptionPrismaAdapter } from './product-option-prisma.adapter';
import { IProductOptionGroupOrmAdapter } from './product-option-group-orm.adapter';
import { ProductOptionGroupPrismaAdapter } from './product-option-group-prisma.adapter';
import { IProductVariantOrmAdapter } from './product-variant-orm.adapter';
import { ProductVariantPrismaAdapter } from './product-variant-prisma.adapter';
import { IPromotionOrmAdapter } from './promotion-orm.adapter';
import { PromotionPrismaAdapter } from './promotion-prisma.adapter';
import { IRefundOrmAdapter } from './refund-orm.adapter';
import { RefundPrismaAdapter } from './refund-prisma.adapter';
import { IRegionOrmAdapter } from './region-orm.adapter';
import { RegionPrismaAdapter } from './region-prisma.adapter';
import { IRoleOrmAdapter } from './role-orm.adapter';
import { RolePrismaAdapter } from './role-prisma.adapter';
import { ISessionOrmAdapter } from './session-orm.adapter';
import { SessionPrismaAdapter } from './session-prisma.adapter';
import { IShippingLineOrmAdapter } from './shipping-line-orm.adapter';
import { ShippingLinePrismaAdapter } from './shipping-line-prisma.adapter';
import { IShippingMethodOrmAdapter } from './shipping-method-orm.adapter';
import { ShippingMethodPrismaAdapter } from './shipping-method-prisma.adapter';
import { IStockLevelOrmAdapter } from './stock-level-orm.adapter';
import { StockLevelPrismaAdapter } from './stock-level-prisma.adapter';
import { IStockLocationOrmAdapter } from './stock-location-orm.adapter';
import { StockLocationPrismaAdapter } from './stock-location-prisma.adapter';
import { IStockMovementOrmAdapter } from './stock-movement-orm.adapter';
import { StockMovementPrismaAdapter } from './stock-movement-prisma.adapter';
import { ISurchargeOrmAdapter } from './surcharge-orm.adapter';
import { SurchargePrismaAdapter } from './surcharge-prisma.adapter';
import { ITaxCategoryOrmAdapter } from './tax-category-orm.adapter';
import { TaxCategoryPrismaAdapter } from './tax-category-prisma.adapter';
import { ITaxRateOrmAdapter } from './tax-rate-orm.adapter';
import { TaxRatePrismaAdapter } from './tax-rate-prisma.adapter';
import { IUserOrmAdapter } from './user-orm.adapter';
import { UserPrismaAdapter } from './user-prisma.adapter';
import { IZoneOrmAdapter } from './zone-orm.adapter';
import { ZonePrismaAdapter } from './zone-prisma.adapter';

// TypeORM Adapters
import { AddressTypeOrmAdapter } from './address-typeorm.adapter';
import { AdministratorTypeOrmAdapter } from './administrator-typeorm.adapter';
import { AssetTypeOrmAdapter } from './asset-typeorm.adapter';
import { AssetTagTypeOrmAdapter } from './asset-tag-typeorm.adapter';
import { ChannelTypeOrmAdapter } from './channel-typeorm.adapter';
import { CollectionTypeOrmAdapter } from './collection-typeorm.adapter';
import { CountryTypeOrmAdapter } from './country-typeorm.adapter';
import { CustomerTypeOrmAdapter } from './customer-typeorm.adapter';
import { CustomerGroupTypeOrmAdapter } from './customer-group-typeorm.adapter';
import { FacetTypeOrmAdapter } from './facet-typeorm.adapter';
import { FacetValueTypeOrmAdapter } from './facet-value-typeorm.adapter';
import { FulfillmentTypeOrmAdapter } from './fulfillment-typeorm.adapter';
import { GlobalSettingsTypeOrmAdapter } from './global-settings-typeorm.adapter';
import { OrderTypeOrmAdapter } from './order-typeorm.adapter';
import { OrderLineTypeOrmAdapter } from './order-line-typeorm.adapter';
import { PaymentTypeOrmAdapter } from './payment-typeorm.adapter';
import { ProductTypeOrmAdapter } from './product-typeorm.adapter';
import { ProductOptionTypeOrmAdapter } from './product-option-typeorm.adapter';
import { ProductOptionGroupTypeOrmAdapter } from './product-option-group-typeorm.adapter';
import { ProductVariantTypeOrmAdapter } from './product-variant-typeorm.adapter';
import { PromotionTypeOrmAdapter } from './promotion-typeorm.adapter';
import { RefundTypeOrmAdapter } from './refund-typeorm.adapter';
import { RegionTypeOrmAdapter } from './region-typeorm.adapter';
import { RoleTypeOrmAdapter } from './role-typeorm.adapter';
import { SessionTypeOrmAdapter } from './session-typeorm.adapter';
import { ShippingLineTypeOrmAdapter } from './shipping-line-typeorm.adapter';
import { ShippingMethodTypeOrmAdapter } from './shipping-method-typeorm.adapter';
import { StockLevelTypeOrmAdapter } from './stock-level-typeorm.adapter';
import { StockLocationTypeOrmAdapter } from './stock-location-typeorm.adapter';
import { StockMovementTypeOrmAdapter } from './stock-movement-typeorm.adapter';
import { SurchargeTypeOrmAdapter } from './surcharge-typeorm.adapter';
import { TaxCategoryTypeOrmAdapter } from './tax-category-typeorm.adapter';
import { TaxRateTypeOrmAdapter } from './tax-rate-typeorm.adapter';
import { UserTypeOrmAdapter } from './user-typeorm.adapter';
import { ZoneTypeOrmAdapter } from './zone-typeorm.adapter';

/**
 * Factory for creating ORM adapters
 *
 * This factory serves as the central point for obtaining ORM adapters.
 * It automatically selects the appropriate implementation (Prisma or TypeORM)
 * based on the runtime configuration.
 *
 * Usage in services:
 * ```typescript
 * constructor(private ormAdapterFactory: OrmAdapterFactory) {}
 *
 * async getCustomer(id: ID) {
 *   const adapter = this.ormAdapterFactory.getCustomerAdapter();
 *   return adapter.findOne(id);
 * }
 * ```
 */
@Injectable()
export class OrmAdapterFactory {
    private readonly logger = new Logger(OrmAdapterFactory.name);

    constructor(
        private readonly prismaConfig: PrismaConfigService,
        // Core Entity Adapters
        private readonly addressPrismaAdapter: AddressPrismaAdapter,
        private readonly customerPrismaAdapter: CustomerPrismaAdapter,
        private readonly customerGroupPrismaAdapter: CustomerGroupPrismaAdapter,
        // Product Entity Adapters
        private readonly productPrismaAdapter: ProductPrismaAdapter,
        private readonly productVariantPrismaAdapter: ProductVariantPrismaAdapter,
        private readonly productOptionPrismaAdapter: ProductOptionPrismaAdapter,
        private readonly productOptionGroupPrismaAdapter: ProductOptionGroupPrismaAdapter,
        private readonly collectionPrismaAdapter: CollectionPrismaAdapter,
        // Order Entity Adapters
        private readonly orderPrismaAdapter: OrderPrismaAdapter,
        private readonly orderLinePrismaAdapter: OrderLinePrismaAdapter,
        private readonly paymentPrismaAdapter: PaymentPrismaAdapter,
        private readonly refundPrismaAdapter: RefundPrismaAdapter,
        private readonly fulfillmentPrismaAdapter: FulfillmentPrismaAdapter,
        private readonly shippingLinePrismaAdapter: ShippingLinePrismaAdapter,
        private readonly shippingMethodPrismaAdapter: ShippingMethodPrismaAdapter,
        private readonly promotionPrismaAdapter: PromotionPrismaAdapter,
        private readonly surchargePrismaAdapter: SurchargePrismaAdapter,
        // Facet Entity Adapters
        private readonly facetPrismaAdapter: FacetPrismaAdapter,
        private readonly facetValuePrismaAdapter: FacetValuePrismaAdapter,
        // Tax Entity Adapters
        private readonly taxRatePrismaAdapter: TaxRatePrismaAdapter,
        private readonly taxCategoryPrismaAdapter: TaxCategoryPrismaAdapter,
        // Asset Entity Adapters
        private readonly assetPrismaAdapter: AssetPrismaAdapter,
        private readonly assetTagPrismaAdapter: AssetTagPrismaAdapter,
        // Channel & Region Entity Adapters
        private readonly channelPrismaAdapter: ChannelPrismaAdapter,
        private readonly zonePrismaAdapter: ZonePrismaAdapter,
        private readonly regionPrismaAdapter: RegionPrismaAdapter,
        private readonly countryPrismaAdapter: CountryPrismaAdapter,
        // User & Auth Entity Adapters
        private readonly userPrismaAdapter: UserPrismaAdapter,
        private readonly rolePrismaAdapter: RolePrismaAdapter,
        private readonly administratorPrismaAdapter: AdministratorPrismaAdapter,
        private readonly sessionPrismaAdapter: SessionPrismaAdapter,
        // Stock Entity Adapters
        private readonly stockLevelPrismaAdapter: StockLevelPrismaAdapter,
        private readonly stockLocationPrismaAdapter: StockLocationPrismaAdapter,
        private readonly stockMovementPrismaAdapter: StockMovementPrismaAdapter,
        // Settings
        private readonly globalSettingsPrismaAdapter: GlobalSettingsPrismaAdapter,
        // TypeORM Adapters
        private readonly addressTypeOrmAdapter: AddressTypeOrmAdapter,
        private readonly administratorTypeOrmAdapter: AdministratorTypeOrmAdapter,
        private readonly assetTypeOrmAdapter: AssetTypeOrmAdapter,
        private readonly assetTagTypeOrmAdapter: AssetTagTypeOrmAdapter,
        private readonly channelTypeOrmAdapter: ChannelTypeOrmAdapter,
        private readonly collectionTypeOrmAdapter: CollectionTypeOrmAdapter,
        private readonly countryTypeOrmAdapter: CountryTypeOrmAdapter,
        private readonly customerTypeOrmAdapter: CustomerTypeOrmAdapter,
        private readonly customerGroupTypeOrmAdapter: CustomerGroupTypeOrmAdapter,
        private readonly facetTypeOrmAdapter: FacetTypeOrmAdapter,
        private readonly facetValueTypeOrmAdapter: FacetValueTypeOrmAdapter,
        private readonly fulfillmentTypeOrmAdapter: FulfillmentTypeOrmAdapter,
        private readonly globalSettingsTypeOrmAdapter: GlobalSettingsTypeOrmAdapter,
        private readonly orderTypeOrmAdapter: OrderTypeOrmAdapter,
        private readonly orderLineTypeOrmAdapter: OrderLineTypeOrmAdapter,
        private readonly paymentTypeOrmAdapter: PaymentTypeOrmAdapter,
        private readonly productTypeOrmAdapter: ProductTypeOrmAdapter,
        private readonly productOptionTypeOrmAdapter: ProductOptionTypeOrmAdapter,
        private readonly productOptionGroupTypeOrmAdapter: ProductOptionGroupTypeOrmAdapter,
        private readonly productVariantTypeOrmAdapter: ProductVariantTypeOrmAdapter,
        private readonly promotionTypeOrmAdapter: PromotionTypeOrmAdapter,
        private readonly refundTypeOrmAdapter: RefundTypeOrmAdapter,
        private readonly regionTypeOrmAdapter: RegionTypeOrmAdapter,
        private readonly roleTypeOrmAdapter: RoleTypeOrmAdapter,
        private readonly sessionTypeOrmAdapter: SessionTypeOrmAdapter,
        private readonly shippingLineTypeOrmAdapter: ShippingLineTypeOrmAdapter,
        private readonly shippingMethodTypeOrmAdapter: ShippingMethodTypeOrmAdapter,
        private readonly stockLevelTypeOrmAdapter: StockLevelTypeOrmAdapter,
        private readonly stockLocationTypeOrmAdapter: StockLocationTypeOrmAdapter,
        private readonly stockMovementTypeOrmAdapter: StockMovementTypeOrmAdapter,
        private readonly surchargeTypeOrmAdapter: SurchargeTypeOrmAdapter,
        private readonly taxCategoryTypeOrmAdapter: TaxCategoryTypeOrmAdapter,
        private readonly taxRateTypeOrmAdapter: TaxRateTypeOrmAdapter,
        private readonly userTypeOrmAdapter: UserTypeOrmAdapter,
        private readonly zoneTypeOrmAdapter: ZoneTypeOrmAdapter,
    ) {}

    // ==================== Core Entity Adapters ====================

    getAddressAdapter(): IAddressOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.addressPrismaAdapter;
        }
        return this.addressTypeOrmAdapter;
    }

    getCustomerAdapter(): ICustomerOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.customerPrismaAdapter;
        }
        return this.customerTypeOrmAdapter;
    }

    getCustomerGroupAdapter(): ICustomerGroupOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.customerGroupPrismaAdapter;
        }
        return this.customerGroupTypeOrmAdapter;
    }

    // ==================== Product Entity Adapters ====================

    getProductAdapter(): IProductOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.productPrismaAdapter;
        }
        return this.productTypeOrmAdapter;
    }

    getProductVariantAdapter(): IProductVariantOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.productVariantPrismaAdapter;
        }
        return this.productVariantTypeOrmAdapter;
    }

    getProductOptionAdapter(): IProductOptionOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.productOptionPrismaAdapter;
        }
        return this.productOptionTypeOrmAdapter;
    }

    getProductOptionGroupAdapter(): IProductOptionGroupOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.productOptionGroupPrismaAdapter;
        }
        return this.productOptionGroupTypeOrmAdapter;
    }

    getCollectionAdapter(): ICollectionOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.collectionPrismaAdapter;
        }
        return this.collectionTypeOrmAdapter;
    }

    // ==================== Order Entity Adapters ====================

    getOrderAdapter(): IOrderOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.orderPrismaAdapter;
        }
        return this.orderTypeOrmAdapter;
    }

    getOrderLineAdapter(): IOrderLineOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.orderLinePrismaAdapter;
        }
        return this.orderLineTypeOrmAdapter;
    }

    getPaymentAdapter(): IPaymentOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.paymentPrismaAdapter;
        }
        return this.paymentTypeOrmAdapter;
    }

    getRefundAdapter(): IRefundOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.refundPrismaAdapter;
        }
        return this.refundTypeOrmAdapter;
    }

    getFulfillmentAdapter(): IFulfillmentOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.fulfillmentPrismaAdapter;
        }
        return this.fulfillmentTypeOrmAdapter;
    }

    getShippingLineAdapter(): IShippingLineOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.shippingLinePrismaAdapter;
        }
        return this.shippingLineTypeOrmAdapter;
    }

    getShippingMethodAdapter(): IShippingMethodOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.shippingMethodPrismaAdapter;
        }
        return this.shippingMethodTypeOrmAdapter;
    }

    getPromotionAdapter(): IPromotionOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.promotionPrismaAdapter;
        }
        return this.promotionTypeOrmAdapter;
    }

    getSurchargeAdapter(): ISurchargeOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.surchargePrismaAdapter;
        }
        return this.surchargeTypeOrmAdapter;
    }

    // ==================== Facet Entity Adapters ====================

    getFacetAdapter(): IFacetOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.facetPrismaAdapter;
        }
        return this.facetTypeOrmAdapter;
    }

    getFacetValueAdapter(): IFacetValueOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.facetValuePrismaAdapter;
        }
        return this.facetValueTypeOrmAdapter;
    }

    // ==================== Tax Entity Adapters ====================

    getTaxRateAdapter(): ITaxRateOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.taxRatePrismaAdapter;
        }
        return this.taxRateTypeOrmAdapter;
    }

    getTaxCategoryAdapter(): ITaxCategoryOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.taxCategoryPrismaAdapter;
        }
        return this.taxCategoryTypeOrmAdapter;
    }

    // ==================== Asset Entity Adapters ====================

    getAssetAdapter(): IAssetOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.assetPrismaAdapter;
        }
        return this.assetTypeOrmAdapter;
    }

    getAssetTagAdapter(): IAssetTagOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.assetTagPrismaAdapter;
        }
        return this.assetTagTypeOrmAdapter;
    }

    // ==================== Channel & Region Entity Adapters ====================

    getChannelAdapter(): IChannelOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.channelPrismaAdapter;
        }
        return this.channelTypeOrmAdapter;
    }

    getZoneAdapter(): IZoneOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.zonePrismaAdapter;
        }
        return this.zoneTypeOrmAdapter;
    }

    getRegionAdapter(): IRegionOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.regionPrismaAdapter;
        }
        return this.regionTypeOrmAdapter;
    }

    getCountryAdapter(): ICountryOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.countryPrismaAdapter;
        }
        return this.countryTypeOrmAdapter;
    }

    // ==================== User & Auth Entity Adapters ====================

    getUserAdapter(): IUserOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.userPrismaAdapter;
        }
        return this.userTypeOrmAdapter;
    }

    getRoleAdapter(): IRoleOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.rolePrismaAdapter;
        }
        return this.roleTypeOrmAdapter;
    }

    getAdministratorAdapter(): IAdministratorOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.administratorPrismaAdapter;
        }
        return this.administratorTypeOrmAdapter;
    }

    getSessionAdapter(): ISessionOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.sessionPrismaAdapter;
        }
        return this.sessionTypeOrmAdapter;
    }

    // ==================== Stock Entity Adapters ====================

    getStockLevelAdapter(): IStockLevelOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.stockLevelPrismaAdapter;
        }
        return this.stockLevelTypeOrmAdapter;
    }

    getStockLocationAdapter(): IStockLocationOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.stockLocationPrismaAdapter;
        }
        return this.stockLocationTypeOrmAdapter;
    }

    getStockMovementAdapter(): IStockMovementOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.stockMovementPrismaAdapter;
        }
        return this.stockMovementTypeOrmAdapter;
    }

    // ==================== Settings ====================

    getGlobalSettingsAdapter(): IGlobalSettingsOrmAdapter {
        if (this.prismaConfig.isUsingPrisma()) {
            return this.globalSettingsPrismaAdapter;
        }
        return this.globalSettingsTypeOrmAdapter;
    }

    // ==================== Helper Methods ====================

    /**
     * Check if Prisma is currently enabled
     */
    isPrismaEnabled(): boolean {
        return this.prismaConfig.isUsingPrisma();
    }

    /**
     * Get the current ORM mode
     */
    getOrmMode(): 'prisma' | 'typeorm' {
        return this.prismaConfig.isUsingPrisma() ? 'prisma' : 'typeorm';
    }

    /**
     * Throw descriptive error when TypeORM adapter is not yet implemented
     */
    private throwTypeOrmNotImplemented(entityName: string): never {
        const errorMessage = [
            `TypeORM ${entityName} adapter is not yet implemented.`,
            '',
            'The Prisma ORM adapters are currently the only available implementation.',
            'To use Prisma, please configure your Vendure server:',
            '',
            '1. Set environment variable: VENDURE_ENABLE_PRISMA=true',
            '2. Or configure in VendureConfig:',
            '   {',
            '     dbConnectionOptions: {',
            '       enablePrisma: true,',
            '       ormMode: "prisma"',
            '     }',
            '   }',
            '',
            'For more information, see:',
            '  - PRISMA_UNBLOCK_GUIDE.md (setup instructions)',
            '  - PRISMA_MIGRATION_STATUS.md (migration status)',
            '  - packages/core/prisma/README.md (Prisma configuration)',
        ].join('\n');

        this.logger.error(errorMessage);
        throw new NotImplementedException(errorMessage);
    }
}
