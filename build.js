// Build Script - Bundle YouTube.js for Chrome Extension
import { build } from 'esbuild';
import { existsSync, mkdirSync } from 'fs';

const outDir = 'extension/lib';
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const config = {
    entryPoints: ['node_modules/youtubei.js/bundle/browser.js'],
    bundle: false,
    format: 'esm',
    target: 'chrome90',
    outfile: `${outDir}/youtubei.js`,
    minify: true,
    sourcemap: false,
    platform: 'browser',
    logLevel: 'info'
};

try {
    await build(config);
    console.log('✅ YouTube.js bundled successfully');
} catch (e) {
    console.error('❌ Build failed:', e);
    process.exit(1);
}
