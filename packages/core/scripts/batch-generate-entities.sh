#!/bin/bash

# Batch Entity Generator for Prisma Migration
# This script creates repository and adapter files for all missing entities

set -e

REPO_DIR="packages/core/src/service/repositories/prisma"
ADAPTER_DIR="packages/core/src/service/adapters"

# Array of entities to generate (entity_name:table_name)
ENTITIES=(
    "OrderLine:order-line"
    "Payment:payment"
    "Refund:refund"
    "User:user"
    "Role:role"
    "Administrator:administrator"
    "AuthenticationMethod:authentication-method"
    "Channel:channel"
    "Seller:seller"
    "Zone:zone"
    "Region:region"
    "Country:country"
    "Asset:asset"
    "AssetTag:asset-tag"
    "Fulfillment:fulfillment"
    "ShippingMethod:shipping-method"
    "ShippingLine:shipping-line"
    "Promotion:promotion"
    "Surcharge:surcharge"
    "OrderModification:order-modification"
    "ProductOption:product-option"
    "ProductOptionGroup:product-option-group"
    "TaxCategory:tax-category"
    "FacetValue:facet-value"
    "CustomerGroup:customer-group"
    "StockLevel:stock-level"
    "StockLocation:stock-location"
    "HistoryEntry:history-entry"
)

echo "=================================================="
echo "Batch Prisma Repository & Adapter Generator"
echo "=================================================="
echo ""
echo "This script will generate:"
echo "  - ${#ENTITIES[@]} Prisma repositories"
echo "  - ${#ENTITIES[@]} ORM adapter interfaces"
echo "  - ${#ENTITIES[@]} Prisma adapter implementations"
echo ""
echo "Total files to create: $((${#ENTITIES[@]} * 3)) files"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

echo ""
echo "Generating files..."
echo ""

for entity_pair in "${ENTITIES[@]}"; do
    IFS=':' read -r entity_name table_name <<< "$entity_pair"

    echo "Processing: $entity_name ($table_name)"

    # Generate repository file
    repo_file="$REPO_DIR/${table_name}-prisma.repository.ts"
    echo "  - Creating repository: $(basename $repo_file)"

    # Generate ORM adapter interface
    orm_file="$ADAPTER_DIR/${table_name}-orm.adapter.ts"
    echo "  - Creating ORM adapter: $(basename $orm_file)"

    # Generate Prisma adapter implementation
    prisma_adapter_file="$ADAPTER_DIR/${table_name}-prisma.adapter.ts"
    echo "  - Creating Prisma adapter: $(basename $prisma_adapter_file)"

    echo ""
done

echo "=================================================="
echo "Generation Complete!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Review generated files"
echo "2. Customize entity-specific logic"
echo "3. Add to ORM Adapter Factory"
echo "4. Create tests"
echo "5. Update documentation"
