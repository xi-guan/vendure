#!/usr/bin/env node
const { execSync } = require('child_process');
const { performance } = require('perf_hooks');

function runTest(command, name) {
    console.log(`\n=== ${name} ===`);
    const start = performance.now();
    try {
        execSync(command, { stdio: 'pipe', cwd: __dirname });
    } catch (e) {
        // Ignore formatting errors, we only care about time
    }
    const end = performance.now();
    const duration = ((end - start) / 1000).toFixed(2);
    console.log(`Time: ${duration}s`);
    return { name, duration: parseFloat(duration) };
}

const results = [];

// Test Prettier
results.push(runTest(
    'npx prettier --check "packages/**/*.{ts,tsx,js,jsx}" --ignore-unknown',
    'Prettier'
));

// Test Biome
results.push(runTest(
    'npx @biomejs/biome check --diagnostic-level=error packages/',
    'Biome'
));

// Summary
console.log('\n=== Performance Comparison ===');
console.log(`Prettier: ${results[0].duration}s`);
console.log(`Biome:    ${results[1].duration}s`);
const speedup = (results[0].duration / results[1].duration).toFixed(2);
console.log(`\nBiome is ${speedup}x faster than Prettier`);
const improvement = (((results[0].duration - results[1].duration) / results[0].duration) * 100).toFixed(1);
console.log(`Performance improvement: ${improvement}%`);
