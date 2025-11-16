import path from 'path';
import swc from 'unplugin-swc';
import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.base.mts';

export default mergeConfig(
    baseConfig,
    defineConfig({
        test: {
            typecheck: {
                tsconfig: path.join(__dirname, 'tsconfig.e2e.json'),
            },
        },
        plugins: [
            // SWC required to support decorators used in test plugins
            // See https://github.com/vitest-dev/vitest/issues/708#issuecomment-1118628479
            // Vite plugin
            swc.vite(),
            // Rollup plugin
            swc.rollup() as any,
        ],
    })
);

