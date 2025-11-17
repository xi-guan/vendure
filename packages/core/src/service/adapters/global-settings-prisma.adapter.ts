/**
 * @description
 * Prisma implementation of GlobalSettings ORM adapter.
 *
 * @since 3.6.0
 */

import { Injectable } from '@nestjs/common';
import { ID } from '@vendure/common/lib/shared-types';

import { GlobalSettings } from '../../entity/global-settings/global-settings.entity';
import { GlobalSettingsPrismaRepository } from '../repositories/prisma/global-settings-prisma.repository';

import {
    CreateGlobalSettingsData,
    IGlobalSettingsOrmAdapter,
    UpdateGlobalSettingsData,
} from './global-settings-orm.adapter';

@Injectable()
export class GlobalSettingsPrismaAdapter implements IGlobalSettingsOrmAdapter {
    constructor(private readonly repository: GlobalSettingsPrismaRepository) {}

    async find(): Promise<GlobalSettings | undefined> {
        const result = await this.repository.find();
        return result as GlobalSettings | undefined;
    }

    async findOne(id: ID): Promise<GlobalSettings | undefined> {
        const result = await this.repository.findOne(id);
        return result as GlobalSettings | undefined;
    }

    async create(data: CreateGlobalSettingsData): Promise<GlobalSettings> {
        const result = await this.repository.create(data);
        return result as GlobalSettings;
    }

    async update(id: ID, data: UpdateGlobalSettingsData): Promise<GlobalSettings> {
        const result = await this.repository.update(id, data);
        return result as GlobalSettings;
    }

    async upsert(data: CreateGlobalSettingsData): Promise<GlobalSettings> {
        const result = await this.repository.upsert(data);
        return result as GlobalSettings;
    }

    async addLanguage(languageCode: string): Promise<GlobalSettings> {
        const result = await this.repository.addLanguage(languageCode);
        return result as GlobalSettings;
    }

    async removeLanguage(languageCode: string): Promise<GlobalSettings> {
        const result = await this.repository.removeLanguage(languageCode);
        return result as GlobalSettings;
    }

    async isLanguageAvailable(languageCode: string): Promise<boolean> {
        return this.repository.isLanguageAvailable(languageCode);
    }

    async getAvailableLanguages(): Promise<string[]> {
        return this.repository.getAvailableLanguages();
    }

    async setTrackInventory(enabled: boolean): Promise<GlobalSettings> {
        const result = await this.repository.setTrackInventory(enabled);
        return result as GlobalSettings;
    }

    async setOutOfStockThreshold(threshold: number): Promise<GlobalSettings> {
        const result = await this.repository.setOutOfStockThreshold(threshold);
        return result as GlobalSettings;
    }
}
