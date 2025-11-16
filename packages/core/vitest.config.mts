import { mergeConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.base.mts';

export default mergeConfig(
    baseConfig,
    defineConfig({
        test: {
            // Override for unit tests (faster than e2e)
            testTimeout: process.env.CI ? 20000 : 10000,
        },
        plugins: [
            // SWC required to support decorators used in test plugins
            // See https://github.com/vitest-dev/vitest/issues/708#issuecomment-1118628479
            // Vite plugin
            swc.vite({
                jsc: {
                    transform: {
                        // See https://github.com/vendure-ecommerce/vendure/issues/2099
                        useDefineForClassFields: false,
                    },
                },
            }),
        ],
    })
);

