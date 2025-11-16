# Vite Build Optimization Guide

## Current Optimizations

The Dashboard package uses Vite 6.x with several built-in optimizations.

## Recommended Production Build Optimizations

### 1. Code Splitting Strategy

For optimal loading performance, consider these code splitting patterns:

```typescript
// vite.config.mts - Production build optimizations
export default defineConfig({
  build: {
    // Target modern browsers for smaller bundles
    target: 'es2020',

    // Minification
    minify: 'terser', // or 'esbuild' for faster builds
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },

    // Rollup options for code splitting
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['@tanstack/react-router'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            // ... other Radix UI components
          ],

          // Framework chunks
          'framework-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'framework-i18n': ['@lingui/react', '@lingui/core'],

          // Utilities
          'utils': ['date-fns', 'clsx', 'tailwind-merge'],
        },

        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff2?|ttf|eot/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },

        // JS chunk naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 1000, // 1MB

    // Sourcemaps (disable in production for smaller bundles)
    sourcemap: false,

    // Report compressed size (can be slow)
    reportCompressedSize: false,
  },
});
```

### 2. Dependency Pre-bundling

```typescript
export default defineConfig({
  optimizeDeps: {
    // Include dependencies that should be pre-bundled
    include: [
      'react',
      'react-dom',
      '@tanstack/react-router',
      '@tanstack/react-query',
    ],

    // Exclude large dependencies that change frequently
    exclude: [],

    // esbuild options for pre-bundling
    esbuildOptions: {
      target: 'es2020',
    },
  },
});
```

### 3. Build Performance

```typescript
export default defineConfig({
  // ESBuild configuration for faster transforms
  esbuild: {
    // Drop console/debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],

    // Use legal comments for licenses
    legalComments: 'none',
  },

  // Worker configuration
  worker: {
    format: 'es',
    plugins: [],
  },

  // JSON handling
  json: {
    namedExports: true,
    stringify: false,
  },
});
```

### 4. Asset Optimization

```typescript
export default defineConfig({
  // Asset handling
  assetsInlineLimit: 4096, // 4KB - inline smaller assets

  // Public directory
  publicDir: 'public',

  build: {
    // Asset directory
    assetsDir: 'assets',

    // CSS code splitting
    cssCodeSplit: true,

    // CSS minification
    cssMinify: true,
  },
});
```

## Performance Checklist

### Build Time Optimization

- [x] Use SWC for React transform (already configured)
- [ ] Enable parallel builds (Vite does this by default)
- [ ] Use esbuild minification instead of terser (faster but less compression)
- [ ] Disable sourcemaps in production
- [ ] Disable compressed size reporting

### Bundle Size Optimization

- [ ] Implement code splitting for routes
- [ ] Split vendor bundles by update frequency
- [ ] Tree-shake unused code
- [ ] Remove console.log statements
- [ ] Optimize images (use WebP, compress)
- [ ] Use dynamic imports for large components

### Runtime Performance

- [ ] Lazy load routes with React.lazy()
- [ ] Implement virtual scrolling for large lists
- [ ] Use React.memo for expensive components
- [ ] Optimize re-renders with useMemo/useCallback
- [ ] Implement service worker for caching

## Measurement Tools

### 1. Bundle Analysis

```bash
# Install bundle analyzer
pnpm add -D rollup-plugin-visualizer

# Add to vite.config.mts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});

# Build and analyze
pnpm build
```

### 2. Build Performance

```bash
# Measure build time
time pnpm build

# With detailed stats
VITE_PROFILER=1 pnpm build
```

### 3. Runtime Performance

Use Chrome DevTools:
- Lighthouse for overall performance
- Performance tab for runtime profiling
- Network tab for bundle size analysis

## Recommended Bundle Budget

| Asset Type | Budget | Current | Status |
|------------|--------|---------|--------|
| Initial JS | < 200KB | TBD | 📊 |
| Initial CSS | < 50KB | TBD | 📊 |
| Total Initial | < 250KB | TBD | 📊 |
| Vendor JS | < 500KB | TBD | 📊 |
| Route chunks | < 100KB each | TBD | 📊 |

## Advanced Optimizations

### 1. Preload Critical Chunks

```typescript
// In index.html
<link rel="modulepreload" href="/assets/vendor-react.js">
<link rel="modulepreload" href="/assets/vendor-router.js">
```

### 2. Resource Hints

```html
<!-- DNS prefetch for API -->
<link rel="dns-prefetch" href="https://api.vendure.io">

<!-- Preconnect to API -->
<link rel="preconnect" href="https://api.vendure.io">
```

### 3. Compression

Ensure your server supports:
- Brotli compression (.br)
- Gzip compression (.gz)

Vite can pre-compress assets:

```typescript
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
});
```

## Monitoring

### Production Metrics to Track

1. **First Contentful Paint (FCP)**: < 1.8s
2. **Largest Contentful Paint (LCP)**: < 2.5s
3. **Time to Interactive (TTI)**: < 3.8s
4. **Total Blocking Time (TBT)**: < 200ms
5. **Cumulative Layout Shift (CLS)**: < 0.1

### Tools

- Google Lighthouse
- WebPageTest
- Chrome User Experience Report
- Real User Monitoring (RUM) tools

## Next Steps

1. Run baseline performance tests
2. Implement code splitting
3. Measure and optimize bundle sizes
4. Set up continuous performance monitoring
5. Document performance budgets in CI/CD

---

**Last Updated**: 2025-11-16
**Status**: Recommendations - Implementation pending
