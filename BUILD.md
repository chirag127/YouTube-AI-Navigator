# Build & Installation Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will:

-   Install `youtubei.js@16.0.1` (YouTube InnerTube API client)
-   Install build tools (`esbuild`, `rimraf`)
-   Automatically run the build script
-   Bundle YouTube.js to `extension/lib/youtubei.js` (739.5kb)

### 2. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `extension` folder from this repository
5. ✅ Extension is now active!

### 3. Reload After Changes

If you modify code:

```bash
npm run build
```

Then click the reload icon in `chrome://extensions/`

## Build Scripts

### Available Commands

```bash
# Install dependencies and build
npm install

# Build only (bundle YouTube.js)
npm run build

# Build with file watching (auto-rebuild on changes)
npm run build:watch

# Clean build artifacts
npm run clean

# Reinstall everything
npm run install-deps
```

## Architecture

### Bundle Process

The build script (`build.js`) uses esbuild to:

1. Take `node_modules/youtubei.js/bundle/browser.js`
2. Minify for production
3. Output to `extension/lib/youtubei.js`
4. Target Chrome 90+ (ES2020)

### Import Strategy

All extension code imports from the bundled version:

```javascript
import { Innertube } from "../lib/youtubei.js";
```

### File Structure

```
YouTube-AI-Navigator/
├── package.json          # Dependencies & scripts
├── build.js              # Build script
├── node_modules/         # npm packages (gitignored)
└── extension/            # Chrome extension (load this folder)
    ├── manifest.json     # Extension config
    ├── lib/
    │   └── youtubei.js   # Bundled YouTube.js (739.5kb)
    ├── api/
    │   └── youtube-innertube.js  # InnerTube wrapper
    ├── services/
    │   ├── transcript/
    │   ├── video/
    │   └── comments/
    └── utils/
        └── yt.js         # Utilities
```

## Production Optimization

### Bundle Size

-   **Unminified**: ~2.5 MB
-   **Minified**: 739.5 KB
-   **Gzipped**: ~200 KB (estimated)

### Performance

-   **Client Init**: ~500ms (cached 1 hour)
-   **Transcript Fetch**: ~1-2s
-   **Metadata Fetch**: ~500ms
-   **Comments Fetch**: ~1-3s

### Caching Strategy

-   InnerTube client: 1 hour TTL
-   Data responses: 5 minutes TTL
-   In-memory Map storage

## Troubleshooting

### Build Fails

```bash
# Clean and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install
```

### Extension Won't Load

1. Check `chrome://extensions/` for errors
2. Verify `extension/lib/youtubei.js` exists
3. Check browser console for import errors
4. Ensure manifest.json includes `lib/*.js` in web_accessible_resources

### Import Errors

If you see "Failed to resolve module specifier":

1. Verify import path: `import { Innertube } from '../lib/youtubei.js'`
2. Check file exists: `extension/lib/youtubei.js`
3. Reload extension in Chrome

### Performance Issues

1. Check cache is working (logs show "Using cached instance")
2. Monitor network tab for repeated API calls
3. Verify singleton pattern is active

## Development Workflow

### Making Changes

1. Edit files in `extension/` directory
2. If you modified build process: `npm run build`
3. Reload extension in Chrome
4. Test on YouTube video page
5. Check browser console for errors

### Testing InnerTube Integration

1. Navigate to any YouTube video
2. Open browser console (F12)
3. Run test script:

```javascript
// Copy/paste from extension/api/youtube-innertube-test.js
```

4. Verify all 4 tests pass

### Adding New Features

1. Create new file in appropriate directory
2. Import InnerTube wrapper: `import { getVideoInfo } from '../../api/youtube-innertube.js'`
3. Use utilities: `import { log, err, ok } from '../../utils/yt.js'`
4. Follow hyper-modular pattern (one responsibility per file)
5. Keep token count minimal (ES6+ syntax)

## Deployment Checklist

-   [x] Dependencies installed
-   [x] Build completed successfully
-   [x] Extension folder contains `lib/youtubei.js`
-   [x] Manifest includes lib in web_accessible_resources
-   [x] All imports use bundled version
-   [x] No syntax errors
-   [x] Documentation complete

## Version Information

-   **Extension**: v2.0.0
-   **YouTube.js**: v16.0.1
-   **Node.js**: v18+ required
-   **Chrome**: v90+ required

## Support

For issues:

1. Check browser console for errors
2. Verify build completed successfully
3. Review `YOUTUBE_JS_INTEGRATION.md` for architecture details
4. Check `extension/api/README_YOUTUBE_INNERTUBE.md` for API usage
