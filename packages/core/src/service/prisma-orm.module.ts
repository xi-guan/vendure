/**
 * @description
 * NestJS module for ORM integration (Prisma and TypeORM adapters).
 * Provides all repositories, adapters, and configuration services.
 *
 * @since 3.6.0
 */

import { Module } from '@nestjs/common';

import { PrismaService } from '../connection/prisma.service';

// Prisma Adapters
import { AddressPrismaAdapter } from './adapters/address-prisma.adapter';
import { AdministratorPrismaAdapter } from './adapters/administrator-prisma.adapter';
import { AssetPrismaAdapter } from './adapters/asset-prisma.adapter';
import { AssetTagPrismaAdapter } from './adapters/asset-tag-prisma.adapter';
import { ChannelPrismaAdapter } from './adapters/channel-prisma.adapter';
import { CollectionPrismaAdapter } from './adapters/collection-prisma.adapter';
import { CountryPrismaAdapter } from './adapters/country-prisma.adapter';
import { CustomerPrismaAdapter } from './adapters/customer-prisma.adapter';
import { CustomerGroupPrismaAdapter } from './adapters/customer-group-prisma.adapter';
import { FacetPrismaAdapter } from './adapters/facet-prisma.adapter';
import { FacetValuePrismaAdapter } from './adapters/facet-value-prisma.adapter';
import { FulfillmentPrismaAdapter } from './adapters/fulfillment-prisma.adapter';
import { GlobalSettingsPrismaAdapter } from './adapters/global-settings-prisma.adapter';
import { OrderPrismaAdapter } from './adapters/order-prisma.adapter';
import { OrderLinePrismaAdapter } from './adapters/order-line-prisma.adapter';
import { PaymentPrismaAdapter } from './adapters/payment-prisma.adapter';
import { ProductPrismaAdapter } from './adapters/product-prisma.adapter';
import { ProductOptionPrismaAdapter } from './adapters/product-option-prisma.adapter';
import { ProductOptionGroupPrismaAdapter } from './adapters/product-option-group-prisma.adapter';
import { ProductVariantPrismaAdapter } from './adapters/product-variant-prisma.adapter';
import { PromotionPrismaAdapter } from './adapters/promotion-prisma.adapter';
import { RefundPrismaAdapter } from './adapters/refund-prisma.adapter';
import { RegionPrismaAdapter } from './adapters/region-prisma.adapter';
import { RolePrismaAdapter } from './adapters/role-prisma.adapter';
import { SessionPrismaAdapter } from './adapters/session-prisma.adapter';
import { ShippingLinePrismaAdapter } from './adapters/shipping-line-prisma.adapter';
import { ShippingMethodPrismaAdapter } from './adapters/shipping-method-prisma.adapter';
import { StockLevelPrismaAdapter } from './adapters/stock-level-prisma.adapter';
import { StockLocationPrismaAdapter } from './adapters/stock-location-prisma.adapter';
import { StockMovementPrismaAdapter } from './adapters/stock-movement-prisma.adapter';
import { SurchargePrismaAdapter } from './adapters/surcharge-prisma.adapter';
import { TaxCategoryPrismaAdapter } from './adapters/tax-category-prisma.adapter';
import { TaxRatePrismaAdapter } from './adapters/tax-rate-prisma.adapter';
import { UserPrismaAdapter } from './adapters/user-prisma.adapter';
import { ZonePrismaAdapter } from './adapters/zone-prisma.adapter';

// TypeORM Adapters
import { AddressTypeOrmAdapter } from './adapters/address-typeorm.adapter';
import { AdministratorTypeOrmAdapter } from './adapters/administrator-typeorm.adapter';
import { AssetTypeOrmAdapter } from './adapters/asset-typeorm.adapter';
import { AssetTagTypeOrmAdapter } from './adapters/asset-tag-typeorm.adapter';
import { ChannelTypeOrmAdapter } from './adapters/channel-typeorm.adapter';
import { CollectionTypeOrmAdapter } from './adapters/collection-typeorm.adapter';
import { CountryTypeOrmAdapter } from './adapters/country-typeorm.adapter';
import { CustomerTypeOrmAdapter } from './adapters/customer-typeorm.adapter';
import { CustomerGroupTypeOrmAdapter } from './adapters/customer-group-typeorm.adapter';
import { FacetTypeOrmAdapter } from './adapters/facet-typeorm.adapter';
import { FacetValueTypeOrmAdapter } from './adapters/facet-value-typeorm.adapter';
import { FulfillmentTypeOrmAdapter } from './adapters/fulfillment-typeorm.adapter';
import { GlobalSettingsTypeOrmAdapter } from './adapters/global-settings-typeorm.adapter';
import { OrderTypeOrmAdapter } from './adapters/order-typeorm.adapter';
import { OrderLineTypeOrmAdapter } from './adapters/order-line-typeorm.adapter';
import { PaymentTypeOrmAdapter } from './adapters/payment-typeorm.adapter';
import { ProductTypeOrmAdapter } from './adapters/product-typeorm.adapter';
import { ProductOptionTypeOrmAdapter } from './adapters/product-option-typeorm.adapter';
import { ProductOptionGroupTypeOrmAdapter } from './adapters/product-option-group-typeorm.adapter';
import { ProductVariantTypeOrmAdapter } from './adapters/product-variant-typeorm.adapter';
import { PromotionTypeOrmAdapter } from './adapters/promotion-typeorm.adapter';
import { RefundTypeOrmAdapter } from './adapters/refund-typeorm.adapter';
import { RegionTypeOrmAdapter } from './adapters/region-typeorm.adapter';
import { RoleTypeOrmAdapter } from './adapters/role-typeorm.adapter';
import { SessionTypeOrmAdapter } from './adapters/session-typeorm.adapter';
import { ShippingLineTypeOrmAdapter } from './adapters/shipping-line-typeorm.adapter';
import { ShippingMethodTypeOrmAdapter } from './adapters/shipping-method-typeorm.adapter';
import { StockLevelTypeOrmAdapter } from './adapters/stock-level-typeorm.adapter';
import { StockLocationTypeOrmAdapter } from './adapters/stock-location-typeorm.adapter';
import { StockMovementTypeOrmAdapter } from './adapters/stock-movement-typeorm.adapter';
import { SurchargeTypeOrmAdapter } from './adapters/surcharge-typeorm.adapter';
import { TaxCategoryTypeOrmAdapter } from './adapters/tax-category-typeorm.adapter';
import { TaxRateTypeOrmAdapter } from './adapters/tax-rate-typeorm.adapter';
import { UserTypeOrmAdapter } from './adapters/user-typeorm.adapter';
import { ZoneTypeOrmAdapter } from './adapters/zone-typeorm.adapter';

