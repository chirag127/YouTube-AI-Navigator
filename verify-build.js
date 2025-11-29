// Build Verification Script
import { existsSync, statSync } from 'fs';
import { join } from 'path';

const checks = [
    { path: 'package.json', desc: 'Package configuration' },
    { path: 'node_modules/youtubei.js', desc: 'YouTube.js installed' },
    { path: 'extension/lib/youtubei.js', desc: 'Bundled YouTube.js', minSize: 700000 },
    { path: 'extension/api/youtube-innertube.js', desc: 'InnerTube wrapper' },
    { path: 'extension/services/transcript/strategies/innertube-strategy.js', desc: 'Transcript strategy' },
    { path: 'extension/services/video/innertube-metadata.js', desc: 'Metadata service' },
    { path: 'extension/services/comments/innertube-comments.js', desc: 'Comments service' },
    { path: 'extension/utils/yt.js', desc: 'Utilities' },
    { path: 'BUILD.md', desc: 'Build documentation' },
    { path: 'DEPLOYMENT_READY.md', desc: 'Deployment guide' }
];

console.log('🔍 Verifying YouTube.js Integration Build...\n');

let passed = 0;
let failed = 0;

for (const check of checks) {
    const exists = existsSync(check.path);

    if (!exists) {
        console.log(`❌ ${check.desc}: NOT FOUND (${check.path})`);
        failed++;
        continue;
    }

    if (check.minSize) {
        const size = statSync(check.path).size;
        if (size < check.minSize) {
            console.log(`⚠️  ${check.desc}: TOO SMALL (${size} bytes, expected ${check.minSize}+)`);
            failed++;
            continue;
        }
        console.log(`✅ ${check.desc}: ${(size / 1024).toFixed(1)} KB`);
    } else {
        console.log(`✅ ${check.desc}`);
    }

    passed++;
}

console.log(`\n📊 Results: ${passed}/${checks.length} checks passed`);

if (failed === 0) {
    console.log('\n🎉 BUILD VERIFIED - Extension ready to load in Chrome!');
    console.log('\nNext steps:');
    console.log('1. Open chrome://extensions/');
    console.log('2. Enable Developer mode');
    console.log('3. Click "Load unpacked"');
    console.log('4. Select the "extension" folder');
    console.log('5. ✅ Done!');
    process.exit(0);
} else {
    console.log('\n❌ BUILD INCOMPLETE - Run "npm install" to fix');
    process.exit(1);
}
