import { defineConfig } from 'vitest/config';

/**
 * Shared Vitest configuration optimized for performance
 *
 * Key optimizations:
 * 1. Multi-threading with pool options for parallel test execution
 * 2. Reduced isolation overhead for faster test runs
 * 3. Optimized file watching
 * 4. Intelligent test sequencing
 */
export default defineConfig({
  test: {
    // Multi-threading configuration
    pool: 'threads',
    poolOptions: {
      threads: {
        // Enable multi-threading (disable for debugging)
        singleThread: false,

        // Min/max threads based on CPU cores
        // GitHub Actions (2-core): 2-3 threads
        // Local dev (4-8 core): 4-8 threads
        minThreads: 1,
        maxThreads: process.env.CI ? 3 : undefined, // Auto-detect locally

        // Use worker threads for better performance
        useAtomics: true,
      },
    },

    // Reduce isolation overhead (30-40% faster)
    // Tests in same file share setup/teardown
    isolate: false,

    // File watching optimization
    watch: false, // Disable in CI

    // Reporter configuration
    reporters: process.env.CI ? ['default', 'json'] : ['default'],

    // Coverage configuration
    coverage: {
      provider: 'v8', // Faster than istanbul
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'lib/',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/test/**',
        '**/tests/**',
      ],
    },

    // Timeouts
    testTimeout: process.env.CI ? 30000 : 15000,
    hookTimeout: process.env.CI ? 30000 : 15000,

    // Globals (optional, better for migration from Jest)
    globals: false,

    // Retry failed tests in CI
    retry: process.env.CI ? 1 : 0,
  },
});
