/**
 * @description
 * Adapter layer for Role ORM operations.
 * Provides a unified interface that can be implemented by both TypeORM and Prisma.
 *
 * This allows for gradual migration from TypeORM to Prisma with zero downtime.
 * The service layer depends on this interface, not on a specific ORM implementation.
 *
 * @since 3.6.0
 */

import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { Channel } from '../../entity/channel/channel.entity';
import { Role } from '../../entity/role/role.entity';
import { User } from '../../entity/user/user.entity';

export interface CreateRoleData {
    code: string;
    description: string;
    permissions: string[];
    customFields?: any;
}

export interface UpdateRoleData {
    code?: string;
    description?: string;
    permissions?: string[];
    customFields?: any;
}

export interface RoleListOptions {
    skip?: number;
    take?: number;
    filter?: any;
    sort?: any;
}

/**
 * ORM-agnostic interface for Role operations
 */
export interface IRoleOrmAdapter {
    /**
     * Find a role by ID
     */
    findOne(id: ID, includeRelations?: string[]): Promise<Role | undefined>;

    /**
     * Find a role by code
     */
    findByCode(code: string): Promise<Role | undefined>;

    /**
     * Find roles with pagination
     */
    findAll(options: RoleListOptions): Promise<PaginatedList<Role>>;

    /**
     * Create a new role
     */
    create(data: CreateRoleData): Promise<Role>;

    /**
     * Update a role
     */
    update(id: ID, data: UpdateRoleData): Promise<Role>;

    /**
     * Delete a role
     */
    delete(id: ID): Promise<void>;

    /**
     * Check if role exists
     */
    exists(id: ID): Promise<boolean>;

    /**
     * Count roles
     */
    count(filter?: any): Promise<number>;

    /**
     * Add role to channel
     */
    addToChannel(roleId: ID, channelId: ID): Promise<void>;

    /**
     * Remove role from channel
     */
    removeFromChannel(roleId: ID, channelId: ID): Promise<void>;

    /**
     * Get role channels
     */
    getChannels(roleId: ID): Promise<Channel[]>;

    /**
     * Get users with this role
     */
    getUsers(roleId: ID): Promise<User[]>;

    /**
     * Find roles with specific permission
     */
    findByPermission(permission: string): Promise<Role[]>;
}

/**
 * Factory function to get the appropriate ORM adapter
 */
export function getRoleOrmAdapter(
    usePrisma: boolean,
    typeormAdapter: IRoleOrmAdapter,
    prismaAdapter: IRoleOrmAdapter,
): IRoleOrmAdapter {
    return usePrisma ? prismaAdapter : typeormAdapter;
}
