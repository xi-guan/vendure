import gql from 'graphql-tag';
import { DocumentNode } from 'graphql';

export const testApiExtensions: DocumentNode = gql`
    enum TestErrorType {
        UNCAUGHT_ERROR
        THROWN_ERROR
        CAPTURED_ERROR
        CAPTURED_MESSAGE
        DATABASE_ERROR
    }
    extend type Mutation {
        createTestError(errorType: TestErrorType!): Boolean
    }
`;
