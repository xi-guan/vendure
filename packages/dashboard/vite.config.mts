import path from 'path';
import { pathToFileURL } from 'url';
import { loadEnv, Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { vendureDashboardPlugin } from './vite/vite-plugin-vendure-dashboard.js';

/**
 * Mock plugin to provide virtual:admin-api-schema during tests
 */
function mockAdminApiSchemaPlugin(): Plugin {
    const virtualModuleId = 'virtual:admin-api-schema';
    const resolvedVirtualModuleId = `\0${virtualModuleId}`;

    return {
        name: 'vendure:mock-admin-api-schema',
        resolveId(id) {
            if (id === virtualModuleId) {
                return resolvedVirtualModuleId;
            }
        },
        load(id) {
            if (id === resolvedVirtualModuleId) {
                // Return the mock schema info from testing-utils
                return `
                    import { getMockSchemaInfo } from './src/lib/framework/document-introspection/testing-utils.js';
                    export const schemaInfo = getMockSchemaInfo().schemaInfo;
                `;
            }
        },
    };
}

/**
 * This config is used for local development
 */
export default ({ mode }: { mode: string }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

    const adminApiHost = process.env.VITE_ADMIN_API_HOST ?? 'http://localhost';
    const adminApiPort = process.env.VITE_ADMIN_API_PORT ? +process.env.VITE_ADMIN_API_PORT : 'auto';

    process.env.IS_LOCAL_DEV = adminApiHost.includes('localhost') ? 'true' : 'false';

    const vendureConfigPath = process.env.VITEST
        ? // This should always be used for running the tests
          './sample-vendure-config.ts'
        : // This one might be changed to '../dev-server/dev-config.ts' to test ui extensions
          './sample-vendure-config.ts';

    return defineConfig({
        test: {
            globals: true,
            environment: 'jsdom',
            exclude: ['./plugin/**/*', '**/node_modules/**/*'],
        },
        plugins: [
            // Add mock plugin for tests before the main plugin
            ...(process.env.VITEST ? [mockAdminApiSchemaPlugin()] : []),
            vendureDashboardPlugin({
                vendureConfigPath: pathToFileURL(vendureConfigPath),
                api: { host: adminApiHost, port: adminApiPort },
                tempCompilationDir: path.resolve(__dirname, './.temp'),
                disablePlugins: {
                    // Disable plugins that might cause issues in test environment
                    ...(process.env.VITEST
                        ? {
                              react: true,
                              lingui: true,
                              tanstackRouter: true,
                              adminApiSchema: true,
                              dashboardMetadata: true,
                              gqlTada: true,
                              hmr: true,
                          }
                        : {}),
                },
            }) as any,
        ],
    });
};
