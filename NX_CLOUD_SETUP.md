# Nx Cloud Configuration Guide

## Quick Start (5 minutes)

### Step 1: Sign Up & Get Token

1. Visit https://cloud.nx.app
2. Sign up with GitHub account
3. Create a workspace (name it "vendure")
4. Copy your access token

### Step 2: Add Token to Project

**Option A: Environment Variable (Recommended for local testing)**

```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)
export NX_CLOUD_ACCESS_TOKEN="your-token-here"

# Or use direnv (.envrc)
echo 'export NX_CLOUD_ACCESS_TOKEN="your-token-here"' > .envrc
direnv allow
```

**Option B: nx.json (Permanent setup)**

```json
// nx.json
{
  // ... existing config
  "nxCloudAccessToken": "your-token-here"
}
```

**Option C: GitHub Secrets (For CI/CD)**

```bash
# GitHub repository → Settings → Secrets → New secret
# Name: NX_CLOUD_ACCESS_TOKEN
# Value: your-token-here
```

### Step 3: Test It Works

```bash
# Clear local cache
pnpm nx reset

# Build with Nx Cloud (first run)
pnpm build
# You should see: "Nx Cloud: Run details at https://cloud.nx.app/runs/..."

# Build again (should hit cache)
pnpm build
# You should see: "[remote cache] ... task retrieved from cache"
```

---

## Detailed Configuration

### 1. nx.json Configuration

```json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",

  // Add your access token (or use environment variable)
  "nxCloudAccessToken": "YOUR_TOKEN_HERE",

  // Nx Cloud specific options
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx-cloud",
      "options": {
        "cacheableOperations": ["build", "test", "lint", "e2e"],
        "parallel": 3,
        "maxParallel": 3,
        "cacheDirectory": ".nx/cache",
        "runtimeCacheInputs": ["node -v"],

        // Nx Cloud specific
        "accessToken": "${NX_CLOUD_ACCESS_TOKEN}",
        "url": "https://cloud.nx.app",
        "encryptionKey": "your-encryption-key" // Optional: for extra security
      }
    }
  }
}
```

### 2. GitHub Actions Integration

Update `.github/workflows/build_and_test.yml`:

```yaml
name: Build & Test
on:
  pull_request:
  push:
    branches:
      - master

env:
  CI: true
  # Add Nx Cloud token from secrets
  NX_CLOUD_ACCESS_TOKEN: ${{ secrets.NX_CLOUD_ACCESS_TOKEN }}

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Important for Nx affected commands

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22.x
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build with Nx Cloud
        run: pnpm nx affected -t build --base=origin/master --head=HEAD
        # Nx Cloud automatically caches and retrieves results

      - name: Test with Nx Cloud
        run: pnpm nx affected -t test --base=origin/master --head=HEAD
```

### 3. .gitignore Updates

Ensure Nx Cloud files are ignored:

```bash
# .gitignore
.nx/cache
.nx/workspace-data
```

### 4. Environment Variables (.env)

Create `.env.local` (add to .gitignore):

```bash
# Nx Cloud Configuration
NX_CLOUD_ACCESS_TOKEN=your-token-here

# Optional: Enable verbose logging
NX_CLOUD_DEBUG=true

# Optional: Disable for testing
NX_CLOUD_NO_TIMEOUTS=true
```

---

## Verification Steps

### 1. Check Connection

```bash
# Test Nx Cloud connection
pnpm nx connect

# Should output: "Successfully connected to Nx Cloud"
```

### 2. Verify Cache Upload

```bash
# Clear cache
pnpm nx reset

# Build (will upload to cloud)
pnpm build

# Check output for:
# ✓ "Nx Cloud: Run details at https://cloud.nx.app/runs/..."
# ✓ Upload stats
```

### 3. Verify Cache Download

```bash
# Clear local cache again
pnpm nx reset

# Build again (should download from cloud)
pnpm build

# Check output for:
# ✓ "[remote cache] ..." messages
# ✓ Much faster execution time
```

### 4. View Dashboard

Visit https://cloud.nx.app to see:
- Run history
- Cache hit rates
- Task execution times
- Workspace insights

---

## Advanced Configuration

### 1. Selective Task Caching

Only cache specific tasks:

```json
{
  "tasksRunnerOptions": {
    "default": {
      "options": {
        "cacheableOperations": [
          "build",    // Always cache builds
          "test",     // Always cache tests
          "lint"      // Always cache linting
          // "e2e"    // Don't cache e2e (too flaky)
        ]
      }
    }
  }
}
```

### 2. Encryption Key (Enterprise)

For sensitive code:

```bash
# Generate encryption key
npx nx-cloud generate-encryption-key

# Add to nx.json
{
  "tasksRunnerOptions": {
    "default": {
      "options": {
        "encryptionKey": "YOUR_ENCRYPTION_KEY"
      }
    }
  }
}
```

### 3. Custom Cache Directory

For CI optimization:

```json
{
  "tasksRunnerOptions": {
    "default": {
      "options": {
        "cacheDirectory": "/tmp/nx-cache"  // Faster on some CI systems
      }
    }
  }
}
```

### 4. Distributed Task Execution (DTE)

For Pro/Enterprise plans:

```yaml
# .github/workflows/build_and_test.yml
jobs:
  agents:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        agent: [1, 2, 3]  # 3 parallel agents
    steps:
      - run: pnpm nx-cloud start-agent

  main:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm nx-cloud start-ci-run
      - run: pnpm nx affected -t build test --parallel=3
      - run: pnpm nx-cloud stop-all-agents
```

