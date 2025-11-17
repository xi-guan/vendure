#!/usr/bin/env node

/**
 * Sass @import to @use Migration Script
 *
 * This script automatically converts deprecated @import statements to @use
 * for Dart Sass 3.0.0 compatibility.
 *
 * Usage:
 *   node scripts/migrate-sass-imports.js [--dry-run] [--path=packages/admin-ui]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const pathArg = args.find(arg => arg.startsWith('--path='));
const targetPath = pathArg ? pathArg.split('=')[1] : 'packages/admin-ui';

console.log('=====================================');
console.log('Sass @import to @use Migration Tool');
console.log('=====================================\n');

if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
}

// Common import patterns to migrate
const IMPORT_MAPPINGS = {
    "'variables'": "'../../static/styles/variables'",
    '"variables"': '"../../static/styles/variables"',
    "'mixins'": "'../../static/styles/mixins'",
    '"mixins"': '"../../static/styles/mixins"',
    './base-code-editor': './base-code-editor',
    '../order-table/order-table-mixin': '../order-table/order-table-mixin',
};

// Find all SCSS files
function findScssFiles(dir) {
    const files = [];

    function walk(directory) {
        const items = fs.readdirSync(directory);

        for (const item of items) {
            const fullPath = path.join(directory, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                // Skip node_modules and dist
                if (item !== 'node_modules' && item !== 'dist' && item !== 'package') {
                    walk(fullPath);
                }
            } else if (item.endsWith('.scss')) {
                files.push(fullPath);
            }
        }
    }

    walk(dir);
    return files;
}

// Convert @import to @use
function convertImportToUse(content, filePath) {
    let modified = false;
    let newContent = content;
    const lines = content.split('\n');
    const newLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Match @import statements
        if (trimmed.startsWith('@import')) {
            const match = trimmed.match(/@import\s+['"](.+?)['"]/);

            if (match) {
                const importPath = match[1];
                let usePath = importPath;

                // Handle relative paths
                if (!importPath.startsWith('./') && !importPath.startsWith('../')) {
                    // Try to resolve common paths
                    if (importPath === 'variables' || importPath === 'mixins') {
                        // Calculate relative path to static/styles
                        const fileDir = path.dirname(filePath);
                        const staticStylesPath = path.join(process.cwd(), targetPath, 'src/lib/static/styles');
                        const relativePath = path.relative(fileDir, staticStylesPath);
                        usePath = path.join(relativePath, importPath).replace(/\\/g, '/');

                        if (!usePath.startsWith('.')) {
                            usePath = './' + usePath;
                        }
                    }
                }

                // Remove file extension if present
                usePath = usePath.replace(/\.scss$/, '');

                // Convert to @use with namespace
                const namespace = path.basename(usePath).replace(/[^a-zA-Z0-9]/g, '-');
                const newLine = line.replace(
                    /@import\s+['"](.+?)['"]/,
                    `@use '${usePath}' as ${namespace}`
                );

                newLines.push(newLine);
                modified = true;

                console.log(`  📝 ${path.relative(process.cwd(), filePath)}`);
                console.log(`     - @import '${importPath}'`);
                console.log(`     + @use '${usePath}' as ${namespace}`);
            } else {
                newLines.push(line);
            }
        } else {
            newLines.push(line);
        }
    }

    return {
        content: newLines.join('\n'),
        modified
    };
}

// Main migration function
function migrateFiles() {
    const targetDir = path.join(process.cwd(), targetPath);

    if (!fs.existsSync(targetDir)) {
        console.error(`❌ Error: Directory not found: ${targetDir}`);
        process.exit(1);
    }

    console.log(`📁 Scanning directory: ${targetPath}\n`);

    const scssFiles = findScssFiles(targetDir);
    console.log(`📊 Found ${scssFiles.length} SCSS files\n`);

    if (scssFiles.length === 0) {
        console.log('No SCSS files found.');
        return;
    }

    let modifiedCount = 0;

    console.log('🔄 Processing files...\n');

    for (const file of scssFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const result = convertImportToUse(content, file);

        if (result.modified) {
            modifiedCount++;

            if (!isDryRun) {
                fs.writeFileSync(file, result.content, 'utf8');
            }
        }
    }

    console.log('\n=====================================');
    if (isDryRun) {
        console.log(`✅ Dry run complete`);
        console.log(`📊 Would modify ${modifiedCount} files`);
    } else {
        console.log(`✅ Migration complete`);
        console.log(`📊 Modified ${modifiedCount} files`);
    }
    console.log('=====================================\n');

    if (!isDryRun && modifiedCount > 0) {
        console.log('Next steps:');
        console.log('1. Review changes: git diff');
        console.log('2. Test the build: npm run build');
        console.log('3. Fix any remaining issues manually');
        console.log('4. Commit: git add -A && git commit -m "refactor: Migrate Sass @import to @use"\n');
    }
}

// Alternative: Use official sass-migrator
function useSassMigrator() {
    console.log('🔧 Using official sass-migrator tool...\n');

    try {
        // Check if sass-migrator is installed
        execSync('sass-migrator --version', { stdio: 'ignore' });
    } catch (e) {
        console.log('📦 Installing sass-migrator...\n');
        try {
            execSync('npm install -g sass-migrator', { stdio: 'inherit' });
        } catch (installError) {
            console.error('❌ Failed to install sass-migrator');
            console.error('   Please install manually: npm install -g sass-migrator\n');
            return false;
        }
    }

    try {
        const command = `sass-migrator module --migrate-deps ${targetPath}/src/**/*.scss`;
        console.log(`Running: ${command}\n`);

        execSync(command, { stdio: 'inherit', cwd: process.cwd() });

        console.log('\n✅ sass-migrator completed successfully!\n');
        return true;
    } catch (error) {
        console.error('❌ sass-migrator failed');
        console.error('   Falling back to basic migration...\n');
        return false;
    }
}

// Main execution
console.log('Choose migration method:\n');
console.log('1. Use official sass-migrator (recommended, requires npm install)');
console.log('2. Use basic script migration\n');

// For automation, try sass-migrator first, fall back to basic
const useMigrator = process.env.USE_SASS_MIGRATOR !== 'false';

if (useMigrator) {
    const success = useSassMigrator();
    if (!success) {
        console.log('Falling back to basic migration...\n');
        migrateFiles();
    }
} else {
    migrateFiles();
}
