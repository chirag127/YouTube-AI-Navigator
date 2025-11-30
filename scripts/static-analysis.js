import '../tests/setup.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXTENSION_DIR = path.resolve(__dirname, '../extension');

function getJsFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getJsFiles(filePath));
        } else if (file.endsWith('.js')) {
            results.push(filePath);
        }
    });
    return results;
}

function parseImports(content) {
    const imports = [];
    const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const items = match[1].split(',').map(item => item.trim().split(' as ')[0].trim());
        const fromPath = match[2];
        imports.push({ items, fromPath, line: content.substring(0, match.index).split('\n').length });
    }
    return imports;
}

function parseExports(content) {
    const exports = new Set();
    const exportRegex = /export\s+(?:const|let|var|function|class|default)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
        exports.add(match[1]);
    }
    // Also handle export { ... }
    const exportBlockRegex = /export\s+{([^}]+)}/g;
    while ((match = exportBlockRegex.exec(content)) !== null) {
        const items = match[1].split(',').map(item => item.trim().split(' as ')[0].trim());
        items.forEach(item => exports.add(item));
    }
    return exports;
}

function resolvePath(fromFile, importPath) {
    const dir = path.dirname(fromFile);
    let resolved;
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
        resolved = path.resolve(dir, importPath);
    } else {
        // For relative paths within extension
        resolved = path.resolve(EXTENSION_DIR, importPath);
    }
    if (!resolved.endsWith('.js')) resolved += '.js';
    return resolved;
}

function buildDependencyGraph(jsFiles) {
    const graph = {};
    const fileMap = {};
    jsFiles.forEach(file => {
        const relativePath = path.relative(EXTENSION_DIR, file);
        fileMap[relativePath] = file;
        graph[relativePath] = [];
    });

    jsFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const imports = parseImports(content);
        const relativeFile = path.relative(EXTENSION_DIR, file);
        imports.forEach(imp => {
            const resolved = resolvePath(file, imp.fromPath);
            if (fs.existsSync(resolved)) {
                const relativeResolved = path.relative(EXTENSION_DIR, resolved);
                if (graph[relativeFile]) {
                    graph[relativeFile].push(relativeResolved);
                }
            }
        });
    });
    return graph;
}

function detectCycles(graph) {
    const cycles = [];
    const visited = new Set();
    const recStack = new Set();

    function dfs(node, path) {
        if (recStack.has(node)) {
            const cycleStart = path.indexOf(node);
            cycles.push(path.slice(cycleStart).concat(node));
            return;
        }
        if (visited.has(node)) return;

        visited.add(node);
        recStack.add(node);

        for (const neighbor of graph[node] || []) {
            dfs(neighbor, path.concat(node));
        }

        recStack.delete(node);
    }

    for (const node in graph) {
        if (!visited.has(node)) {
            dfs(node, []);
        }
    }
    return cycles;
}

(async () => {
    const jsFiles = getJsFiles(EXTENSION_DIR);
    console.log(`Analyzing ${jsFiles.length} JS files...`);

    const issues = {
        importAudit: [],
        pathResolution: [],
        circularDeps: []
    };

    // Build dependency graph for circular deps
    const graph = buildDependencyGraph(jsFiles);
    const cycles = detectCycles(graph);
    if (cycles.length > 0) {
        issues.circularDeps = cycles;
    }

    // Analyze each file
    for (const file of jsFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const imports = parseImports(content);
        const relativeFile = path.relative(EXTENSION_DIR, file);

        for (const imp of imports) {
            const resolvedPath = resolvePath(file, imp.fromPath);
            if (!fs.existsSync(resolvedPath)) {
                issues.pathResolution.push({
                    file: relativeFile,
                    importPath: imp.fromPath,
                    resolvedPath: path.relative(EXTENSION_DIR, resolvedPath),
                    line: imp.line
                });
            } else {
                // Check exports
                const targetContent = fs.readFileSync(resolvedPath, 'utf8');
                const exports = parseExports(targetContent);
                for (const item of imp.items) {
                    if (!exports.has(item)) {
                        issues.importAudit.push({
                            file: relativeFile,
                            importPath: imp.fromPath,
                            missingExport: item,
                            line: imp.line
                        });
                    }
                }
            }
        }
    }

    // Report findings
    console.log('\n=== STATIC ANALYSIS REPORT ===\n');

    console.log('1. Import Audit Issues:');
    if (issues.importAudit.length === 0) {
        console.log('   No issues found.');
    } else {
        issues.importAudit.forEach(issue => {
            console.log(`   ${issue.file}:${issue.line} - '${issue.missingExport}' not exported from '${issue.importPath}'`);
        });
    }

    console.log('\n2. Path Resolution Issues:');
    if (issues.pathResolution.length === 0) {
        console.log('   No issues found.');
    } else {
        issues.pathResolution.forEach(issue => {
            console.log(`   ${issue.file}:${issue.line} - '${issue.importPath}' does not resolve to existing file (tried ${issue.resolvedPath})`);
        });
    }

    console.log('\n3. Circular Dependencies:');
    if (issues.circularDeps.length === 0) {
        console.log('   No circular dependencies found.');
    } else {
        issues.circularDeps.forEach(cycle => {
            console.log(`   Cycle: ${cycle.join(' -> ')}`);
        });
    }

    const totalIssues = issues.importAudit.length + issues.pathResolution.length + issues.circularDeps.length;
    console.log(`\nTotal issues found: ${totalIssues}`);
})();