import { OrmAdapterFactory } from './adapters/orm-adapter.factory';
import { PrismaConfigService } from './config/prisma-config.service';

const prismaAdapters = [
    AddressPrismaAdapter,
    AdministratorPrismaAdapter,
    AssetPrismaAdapter,
    AssetTagPrismaAdapter,
    ChannelPrismaAdapter,
    CollectionPrismaAdapter,
    CountryPrismaAdapter,
    CustomerPrismaAdapter,
    CustomerGroupPrismaAdapter,
    FacetPrismaAdapter,
    FacetValuePrismaAdapter,
    FulfillmentPrismaAdapter,
    GlobalSettingsPrismaAdapter,
    OrderPrismaAdapter,
    OrderLinePrismaAdapter,
    PaymentPrismaAdapter,
    ProductPrismaAdapter,
    ProductOptionPrismaAdapter,
    ProductOptionGroupPrismaAdapter,
    ProductVariantPrismaAdapter,
    PromotionPrismaAdapter,
    RefundPrismaAdapter,
    RegionPrismaAdapter,
    RolePrismaAdapter,
    SessionPrismaAdapter,
    ShippingLinePrismaAdapter,
    ShippingMethodPrismaAdapter,
    StockLevelPrismaAdapter,
    StockLocationPrismaAdapter,
    StockMovementPrismaAdapter,
    SurchargePrismaAdapter,
    TaxCategoryPrismaAdapter,
    TaxRatePrismaAdapter,
    UserPrismaAdapter,
    ZonePrismaAdapter,
];

const typeormAdapters = [
    AddressTypeOrmAdapter,
    AdministratorTypeOrmAdapter,
    AssetTypeOrmAdapter,
    AssetTagTypeOrmAdapter,
    ChannelTypeOrmAdapter,
    CollectionTypeOrmAdapter,
    CountryTypeOrmAdapter,
    CustomerTypeOrmAdapter,
    CustomerGroupTypeOrmAdapter,
    FacetTypeOrmAdapter,
    FacetValueTypeOrmAdapter,
    FulfillmentTypeOrmAdapter,
    GlobalSettingsTypeOrmAdapter,
    OrderTypeOrmAdapter,
    OrderLineTypeOrmAdapter,
    PaymentTypeOrmAdapter,
    ProductTypeOrmAdapter,
    ProductOptionTypeOrmAdapter,
    ProductOptionGroupTypeOrmAdapter,
    ProductVariantTypeOrmAdapter,
    PromotionTypeOrmAdapter,
    RefundTypeOrmAdapter,
    RegionTypeOrmAdapter,
    RoleTypeOrmAdapter,
    SessionTypeOrmAdapter,
    ShippingLineTypeOrmAdapter,
    ShippingMethodTypeOrmAdapter,
    StockLevelTypeOrmAdapter,
    StockLocationTypeOrmAdapter,
    StockMovementTypeOrmAdapter,
    SurchargeTypeOrmAdapter,
    TaxCategoryTypeOrmAdapter,
    TaxRateTypeOrmAdapter,
    UserTypeOrmAdapter,
    ZoneTypeOrmAdapter,
];

@Module({
    providers: [
        PrismaService,
        PrismaConfigService,
        ...prismaAdapters,
        ...typeormAdapters,
        OrmAdapterFactory,
    ],
    exports: [
        PrismaService,
        PrismaConfigService,
        ...prismaAdapters,
        ...typeormAdapters,
        OrmAdapterFactory,
    ],
})
export class PrismaOrmModule {}
