# Transcript Extraction System

## Architecture Overview

The transcript extraction system uses a **Strategy Pattern** with **Priority-Based Fallback** to ensure maximum reliability across different YouTube video configurations.

## Directory Structure

```
services/transcript/
├── strategies/          # Method-specific extraction strategies
│   ├── xhr-strategy.js              # Priority 1: XHR Interceptor
│   ├── invidious-strategy.js        # Priority 2: Invidious API
│   ├── youtube-direct-strategy.js   # Priority 3: YouTube Direct API
│   ├── background-proxy-strategy.js # Priority 4: Service Worker Proxy
│   └── dom-strategy.js              # Priority 5: DOM Parser
├── parsers/             # Format-specific parsers (shared)
│   ├── xml-parser.js    # YouTube timedtext XML format
│   ├── json3-parser.js  # YouTube JSON3 format
│   ├── vtt-parser.js    # WebVTT format (Invidious)
│   └── events-parser.js # ytInitialPlayerResponse events
├── fetcher.js           # Strategy orchestrator
└── README.md            # This file
```

## Extraction Priority Order

1. **XHR Interceptor** (Fastest if available)

    - Captures live network requests
    - Zero latency when transcript is already loaded
    - Requires page to have made the request

2. **Invidious API** (Primary - CORS-free, reliable)

    - Uses privacy-focused Invidious instances
    - No CORS issues
    - Returns WebVTT format

3. **YouTube Direct API** (Direct timedtext endpoint)

    - Multiple format support (json3, srv3, srv2, srv1)
    - May have CORS restrictions
    - Fallback to older formats if needed

4. **Background Proxy** (Service worker fallback)

    - Proxies requests through service worker
    - Bypasses CORS restrictions
    - Slower due to message passing

5. **DOM Parser** (ytInitialPlayerResponse)
    - Extracts from page's player response
    - Last resort method
    - Requires page to be fully loaded

## Format Differences

### XML Format (YouTube timedtext)

```xml
<text start="10.5" dur="2.3">Hello world</text>
```

### JSON3 Format (YouTube newer API)

```json
{
    "events": [
        {
            "tStartMs": 10500,
            "dDurationMs": 2300,
            "segs": [{ "utf8": "Hello world" }]
        }
    ]
}
```

### WebVTT Format (Invidious)

```
00:00:10.500 --> 00:00:12.800
Hello world
```

### Events Format (ytInitialPlayerResponse)

```json
{
    "events": [
        {
            "tStartMs": 10500,
            "dDurationMs": 2300,
            "segs": [{ "utf8": "Hello world" }]
        }
    ]
}
```

## Usage

```javascript
import { fetchTranscript } from "./services/transcript/fetcher.js";

// Fetch transcript with automatic fallback
const segments = await fetchTranscript("VIDEO_ID", "en", 30000);

// segments = [
//   { start: 10.5, duration: 2.3, text: "Hello world" },
//   ...
// ]
```

## Adding New Strategies

1. Create strategy file in `strategies/`
2. Implement `fetch(videoId, lang)` function
3. Export strategy object with `name`, `priority`, and `fetch`
4. Import and add to `STRATEGIES` array in `fetcher.js`

Example:

```javascript
// strategies/my-strategy.js
export async function fetchViaMyMethod(videoId, lang) {
    // Implementation
    return segments;
}

export const strategy = {
    name: "My Method",
    priority: 6,
    fetch: fetchViaMyMethod,
};
```

## Adding New Parsers

1. Create parser file in `parsers/`
2. Export parsing function
3. Import in relevant strategy

Example:

```javascript
// parsers/my-parser.js
export function parseMyFormat(data) {
    // Parse data into segments
    return segments.map((s) => ({
        start: s.startTime,
        duration: s.duration,
        text: s.content,
    }));
}
```

## Error Handling

Each strategy throws descriptive errors:

-   `'No intercepted transcript available'` - XHR hasn't captured data yet
-   `'All Invidious instances failed'` - All instances are down/blocked
-   `'YouTube Direct API failed for all formats'` - All format attempts failed
-   `'Background proxy failed'` - Service worker communication error
-   `'No ytInitialPlayerResponse'` - DOM parser can't find player data

The fetcher catches these and tries the next strategy automatically.

## Performance Optimization

-   **Caching**: Extractor caches results for 5 minutes
-   **Timeout**: Each strategy has 30s timeout (configurable)
-   **Parallel**: Strategies are tried sequentially (not parallel) to avoid rate limits
-   **Token Efficiency**: ~250 lines total across 9 files vs 300 lines in 1 monolithic file

## Testing

Test each strategy independently:

```javascript
import { strategy as xhrStrategy } from "./strategies/xhr-strategy.js";

try {
    const segments = await xhrStrategy.fetch("VIDEO_ID", "en");
    console.log("XHR Strategy:", segments.length, "segments");
} catch (e) {
    console.error("XHR Strategy failed:", e.message);
}
```

## Debugging

Enable verbose logging:

```javascript
// In fetcher.js, each strategy logs:
console.log(`[Fetcher] Trying ${strategy.name}...`);
console.log(
    `[Fetcher] ✅ ${strategy.name} succeeded: ${result.length} segments`
);
console.warn(`[Fetcher] ${strategy.name} failed:`, e.message);
```

## Best Practices

1. **Always use fetcher.js** - Don't call strategies directly
2. **Handle empty results** - Check `segments.length > 0`
3. **Respect timeouts** - Don't increase beyond 30s per strategy
4. **Cache aggressively** - Transcripts rarely change
5. **Log failures** - Help debug which strategies are failing

## Maintenance

-   **Update Invidious instances**: Edit `INSTANCES` array in `invidious-strategy.js`
-   **Add new formats**: Create new parser in `parsers/`
-   **Adjust priorities**: Change `priority` value in strategy exports
-   **Monitor failures**: Check console logs for patterns

## Related Files

-   `content/transcript/extractor.js` - High-level API wrapper
-   `content/transcript/xhr-interceptor.js` - XHR/Fetch interception logic
-   `background/service-worker.js` - Background proxy implementation
-   `services/api/invidious.js` - Invidious API client (legacy, being phased out)
