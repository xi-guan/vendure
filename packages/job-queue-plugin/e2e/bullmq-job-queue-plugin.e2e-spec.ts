import { DefaultLogger, LogLevel, mergeConfig } from '@vendure/core';
import { createTestEnvironment } from '@vendure/testing';
import { RedisConnection } from 'bullmq';
import path from 'path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { initialData } from '../../../e2e-common/e2e-initial-data';
import { testConfig, TEST_SETUP_TIMEOUT_MS } from '../../../e2e-common/test-config';
import { awaitRunningJobs } from '../../core/e2e/utils/await-running-jobs';
import { BullMQJobQueuePlugin } from '../src/bullmq/plugin';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Redis = require('ioredis');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { redisHost, redisPort } = require('./constants');

// TODO: How to solve issues with Jest open handles after test suite finishes?
// See https://github.com/luin/ioredis/issues/1088

describe('BullMQJobQueuePlugin', () => {
    const redisConnection: any = new Redis({
        host: redisHost,
        port: redisPort,
        maxRetriesPerRequest: null,
        retryStrategy: (times: number) => {
            // Retry connection with exponential backoff, max 3 seconds
            return Math.min(times * 100, 3000);
        },
    });

    const { server, adminClient, shopClient } = createTestEnvironment(
        mergeConfig(testConfig(), {
            apiOptions: {
                port: 4050,
            },
            logger: new DefaultLogger({ level: LogLevel.Info }),
            plugins: [
                BullMQJobQueuePlugin.init({
                    connection: redisConnection,
                    workerOptions: {
                        prefix: 'e2e',
                    },
                    queueOptions: {
                        prefix: 'e2e',
                    },
                }),
            ],
        }),
    );

    beforeAll(async () => {
        await server.init({
            initialData,
            productsCsvPath: path.join(__dirname, 'fixtures/e2e-products-minimal.csv'),
            customerCount: 1,
        });
        await adminClient.asSuperAdmin();
    }, TEST_SETUP_TIMEOUT_MS);

    afterAll(async () => {
        await awaitRunningJobs(adminClient);
        await server.destroy();
        // Properly close Redis connection
        await redisConnection.quit();
        // redis.quit() creates a thread to close the connection.
        // We wait until all threads have been run once to ensure the connection closes.
        // See https://stackoverflow.com/a/54560610/772859
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('works', () => {
        expect(1).toBe(1);
    });
});
