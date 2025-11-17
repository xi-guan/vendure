/**
 * @description
 * Adapter layer for User ORM operations.
 * Provides a unified interface that can be implemented by both TypeORM and Prisma.
 *
 * This allows for gradual migration from TypeORM to Prisma with zero downtime.
 * The service layer depends on this interface, not on a specific ORM implementation.
 *
 * @since 3.6.0
 */

import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { Role } from '../../entity/role/role.entity';
import { User } from '../../entity/user/user.entity';

export interface CreateUserData {
    identifier: string;
    verified?: boolean;
    lastLogin?: Date;
    customFields?: any;
}

export interface UpdateUserData {
    identifier?: string;
    verified?: boolean;
    lastLogin?: Date;
    customFields?: any;
}

export interface UserListOptions {
    skip?: number;
    take?: number;
    filter?: any;
    sort?: any;
}

/**
 * ORM-agnostic interface for User operations
 */
export interface IUserOrmAdapter {
    /**
     * Find a user by ID
     */
    findOne(id: ID, includeRelations?: string[]): Promise<User | undefined>;

    /**
     * Find a user by identifier (email/username)
     */
    findByIdentifier(identifier: string): Promise<User | undefined>;

    /**
     * Find users with pagination
     */
    findAll(options: UserListOptions): Promise<PaginatedList<User>>;

    /**
     * Create a new user
     */
    create(data: CreateUserData): Promise<User>;

    /**
     * Update a user
     */
    update(id: ID, data: UpdateUserData): Promise<User>;

    /**
     * Soft delete a user
     */
    softDelete(id: ID): Promise<void>;

    /**
     * Restore a soft-deleted user
     */
    restore(id: ID): Promise<User>;

    /**
     * Check if user exists
     */
    exists(id: ID): Promise<boolean>;

    /**
     * Count users
     */
    count(filter?: any): Promise<number>;

    /**
     * Add user to role
     */
    addToRole(userId: ID, roleId: ID): Promise<void>;

    /**
     * Remove user from role
     */
    removeFromRole(userId: ID, roleId: ID): Promise<void>;

    /**
     * Get user roles
     */
    getRoles(userId: ID): Promise<Role[]>;

    /**
     * Update last login timestamp
     */
    updateLastLogin(id: ID): Promise<User>;

    /**
     * Mark user as verified
     */
    setVerified(id: ID, verified: boolean): Promise<User>;

    /**
     * Find verified users
     */
    findVerified(): Promise<User[]>;

    /**
     * Find unverified users
     */
    findUnverified(): Promise<User[]>;
}

/**
 * Factory function to get the appropriate ORM adapter
 */
export function getUserOrmAdapter(
    usePrisma: boolean,
    typeormAdapter: IUserOrmAdapter,
    prismaAdapter: IUserOrmAdapter,
): IUserOrmAdapter {
    return usePrisma ? prismaAdapter : typeormAdapter;
}
