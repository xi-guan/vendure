/**
 * @description
 * Adapter layer for Session ORM operations.
 * Handles both authenticated sessions and anonymous sessions.
 *
 * @since 3.6.0
 */

import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { AnonymousSession } from '../../entity/session/anonymous-session.entity';
import { Session } from '../../entity/session/session.entity';

export interface SessionListOptions {
    skip?: number;
    take?: number;
    filter?: {
        userId?: string;
        invalidated?: boolean;
        expired?: boolean;
    };
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
}

export interface CreateSessionData {
    token: string;
    expires: Date;
    userId: ID;
    activeOrderId?: ID | null;
    customFields?: any;
}

export interface UpdateSessionData {
    expires?: Date;
    invalidated?: boolean;
    activeOrderId?: ID | null;
    customFields?: any;
}

export interface CreateAnonymousSessionData {
    token: string;
    expires: Date;
    activeOrderId?: ID | null;
    customFields?: any;
}

export interface UpdateAnonymousSessionData {
    expires?: Date;
    activeOrderId?: ID | null;
    customFields?: any;
}

/**
 * ORM-agnostic interface for Session operations
 */
export interface ISessionOrmAdapter {
    // Authenticated Session operations
    findOne(id: ID, includeRelations?: boolean): Promise<Session | undefined>;
    findByToken(token: string): Promise<Session | undefined>;
    findByUserId(userId: ID, options?: SessionListOptions): Promise<PaginatedList<Session>>;
    findAll(options: SessionListOptions): Promise<PaginatedList<Session>>;
    create(data: CreateSessionData): Promise<Session>;
    update(id: ID, data: UpdateSessionData): Promise<Session>;
    delete(id: ID): Promise<void>;
    invalidate(id: ID): Promise<Session>;
    deleteExpired(): Promise<number>;
    countActiveSessionsForUser(userId: ID): Promise<number>;
    findUserSessions(userId: ID, includeRelations?: boolean): Promise<Session[]>;

    // Anonymous Session operations
    findAnonymousSession(id: ID): Promise<AnonymousSession | undefined>;
    findAnonymousSessionByToken(token: string): Promise<AnonymousSession | undefined>;
    createAnonymousSession(data: CreateAnonymousSessionData): Promise<AnonymousSession>;
    updateAnonymousSession(id: ID, data: UpdateAnonymousSessionData): Promise<AnonymousSession>;
    deleteAnonymousSession(id: ID): Promise<void>;
    deleteExpiredAnonymousSessions(): Promise<number>;
}
