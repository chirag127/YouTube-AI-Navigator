# YouTube.js InnerTube Integration

## Overview

YouTube.js (youtubei.js v16.0.1) is the **PRIMARY** strategy for fetching all YouTube data in this extension.

## Architecture

### Core Wrapper

-   **File**: `extension/api/youtube-innertube.js`
-   **Purpose**: Singleton InnerTube client with caching
-   **Import**: `import { Innertube } from 'youtubei.js/web'` (browser-specific)

### Services

#### 1. Transcripts

-   **Strategy**: `extension/services/transcript/strategies/innertube-strategy.js`
-   **Priority**: 0 (highest)
-   **Method**: `info.getTranscript()`
-   **Fallback**: DOM Automation, Genius, Speech-to-Text

#### 2. Metadata

-   **Service**: `extension/services/video/innertube-metadata.js`
-   **Method**: `getVideoInfo(videoId)`
-   **Data**: title, description, channel, views, duration, keywords

#### 3. Comments

-   **Service**: `extension/services/comments/innertube-comments.js`
-   **Method**: `getComments(videoId)`
-   **Data**: author, text, likes, replies

## Usage

### Fetch Transcript

```javascript
import { fetchTranscript } from "./services/transcript/fetcher.js";
const segments = await fetchTranscript("videoId", "en");
```

### Fetch Metadata

```javascript
import { fetchMetadata } from "./services/video/innertube-metadata.js";
const metadata = await fetchMetadata("videoId");
```

### Fetch Comments

```javascript
import { fetchComments } from "./services/comments/innertube-comments.js";
const comments = await fetchComments("videoId", 20);
```

## Graceful Degradation

If InnerTube fails, the system automatically falls back to:

1. DOM Automation (UI scraping)
2. Genius Lyrics (music videos)
3. Speech-to-Text (Gemini)

## Token Efficiency

-   Ultra-minimal ES6+ syntax
-   Aggressive destructuring
-   Cached client instance (1 hour TTL)
-   No redundant comments

## Performance

-   Parallel operations via `Promise.allSettled`
-   Singleton pattern prevents re-initialization
-   Cached responses (5 min TTL)
