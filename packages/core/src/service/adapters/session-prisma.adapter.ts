/**
 * @description
 * Prisma implementation of Session ORM adapter.
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';

import { AnonymousSession } from '../../entity/session/anonymous-session.entity';
import { Session } from '../../entity/session/session.entity';
import { SessionPrismaRepository } from '../repositories/prisma/session-prisma.repository';

import {
    CreateAnonymousSessionData,
    CreateSessionData,
    ISessionOrmAdapter,
    SessionListOptions,
    UpdateAnonymousSessionData,
    UpdateSessionData,
} from './session-orm.adapter';

@Injectable()
export class SessionPrismaAdapter implements ISessionOrmAdapter {
    constructor(private readonly repository: SessionPrismaRepository) {}

    // Authenticated Session operations
    async findOne(id: ID, includeRelations?: boolean): Promise<Session | undefined> {
        const result = await this.repository.findOne(id, includeRelations);
        return result as Session | undefined;
    }

    async findByToken(token: string): Promise<Session | undefined> {
        const result = await this.repository.findByToken(token);
        return result as Session | undefined;
    }

    async findByUserId(userId: ID, options?: SessionListOptions): Promise<PaginatedList<Session>> {
        const result = await this.repository.findByUserId(userId, options);
        return result as PaginatedList<Session>;
    }

    async findAll(options: SessionListOptions): Promise<PaginatedList<Session>> {
        const result = await this.repository.findAll(options);
        return result as PaginatedList<Session>;
    }

    async create(data: CreateSessionData): Promise<Session> {
        const sessionData = {
            ...data,
            userId: String(data.userId),
            activeOrderId: data.activeOrderId ? String(data.activeOrderId) : null,
        };
        const result = await this.repository.create(sessionData);
        return result as Session;
    }

    async update(id: ID, data: UpdateSessionData): Promise<Session> {
        const updateData = {
            ...data,
            activeOrderId: data.activeOrderId ? String(data.activeOrderId) : null,
        };
        const result = await this.repository.update(id, updateData);
        return result as Session;
    }

    async delete(id: ID): Promise<void> {
        await this.repository.delete(id);
    }

    async invalidate(id: ID): Promise<Session> {
        const result = await this.repository.invalidate(id);
        return result as Session;
    }

    async deleteExpired(): Promise<number> {
        return this.repository.deleteExpired();
    }

    async countActiveSessionsForUser(userId: ID): Promise<number> {
        return this.repository.countActiveSessionsForUser(userId);
    }

    async findUserSessions(userId: ID, includeRelations?: boolean): Promise<Session[]> {
        const result = await this.repository.findUserSessions(userId, includeRelations);
        return result as Session[];
    }

    // Anonymous Session operations
    async findAnonymousSession(id: ID): Promise<AnonymousSession | undefined> {
        const result = await this.repository.findAnonymousSession(id);
        return result as AnonymousSession | undefined;
    }

    async findAnonymousSessionByToken(token: string): Promise<AnonymousSession | undefined> {
        const result = await this.repository.findAnonymousSessionByToken(token);
        return result as AnonymousSession | undefined;
    }

    async createAnonymousSession(data: CreateAnonymousSessionData): Promise<AnonymousSession> {
        const sessionData = {
            ...data,
            activeOrderId: data.activeOrderId ? String(data.activeOrderId) : null,
        };
        const result = await this.repository.createAnonymousSession(sessionData);
        return result as AnonymousSession;
    }

    async updateAnonymousSession(
        id: ID,
        data: UpdateAnonymousSessionData,
    ): Promise<AnonymousSession> {
        const updateData = {
            ...data,
            activeOrderId: data.activeOrderId ? String(data.activeOrderId) : null,
        };
        const result = await this.repository.updateAnonymousSession(id, updateData);
        return result as AnonymousSession;
    }

    async deleteAnonymousSession(id: ID): Promise<void> {
        await this.repository.deleteAnonymousSession(id);
    }

    async deleteExpiredAnonymousSessions(): Promise<number> {
        return this.repository.deleteExpiredAnonymousSessions();
    }
}
