/**
 * @description
 * Prisma-based repositories for ORM migration.
 *
 * These repositories provide type-safe database access using Prisma Client,
 * offering improved performance and developer experience over TypeORM.
 *
 * @docsCategory services
 * @since 3.6.0
 */

export { AddressPrismaRepository } from './address-prisma.repository';
export { AdministratorPrismaRepository } from './administrator-prisma.repository';
export { AssetPrismaRepository } from './asset-prisma.repository';
export { AssetTagPrismaRepository } from './asset-tag-prisma.repository';
export { ChannelPrismaRepository } from './channel-prisma.repository';
export { CollectionPrismaRepository } from './collection-prisma.repository';
export { CountryPrismaRepository } from './country-prisma.repository';
export { CustomerPrismaRepository } from './customer-prisma.repository';
export { CustomerGroupPrismaRepository } from './customer-group-prisma.repository';
export { FacetPrismaRepository } from './facet-prisma.repository';
export { FacetValuePrismaRepository } from './facet-value-prisma.repository';
export { FulfillmentPrismaRepository } from './fulfillment-prisma.repository';
export { GlobalSettingsPrismaRepository } from './global-settings-prisma.repository';
export { OrderPrismaRepository } from './order-prisma.repository';
export { OrderLinePrismaRepository } from './order-line-prisma.repository';
export { PaymentPrismaRepository } from './payment-prisma.repository';
export { ProductPrismaRepository } from './product-prisma.repository';
export { ProductOptionPrismaRepository } from './product-option-prisma.repository';
export { ProductOptionGroupPrismaRepository } from './product-option-group-prisma.repository';
export { ProductVariantPrismaRepository } from './product-variant-prisma.repository';
export { PromotionPrismaRepository } from './promotion-prisma.repository';
export { RefundPrismaRepository } from './refund-prisma.repository';
export { RegionPrismaRepository } from './region-prisma.repository';
export { RolePrismaRepository } from './role-prisma.repository';
export { SessionPrismaRepository } from './session-prisma.repository';
export { ShippingLinePrismaRepository } from './shipping-line-prisma.repository';
export { ShippingMethodPrismaRepository } from './shipping-method-prisma.repository';
export { StockLevelPrismaRepository } from './stock-level-prisma.repository';
export { StockLocationPrismaRepository } from './stock-location-prisma.repository';
export { StockMovementPrismaRepository } from './stock-movement-prisma.repository';
export { SurchargePrismaRepository } from './surcharge-prisma.repository';
export { TaxCategoryPrismaRepository } from './tax-category-prisma.repository';
export { TaxRatePrismaRepository } from './tax-rate-prisma.repository';
export { UserPrismaRepository } from './user-prisma.repository';
export { ZonePrismaRepository } from './zone-prisma.repository';
