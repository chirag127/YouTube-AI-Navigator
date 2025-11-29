import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, sep } from 'path';

const getAllJsFiles = dir => {
    let files = [];
    const items = readdirSync(dir);
    for (const item of items) {
        const path = join(dir, item);
        if (statSync(path).isDirectory()) {
            if (!item.includes('node_modules') && !item.includes('.git')) {
                files = files.concat(getAllJsFiles(path));
            }
        } else if (item.endsWith('.js')) {
            files.push(path);
        }
    }
    return files;
};

const parseImports = content => {
    const imports = [];
    const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const names = match[1].split(',').map(n => {
            const parts = n.trim().split(/\s+as\s+/);
            return parts[0].trim();
        });
        imports.push({ names, path: match[2] });
    }
    return imports;
};

const parseExports = content => {
    const exports = [];
    const exportRegex = /export\s+const\s+(\w+)\s*=/g;
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
        exports.push(match[1]);
    }
    return exports;
};

describe('Import/Export Validation', () => {
    it('should validate all imports match actual exports', () => {
        const extensionFiles = getAllJsFiles('extension');
        const errors = [];

        for (const file of extensionFiles) {
            const content = readFileSync(file, 'utf-8');
