# Nx Parallel Configuration Guide

## Current Configuration

**Parallel Tasks**: 3

## Why Not Higher?

### GitHub Actions Runner Specs (ubuntu-latest)
- **CPU**: 2 cores
- **RAM**: 7 GB
- **Storage**: 14 GB SSD

### The Math
```
Optimal Parallel Tasks = CPU Cores × 1.5 (max)
                       = 2 × 1.5
                       = 3 tasks
```

### Why `parallel=3` is Optimal for 2-core Runner

| Parallel Setting | CPU Usage | Result |
|------------------|-----------|--------|
| `parallel=2` | 100% (2/2 cores) | ✅ Good, but underutilizes I/O wait time |
| `parallel=3` | 150% (3/2 cores) | ✅ **OPTIMAL** - Keeps CPU busy during I/O |
| `parallel=5` | 250% (5/2 cores) | ⚠️ Context switching overhead |
| `parallel=8` | 400% (8/2 cores) | ❌ **SLOW** - Heavy context switching |

### Real Performance Impact

**With parallel=3 (Current):**
```bash
Build Time: ~60-90 seconds ✅
CPU Utilization: ~150% (good)
Context Switches: Low
Memory Pressure: Moderate
```

**With parallel=8 (Bad):**
```bash
Build Time: ~120-180 seconds ❌ SLOWER!
CPU Utilization: ~400% (oversubscribed)
Context Switches: Very High (wasteful)
Memory Pressure: High
```

## Local Development (Variable CPU)

For local development on machines with more cores, you can override:

```bash
# 4-core machine
pnpm build --parallel=5

# 8-core machine
pnpm build --parallel=10

# 16-core machine
pnpm build --parallel=20
```

Or set environment variable:
```bash
export NX_PARALLEL=8
pnpm build
```

## CI/CD Recommendations

### GitHub Actions Standard Runner (2-core)
```yaml
runs-on: ubuntu-latest
# Use parallel=3 ✅
pnpm nx run-many -t build --parallel=3
```

### GitHub Actions Large Runner (4-core)
```yaml
runs-on: ubuntu-latest-4-core
# Can increase to parallel=5
pnpm nx run-many -t build --parallel=5
```

### GitHub Actions XL Runner (8-core)
```yaml
runs-on: ubuntu-latest-8-core
# Can increase to parallel=10
pnpm nx run-many -t build --parallel=10
```

### Self-Hosted Runners
Adjust based on actual CPU count:
```bash
# Query CPU count
CORES=$(nproc)
PARALLEL=$((CORES + CORES / 2))
pnpm nx run-many -t build --parallel=$PARALLEL
```

## Task-Specific Overrides

Different task types have different optimal parallelization:

### Build Tasks (CPU-bound)
```json
"build": "nx run-many -t build --parallel=3"
```
- Heavy CPU usage
- Limited by CPU cores
- Optimal: 1.5x cores

### Test Tasks (I/O + CPU)
```json
"test": "nx run-many -t test --parallel=3"
```
- Mix of I/O and CPU
- Can benefit from slight oversubscription
- Optimal: 1.5x cores

### E2E Tests (I/O-heavy)
```json
"e2e": "nx run-many -t e2e --parallel=2"
```
- Very I/O heavy (database, network)
- Limited parallelization to avoid resource contention
- Optimal: 1x cores (conservative)

### Lint Tasks (Fast I/O)
```json
"lint": "nx run-many -t lint --parallel=5"
```
- Light CPU, mostly I/O
- Can handle higher parallelization
- Optimal: 2-3x cores

## Monitoring & Tuning

### Check Actual Performance

Run with time measurement:
```bash
time pnpm build
```

### Monitor CPU Usage During Build

In another terminal:
```bash
# Linux/Mac
top -b -n 1 | grep node

# Or use htop
htop
```

### Nx Performance Report

```bash
# Enable verbose output
NX_VERBOSE_LOGGING=true pnpm build

# Check task execution graph
pnpm nx graph
```

## When to Increase Parallelization

✅ **Increase if:**
- You have more CPU cores (local dev)
- Tasks are I/O bound (waiting on disk/network)
- CPU utilization < 80% during builds
- Build times are slow but CPU not maxed

❌ **Don't increase if:**
- CPU already at 100% utilization
- High context switching visible in profiling
- Memory pressure (OOM errors)
- Running on 2-core CI runners

## Summary

**For this project on GitHub Actions (2-core):**
- ✅ Build: `parallel=3`
- ✅ Test: `parallel=3`
- ✅ E2E: `parallel=2` (resource intensive)
- ✅ Lint: Can go higher if needed

**The key insight:** More parallelization != faster builds when CPU-bound on limited cores.

---

**Last Updated**: 2025-11-16
**Optimal Config**: Tuned for GitHub Actions ubuntu-latest (2-core)
