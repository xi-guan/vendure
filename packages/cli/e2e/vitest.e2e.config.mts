import path from 'path';
import { fileURLToPath } from 'url';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    root: __dirname,
    plugins: [
        // SWC required to support decorators used in test plugins
        swc.vite({
            jsc: {
                transform: {
                    useDefineForClassFields: false,
                },
            },
        }) as any,
    ],
    test: {
        include: ['**/*.e2e-spec.ts'],
        globals: true,
        environment: 'node',
        testTimeout: 60000,
        pool: 'forks',
        poolOptions: {
            forks: {
                singleFork: true,
            },
        },
        typecheck: {
            tsconfig: path.join(__dirname, 'config/tsconfig.e2e.json'),
        },
        env: {
            PACKAGE: 'cli',
        },
    },
});