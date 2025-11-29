# Technical Architecture

## YouTube.js InnerTube Integration

YouTube AI Navigator uses **YouTube.js** (v16.0.1) as the primary data fetching strategy, providing reliable access to YouTube's private InnerTube API.

### Core Components

```
extension/
├── lib/
│   └── youtubei.js (757 KB)      # Bundled YouTube.js library
├── api/
│   └── youtube-innertube.js      # Singleton InnerTube client wrapper
├── services/
│   ├── transcript/
│   │   └── strategies/
│   │       └── innertube-strategy.js  # Transcript fetcher (Priority 0)
│   ├── video/
│   │   └── innertube-metadata.js      # Metadata extractor
│   └── comments/
│       └── innertube-comments.js      # Comments fetcher
└── utils/
    └── yt.js                      # Ultra-minimal utilities
```

### Data Fetching Strategy

**Priority-Based Fallback System:**

1. **InnerTube API** (Priority 0) - Primary, most reliable
2. **DOM Automation** (Priority 1) - UI scraping fallback
3. **Genius Lyrics** (Priority 4) - Music video fallback
4. **Speech-to-Text** (Priority 9) - AI transcription last resort

### Performance Characteristics

-   **Client Initialization**: ~500ms (cached 1 hour)
-   **Transcript Fetch**: ~1-2s per video
-   **Metadata Fetch**: ~500ms per video
-   **Comments Fetch**: ~1-3s (20 comments)
-   **Bundle Size**: 757 KB (minified)

### Build Process

```bash
# Install dependencies and build
npm install

# Rebuild after changes
npm run build

# Watch mode (auto-rebuild)
npm run build:watch
```

The build script bundles YouTube.js from `node_modules` to `extension/lib/youtubei.js` using esbuild.

### Key Features

-   ✅ **Singleton Pattern**: Single InnerTube client instance
-   ✅ **Caching**: 1-hour client cache, 5-minute data cache
-   ✅ **Graceful Degradation**: Automatic fallback on failure
-   ✅ **Token Efficiency**: ~200 lines total implementation
-   ✅ **Hyper-Modular**: 7 atomic files, one responsibility each

### Documentation

-   `BUILD.md` - Complete build & installation guide
-   `YOUTUBE_JS_INTEGRATION.md` - Implementation details
-   `DEPLOYMENT_READY.md` - Deployment checklist
-   `extension/api/README_YOUTUBE_INNERTUBE.md` - API reference

### Development

See `BUILD.md` for complete development workflow and troubleshooting guide.
