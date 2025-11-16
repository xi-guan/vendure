#!/bin/bash

# Performance Benchmark Script for Vendure
# Measures build times, test times, and provides comparison data

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RUNS=3
RESULTS_DIR="./benchmark-results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_FILE="$RESULTS_DIR/benchmark_$TIMESTAMP.json"

# Create results directory
mkdir -p "$RESULTS_DIR"

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}Vendure Performance Benchmark${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Function to measure time
measure_time() {
    local command="$1"
    local description="$2"
    local total_time=0

    echo -e "${YELLOW}Benchmarking: $description${NC}"

    for i in $(seq 1 $RUNS); do
        echo -e "  Run $i/$RUNS..."

        # Clear caches
        pnpm nx reset > /dev/null 2>&1

        # Measure execution time
        start_time=$(date +%s%N)
        eval "$command" > /dev/null 2>&1
        end_time=$(date +%s%N)

        # Calculate duration in milliseconds
        duration=$(( (end_time - start_time) / 1000000 ))
        total_time=$((total_time + duration))

        echo -e "    Time: ${duration}ms"
    done

    # Calculate average
    avg_time=$((total_time / RUNS))
    echo -e "${GREEN}  Average: ${avg_time}ms${NC}"
    echo ""

    # Return average time
    echo "$avg_time"
}

# Initialize results JSON
cat > "$RESULTS_FILE" <<EOF
{
  "timestamp": "$TIMESTAMP",
  "runs": $RUNS,
  "system": {
    "node_version": "$(node --version)",
    "pnpm_version": "$(pnpm --version)",
    "os": "$(uname -s)",
    "cpu_cores": "$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 'unknown')"
  },
  "benchmarks": {}
}
EOF

# Benchmark 1: Clean install
echo -e "${BLUE}1. Dependency Installation${NC}"
rm -rf node_modules .pnpm-store
install_time=$(measure_time "pnpm install --frozen-lockfile" "pnpm install")

# Benchmark 2: Build (cold cache)
echo -e "${BLUE}2. Clean Build (Cold Cache)${NC}"
pnpm nx reset
cold_build_time=$(measure_time "pnpm build" "Clean build")

# Benchmark 3: Build (warm cache)
echo -e "${BLUE}3. Rebuild (Warm Cache)${NC}"
warm_build_time=$(measure_time "pnpm build" "Cached build")

# Benchmark 4: Core package build
echo -e "${BLUE}4. Core Package Build${NC}"
core_build_time=$(measure_time "pnpm nx build @vendure/core" "Core package build")

# Benchmark 5: Unit tests
echo -e "${BLUE}5. Unit Tests${NC}"
test_time=$(measure_time "pnpm nx run @vendure/core:test" "Core unit tests")

# Benchmark 6: Lint
echo -e "${BLUE}6. Linting${NC}"
lint_time=$(measure_time "pnpm nx run @vendure/core:lint" "Core linting")

# Update results JSON
cat > "$RESULTS_FILE" <<EOF
{
  "timestamp": "$TIMESTAMP",
  "runs": $RUNS,
  "system": {
    "node_version": "$(node --version)",
    "pnpm_version": "$(pnpm --version)",
    "os": "$(uname -s)",
    "cpu_cores": "$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 'unknown')"
  },
  "benchmarks": {
    "install": ${install_time},
    "build_cold": ${cold_build_time},
    "build_warm": ${warm_build_time},
    "build_core": ${core_build_time},
    "test_unit": ${test_time},
    "lint": ${lint_time}
  }
}
EOF

# Summary
echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}Benchmark Summary${NC}"
echo -e "${BLUE}=====================================${NC}"
echo -e "Install time:        ${install_time}ms"
echo -e "Cold build:          ${cold_build_time}ms"
echo -e "Warm build:          ${warm_build_time}ms"
echo -e "Core build:          ${core_build_time}ms"
echo -e "Unit tests:          ${test_time}ms"
echo -e "Lint:                ${lint_time}ms"
echo ""
echo -e "${GREEN}Results saved to: $RESULTS_FILE${NC}"

# Calculate cache effectiveness
if [ "$cold_build_time" -gt 0 ]; then
    cache_improvement=$(( (cold_build_time - warm_build_time) * 100 / cold_build_time ))
    echo -e "Cache improvement:   ${cache_improvement}%"
fi

# Compare with baseline if exists
BASELINE_FILE="$RESULTS_DIR/baseline.json"
if [ -f "$BASELINE_FILE" ]; then
    echo ""
    echo -e "${YELLOW}Comparing with baseline...${NC}"

    baseline_cold=$(cat "$BASELINE_FILE" | grep -o '"build_cold": [0-9]*' | grep -o '[0-9]*')
    if [ -n "$baseline_cold" ]; then
        improvement=$(( (baseline_cold - cold_build_time) * 100 / baseline_cold ))
        if [ "$improvement" -gt 0 ]; then
            echo -e "Build improvement:   ${GREEN}+${improvement}% faster${NC}"
        else
            echo -e "Build change:        ${RED}${improvement}% slower${NC}"
        fi
    fi
else
    echo ""
    echo -e "${YELLOW}Creating baseline...${NC}"
    cp "$RESULTS_FILE" "$BASELINE_FILE"
    echo -e "Baseline saved to: $BASELINE_FILE"
    echo -e "Run this script again to compare performance."
fi

echo ""
echo -e "${BLUE}=====================================${NC}"
echo -e "${GREEN}Benchmark complete!${NC}"
echo -e "${BLUE}=====================================${NC}"
