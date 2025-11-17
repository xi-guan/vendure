/**
 * @description
 * ORM-agnostic adapter interface for FacetValue entity operations.
 * This abstraction allows switching between TypeORM and Prisma implementations.
 *
 * @since 3.6.0
 */

import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { FacetValue } from '../../entity/facet-value/facet-value.entity';

export interface FacetValueFilterInput {
    code?: string;
    facetId?: string;
}

export interface FacetValueListOptions {
    skip?: number;
    take?: number;
    filter?: FacetValueFilterInput;
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreateFacetValueInput {
    code: string;
    facetId: string;
    customFields?: Record<string, any>;
}

export interface UpdateFacetValueInput {
    code?: string;
    customFields?: Record<string, any>;
}

export interface FacetValueTranslationInput {
    languageCode: string;
    name: string;
}

/**
 * ORM-agnostic FacetValue adapter interface
 */
export interface IFacetValueOrmAdapter {
    /**
     * Find a single facet value by ID
     */
    findOne(id: ID, includeRelations?: boolean): Promise<FacetValue | undefined>;

    /**
     * Find all facet values with pagination and filtering
     */
    findAll(options?: FacetValueListOptions): Promise<PaginatedList<FacetValue>>;

    /**
     * Find facet values by facet ID
     */
    findByFacet(facetId: ID): Promise<FacetValue[]>;

    /**
     * Find facet value by code and facet ID
     */
    findByCodeAndFacet(code: string, facetId: ID): Promise<FacetValue | undefined>;

    /**
     * Create a new facet value
     */
    create(data: CreateFacetValueInput): Promise<FacetValue>;

    /**
     * Update an existing facet value
     */
    update(id: ID, data: UpdateFacetValueInput): Promise<FacetValue>;

    /**
     * Delete a facet value
     */
    delete(id: ID): Promise<void>;

    /**
     * Add or update a translation for a facet value
     */
    upsertTranslation(facetValueId: ID, translation: FacetValueTranslationInput): Promise<void>;

    /**
     * Add facet value to a product
     */
    addToProduct(facetValueId: ID, productId: ID): Promise<void>;

    /**
     * Remove facet value from a product
     */
    removeFromProduct(facetValueId: ID, productId: ID): Promise<void>;

    /**
     * Add facet value to a product variant
     */
    addToVariant(facetValueId: ID, variantId: ID): Promise<void>;

    /**
     * Remove facet value from a product variant
     */
    removeFromVariant(facetValueId: ID, variantId: ID): Promise<void>;

    /**
     * Add facet value to a channel
     */
    addToChannel(facetValueId: ID, channelId: ID): Promise<void>;

    /**
     * Remove facet value from a channel
     */
    removeFromChannel(facetValueId: ID, channelId: ID): Promise<void>;
}
