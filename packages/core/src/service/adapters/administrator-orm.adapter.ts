/**
 * @description
 * Adapter layer for Administrator ORM operations.
 * Provides a unified interface that can be implemented by both TypeORM and Prisma.
 *
 * This allows for gradual migration from TypeORM to Prisma with zero downtime.
 * The service layer depends on this interface, not on a specific ORM implementation.
 *
 * @since 3.6.0
 */

import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { Administrator } from '../../entity/administrator/administrator.entity';

export interface CreateAdministratorData {
    firstName: string;
    lastName: string;
    emailAddress: string;
    userId: ID;
    customFields?: any;
}

export interface UpdateAdministratorData {
    firstName?: string;
    lastName?: string;
    emailAddress?: string;
    customFields?: any;
}

export interface AdministratorListOptions {
    skip?: number;
    take?: number;
    filter?: any;
    sort?: any;
}

/**
 * ORM-agnostic interface for Administrator operations
 */
export interface IAdministratorOrmAdapter {
    /**
     * Find an administrator by ID
     */
    findOne(id: ID, includeRelations?: string[]): Promise<Administrator | undefined>;

    /**
     * Find an administrator by email address
     */
    findByEmail(emailAddress: string): Promise<Administrator | undefined>;

    /**
     * Find an administrator by user ID
     */
    findByUserId(userId: ID): Promise<Administrator | undefined>;

    /**
     * Find administrators with pagination
     */
    findAll(options: AdministratorListOptions): Promise<PaginatedList<Administrator>>;

    /**
     * Create a new administrator
     */
    create(data: CreateAdministratorData): Promise<Administrator>;

    /**
     * Update an administrator
     */
    update(id: ID, data: UpdateAdministratorData): Promise<Administrator>;

    /**
     * Soft delete an administrator
     */
    softDelete(id: ID): Promise<void>;

    /**
     * Restore a soft-deleted administrator
     */
    restore(id: ID): Promise<Administrator>;

    /**
     * Check if administrator exists
     */
    exists(id: ID): Promise<boolean>;

    /**
     * Count administrators
     */
    count(filter?: any): Promise<number>;

    /**
     * Search administrators
     */
    search(searchTerm: string, options?: AdministratorListOptions): Promise<PaginatedList<Administrator>>;
}

/**
 * Factory function to get the appropriate ORM adapter
 */
export function getAdministratorOrmAdapter(
    usePrisma: boolean,
    typeormAdapter: IAdministratorOrmAdapter,
    prismaAdapter: IAdministratorOrmAdapter,
): IAdministratorOrmAdapter {
    return usePrisma ? prismaAdapter : typeormAdapter;
}
