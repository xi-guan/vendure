import { graphql, VariablesOf } from 'gql.tada';
import { describe, expect, it, vi } from 'vitest';

import { getOperationVariablesFields } from '../document-introspection/get-document-structure.js';

import { removeEmptyIdFields } from './utils.js';

vi.mock('virtual:admin-api-schema', () => {
    return import('../document-introspection/testing-utils.js').then(m => m.getMockSchemaInfo());
});

const createProductDocument = graphql(`
    mutation CreateProduct($input: CreateProductInput!) {
        createProduct(input: $input) {
            id
        }
    }
`);

type CreateProductInput = VariablesOf<typeof createProductDocument>;

describe('removeEmptyIdFields', () => {
    it('should remove empty translation id field', () => {
        const values: CreateProductInput = {
            input: { translations: [{ id: '', languageCode: 'en' }] },
        };
        const fields = getOperationVariablesFields(createProductDocument);
        const result = removeEmptyIdFields(values, fields);

        expect(result).toEqual({ input: { translations: [{ languageCode: 'en' }] } });
    });

    it('should remove empty featuredAsset id field', () => {
        const values: CreateProductInput = {
            input: { featuredAssetId: '', translations: [] },
        };
        const fields = getOperationVariablesFields(createProductDocument);
        const result = removeEmptyIdFields(values, fields);
        expect(result).toEqual({ input: { translations: [] } });
    });
});