---

## Troubleshooting

### Issue 1: Token Not Working

```bash
# Verify token is set
echo $NX_CLOUD_ACCESS_TOKEN

# Test connection
pnpm nx connect

# Check nx.json syntax
cat nx.json | jq .nxCloudAccessToken
```

### Issue 2: Cache Not Hitting

```bash
# Enable debug logging
export NX_CLOUD_DEBUG=true
pnpm build

# Check cache inputs
pnpm nx show project @vendure/core --web
```

### Issue 3: Slow Upload/Download

```bash
# Check network
ping cloud.nx.app

# Verify cache size
du -sh .nx/cache

# Clear and rebuild
pnpm nx reset && pnpm build
```

### Issue 4: CI Not Using Cache

```yaml
# Ensure secrets are set
env:
  NX_CLOUD_ACCESS_TOKEN: ${{ secrets.NX_CLOUD_ACCESS_TOKEN }}

# Verify in CI logs
- run: echo "Token length: ${#NX_CLOUD_ACCESS_TOKEN}"
```

---

## Performance Monitoring

### 1. Dashboard Metrics

Visit https://cloud.nx.app/orgs/[your-org]/workspaces/[workspace]

Monitor:
- **Cache hit rate** (target: >70%)
- **Average task duration** (trending down)
- **Parallel efficiency** (utilizing all cores)
- **Remote cache savings** (time/cost saved)

### 2. Local Metrics

```bash
# View task stats
pnpm nx graph

# Show cache info
pnpm nx show project @vendure/core

# View run details
pnpm nx run-many -t build --verbose
```

### 3. CI/CD Metrics

Track in GitHub Actions:
- Job duration (before/after)
- Cache hit rate per PR
- Build time trends

---

## Cost Optimization

### Free Tier Limits

- 500 tasks/month
- Good for: 1-2 developers, hobby projects
- Monitor usage at: https://cloud.nx.app/billing

### Staying Within Free Tier

```bash
# Disable Nx Cloud for certain tasks
NX_CLOUD_NO_CACHE=true pnpm build

# Only use for main branch
if: github.ref == 'refs/heads/master'
  env:
    NX_CLOUD_ACCESS_TOKEN: ${{ secrets.NX_CLOUD_ACCESS_TOKEN }}
```

### Upgrade Decision Points

Upgrade when:
- Hitting 500 task limit monthly
- Team grows to 3+ developers
- Need >70% cache hit rate
- Want distributed task execution

---

## Security Best Practices

### 1. Token Management

```bash
# NEVER commit tokens to git
echo "NX_CLOUD_ACCESS_TOKEN=*" >> .gitignore

# Rotate tokens regularly
# Dashboard → Settings → Access Tokens → Regenerate

# Use different tokens for CI vs local
# Local: Personal access token
# CI: Workspace access token
```

### 2. Access Control

- Use **workspace tokens** for CI (limited scope)
- Use **personal tokens** for local dev (full access)
- Revoke tokens when team members leave
- Enable 2FA on Nx Cloud account

### 3. Data Privacy

- Nx Cloud only stores:
  - File hashes (not content)
  - Task outputs (build artifacts)
  - Metadata (timings, dependencies)
- Enable encryption for sensitive workspaces
- Review privacy policy: https://nx.app/privacy

---

## Migration from Local Cache

### Step 1: Baseline Performance

```bash
# Measure current performance
time pnpm build  # Record time
time pnpm test   # Record time
```

### Step 2: Enable Nx Cloud

```bash
# Add token
export NX_CLOUD_ACCESS_TOKEN="your-token"

# Build (populate cache)
pnpm build
```

### Step 3: Compare Performance

```bash
# Clear local cache
pnpm nx reset

# Build again (use remote cache)
time pnpm build  # Should be much faster

# Calculate improvement
# Before: 120s
# After: 15s
# Improvement: 87.5%
```

### Step 4: Roll Out to Team

1. Add secret to GitHub
2. Update CI workflow
3. Share token with team
4. Monitor dashboard

---

## Rollback Plan

If Nx Cloud doesn't work out:

### 1. Disable Nx Cloud

```json
// nx.json - Remove or comment out
{
  // "nxCloudAccessToken": "...",  // Disabled
}
```

### 2. Use Local Cache Only

```bash
# Remove environment variable
unset NX_CLOUD_ACCESS_TOKEN

# Builds will use local cache only
pnpm build
```

### 3. Switch to Alternative

Use GitHub Actions cache:

```yaml
- uses: actions/cache@v4
  with:
    path: .nx/cache
    key: nx-${{ hashFiles('pnpm-lock.yaml') }}
```

---

## Summary Checklist

- [ ] Sign up at https://cloud.nx.app
- [ ] Get access token
- [ ] Add token to environment or nx.json
- [ ] Test locally with `pnpm build` (2x)
- [ ] Add GitHub secret `NX_CLOUD_ACCESS_TOKEN`
- [ ] Update CI workflow to use token
- [ ] Monitor dashboard for cache hits
- [ ] Measure time savings
- [ ] Decide on plan (free/starter/pro)

---

**Next Steps:**
1. Start with free tier
2. Monitor for 1 week
3. Measure actual ROI
4. Upgrade if beneficial

**Support:**
- Docs: https://nx.dev/nx-cloud
- Discord: https://discord.gg/nx
- GitHub: https://github.com/nrwl/nx

---

**Last Updated:** 2025-11-16
**Status:** Configuration guide ready for implementation
