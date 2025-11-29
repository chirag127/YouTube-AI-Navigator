import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, resolve } from 'path';

const fixes = {
    '../../utils/shortcuts/global.js': {
        l: '../../utils/shortcuts/log.js',
        e: '../../utils/shortcuts/log.js',
        w: '../../utils/shortcuts/log.js',
        st: { module: '../../utils/shortcuts/global.js', rename: 'to' },
        en: '../../utils/shortcuts/string.js',
        js: '../../utils/shortcuts/core.js',
    },
    '../utils/shortcuts/global.js': {
        l: '../utils/shortcuts/log.js',
        e: '../utils/shortcuts/log.js',
        w: '../utils/shortcuts/log.js',
        st: { module: '../utils/shortcuts/global.js', rename: 'to' },
        en: '../utils/shortcuts/string.js',
        js: '../utils/shortcuts/core.js',
    },
    '../../utils/shortcuts/core.js': {
        nw: '../../utils/shortcuts/core.js',
        np: '../../utils/shortcuts/core.js',
        ok: '../../utils/shortcuts/core.js',
    },
    '../utils/shortcuts/core.js': {
        nw: '../utils/shortcuts/core.js',
        np: '../utils/shortcuts/core.js',
        ok: '../utils/shortcuts/core.js',
    },
    '../../utils/shortcuts/math.js': {
        mc: '../../utils/shortcuts/math.js',
    },
    '../utils/shortcuts/math.js': {
        mc: '../utils/shortcuts/math.js',
    },
    '../../utils/shortcuts/network.js': {
        sf: '../../utils/shortcuts/network.js',
        tf: '../../utils/shortcuts/network.js',
        jf: '../../utils/shortcuts/network.js',
    },
    '../utils/shortcuts/network.js': {
        sf: '../utils/shortcuts/network.js',
        tf: '../utils/shortcuts/network.js',
        jf: '../utils/shortcuts/network.js',
    },
    '../../utils/shortcuts/dom.js': {
        sb: '../../utils/shortcuts/dom.js',
        ge: '../../utils/shortcuts/dom.js',
        $: '../../utils/shortcuts/dom.js',
    },
    '../utils/shortcuts/dom.js': {
        sb: '../utils/shortcuts/dom.js',
        ge: '../utils/shortcuts/dom.js',
        $: '../utils/shortcuts/dom.js',
    },
};

console.log('🔧 Starting import fixes...\n');

const getAllJsFiles = dir => {
    let files = [];
    const items = readdirSync(dir);
    for (const item of items) {
        const path = join(dir, item);
        if (statSync(path).isDirectory()) {
            if (!item.includes('node_modules') && !item.includes('.git') && !item.includes('tests')) {
                files = files.concat(getAllJsFiles(path));
            }
        } else if (item.endsWith('.js')) {
            files.push(path);
        }
    }
    return files;
};

const files = getAllJsFiles('extension');
let totalFixes = 0;

for (const file of files) {
    let content = readFileSync(file, 'utf-8');
    let modified = false;

    // Fix: l, e, w from global.js -> log.js
    if (content.includes("from '../utils/shortcuts/global.js'") ||
        content.includes("from '../../utils/shortcuts/global.js'")) {

        const regex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+global\.js)['"]/g;
        const matches = [...content.matchAll(regex)];

        for (const match of matches) {
            const imports = match[1].split(',').map(i => i.trim());
            const logImports = [];
            const globalImports = [];

            for (const imp of imports) {
                const name = imp.split(' as ')[0].trim();
                if (['l', 'e', 'w'].includes(name)) {
                    logImports.push(imp);
                } else if (name === 'st') {
                    globalImports.push(imp.replace('st', 'to'));
                } else {
                    globalImports.push(imp);
                }
            }

            let replacement = '';
            if (logImports.length > 0) {
                const logPath = match[2].replace('global.js', 'log.js');
                replacement += `import { ${logImports.join(', ')} } from '${logPath}';\n`;
            }
            if (globalImports.length > 0) {
                replacement += `import { ${globalImports.join(', ')} } from '${match[2]}'`;
            }

            if (replacement) {
                content = content.replace(match[0], replacement.trim());
                modified = true;
                totalFixes++;
            }
        }
    }

    if (modified) {
        writeFileSync(file, content, 'utf-8');
        console.log(`✅ Fixed: ${file}`);
    }
}

console.log(`\n✨ Total fixes applied: ${totalFixes}`);
