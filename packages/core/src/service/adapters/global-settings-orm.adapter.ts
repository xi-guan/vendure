/**
 * @description
 * Adapter layer for GlobalSettings ORM operations.
 * Provides a unified interface that can be implemented by both TypeORM and Prisma.
 *
 * @since 3.6.0
 */

import { ID } from '@vendure/common/lib/shared-types';

import { GlobalSettings } from '../../entity/global-settings/global-settings.entity';

export interface CreateGlobalSettingsData {
    availableLanguages: string[];
    trackInventory?: boolean;
    outOfStockThreshold?: number;
    customFields?: any;
}

export interface UpdateGlobalSettingsData {
    availableLanguages?: string[];
    trackInventory?: boolean;
    outOfStockThreshold?: number;
    customFields?: any;
}

/**
 * ORM-agnostic interface for GlobalSettings operations
 */
export interface IGlobalSettingsOrmAdapter {
    /**
     * Find the global settings (singleton)
     */
    find(): Promise<GlobalSettings | undefined>;

    /**
     * Find global settings by ID
     */
    findOne(id: ID): Promise<GlobalSettings | undefined>;

    /**
     * Create global settings
     */
    create(data: CreateGlobalSettingsData): Promise<GlobalSettings>;

    /**
     * Update global settings
     */
    update(id: ID, data: UpdateGlobalSettingsData): Promise<GlobalSettings>;

    /**
     * Upsert global settings
     */
    upsert(data: CreateGlobalSettingsData): Promise<GlobalSettings>;

    /**
     * Add a language to available languages
     */
    addLanguage(languageCode: string): Promise<GlobalSettings>;

    /**
     * Remove a language from available languages
     */
    removeLanguage(languageCode: string): Promise<GlobalSettings>;

    /**
     * Check if a language is available
     */
    isLanguageAvailable(languageCode: string): Promise<boolean>;

    /**
     * Get all available languages
     */
    getAvailableLanguages(): Promise<string[]>;

    /**
     * Set inventory tracking enabled/disabled
     */
    setTrackInventory(enabled: boolean): Promise<GlobalSettings>;

    /**
     * Set out of stock threshold
     */
    setOutOfStockThreshold(threshold: number): Promise<GlobalSettings>;
}
