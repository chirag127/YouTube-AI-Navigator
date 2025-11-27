# Transcript Extraction Methods

This document describes all implemented transcript extraction methods in the YouTube AI Master extension.

## Overview

The extension uses a **multi-method fallback system** to ensure reliable transcript extraction across different scenarios. Methods are tried in priority order until one succeeds.

## Priority Order

1. **XHR Interceptor** (Fastest if available)
2. **Invidious API** (Primary - CORS-free, reliable)
3. **YouTube Direct API** (Direct timedtext endpoint)
4. **Background Proxy** (Service worker fallback)
5. **DOM Parser** (ytInitialPlayerResponse)

---

## Method 0: XHR Interceptor

### Description

Intercepts network requests to capture transcript data as YouTube loads it. This is the fastest method when transcripts have already been loaded by YouTube's player.

### Implementation

-   File: `extension/content/transcript/xhr-interceptor.js`
-   Intercepts both `XMLHttpRequest` and `fetch` API calls
-   Captures `/timedtext` endpoint responses
-   Stores intercepted data in memory for instant retrieval

### Advantages

-   ✅ Instant retrieval (no network request needed)
-   ✅ No CORS issues
-   ✅ Works even when other methods fail
-   ✅ Captures multiple languages automatically

### Disadvantages

-   ❌ Only works if YouTube has already loaded the transcript
-   ❌ Requires page injection
-   ❌ Data cleared on page navigation

### Usage

```javascript
import transcriptInterceptor from "./xhr-interceptor.js";

// Get intercepted transcript
const transcript = transcriptInterceptor.getTranscript(videoId, "en");

// Check available languages
const languages = transcriptInterceptor.getAvailableLanguages(videoId);
```

---

## Method 1: Invidious API (Primary)

### Description

Uses the Invidious API, a privacy-focused YouTube frontend with a public API. This is the primary method due to its reliability and CORS-free access.

### Implementation

-   File: `extension/background/service-worker.js` (handler)
-   Endpoint: `https://[instance]/api/v1/videos/{videoId}`
-   Multiple public instances for redundancy
-   Automatic instance fallback

### Advantages

-   ✅ No CORS issues (runs through service worker)
-   ✅ Comprehensive video metadata
-   ✅ Multiple public instances for redundancy
-   ✅ Well-documented API
-   ✅ Returns caption URLs directly

### Disadvantages

-   ❌ Depends on third-party service availability
-   ❌ May be slower than direct YouTube API
-   ❌ Instance availability varies

### API Response Structure

```javascript
{
  videoId: "dQw4w9WgXcQ",
  title: "Video Title",
  author: "Channel Name",
  lengthSeconds: 213,
  viewCount: 1234567,
  captions: [
    {
      label: "English",
      language_code: "en",
      url: "https://..."
    }
  ]
}
```

### Instance Management

The extension maintains a list of working Invidious instances:

```javascript
const instances = [
    "https://inv.perditum.com",
    "https://invidious.privacyredirect.com",
    "https://invidious.fdn.fr",
    "https://iv.ggtyler.dev",
    "https://invidious.protokolla.fi",
];
```

---

## Method 2: YouTube Direct API

### Description

Direct access to YouTube's timedtext API endpoint. This is YouTube's official caption delivery system.

### Implementation

-   File: `extension/content/transcript/service.js`
-   Endpoint: `https://www.youtube.com/api/timedtext`
-   Supports multiple formats: json3, srv3, srv2, srv1

### Query Parameters

-   `v` - Video ID
-   `lang` - Language code (e.g., "en", "ja", "es")
-   `tlang` - Translation language code (optional)
-   `fmt` - Format (json3, srv3, srv2, srv1)

### Advantages

-   ✅ Official YouTube API
-   ✅ Fast response times
-   ✅ Multiple format support
-   ✅ Supports translations

### Disadvantages

-   ❌ May have CORS issues in some browsers
-   ❌ Requires video ID and language code
-   ❌ May be rate-limited

### Response Format (JSON3)

```javascript
{
    events: [
        {
            tStartMs: 0, // Start time in milliseconds
            dDurationMs: 2000, // Duration in milliseconds
            segs: [
                {
                    utf8: "Text content", // The actual subtitle text
                },
            ],
        },
    ];
}
```

### ResponseFormat (XML/SRV)

```xml
<transcript>
  <text start="0.0" dur="2.0">Text content</text>
  <text start="2.0" dur="3.5">More text</text>
</transcript>
```

---

## Method 3: Background Proxy

### Description

Routes transcript requests through the extension's service worker to bypass CORS restrictions.

### Implementation

-   File: `extension/background/service-worker.js`
-   Message: `FETCH_TRANSCRIPT`
-   Combines multiple methods in the background

### Advantages

-   ✅ Bypasses CORS restrictions
-   ✅ Can use multiple backend methods
-   ✅ Centralized error handling
-   ✅ Can implement caching

### Disadvantages

-   ❌ Requires message passing overhead
-   ❌ Depends on service worker being active
-   ❌ Slightly slower than direct methods

### Usage

```javascript
const response = await chrome.runtime.sendMessage({
    action: "FETCH_TRANSCRIPT",
    videoId: "dQw4w9WgXcQ",
    lang: "en",
});

if (response.success) {
    const transcript = response.data;
}
```

---

## Method 4: DOM Parser (ytInitialPlayerResponse)

### Description

Extracts caption track information from YouTube's player response object embedded in the page HTML.

### Implementation

-   File: `extension/content/transcript/service.js`
-   Source: `window.ytInitialPlayerResponse` or script tags
-   Parses caption tracks and fetches from baseUrl

### Advantages

-   ✅ No external API calls needed
-   ✅ Always available when page loads
-   ✅ Provides complete caption track list
-   ✅ Includes metadata (manual vs auto-generated)

### Disadvantages

-   ❌ Requires page to be fully loaded
-   ❌ May have CORS issues when fetching captions
-   ❌ Structure may change with YouTube updates

### Caption Track Structure

```javascript
{
    captionTracks: [
        {
            baseUrl: "https://www.youtube.com/api/timedtext?...",
            name: { simpleText: "English" },
            vssId: ".en",
            languageCode: "en",
            kind: "asr", // or "manual"
            isTranslatable: true,
        },
    ];
}
```

### Caption Types

-   **Manual captions**: `kind: "manual"` or undefined
-   **Auto-generated**: `kind: "asr"` (Automatic Speech Recognition)

---

## Unified Extractor

### Description

The `TranscriptExtractor` class provides a unified interface to all extraction methods with automatic fallback.

### Implementation

File: `extension/content/transcript/extractor.js`

### Usage

```javascript
import transcriptExtractor from "./extractor.js";

// Extract with automatic method selection
const transcript = await transcriptExtractor.extract(videoId, {
    lang: "en",
    useCache: true,
    timeout: 30000,
});

// Extract with preferred method
const transcript = await transcriptExtractor.extract(videoId, {
    lang: "en",
    preferredMethod: "invidious",
});

// Get available languages
const languages = transcriptExtractor.getAvailableLanguages();

// Check if captions available
const hasCaptions = transcriptExtractor.hasCaptions();

// Format transcript
const formatted = transcriptExtractor.formatWithTimestamps(transcript);
const plainText = transcriptExtractor.formatPlainText(transcript);
```

### Options

```javascript
{
  lang: 'en',              // Language code
  preferredMethod: null,   // Try specific method first
  useCache: true,          // Use cached results
  timeout: 30000          // Timeout in milliseconds
}
```

---

## Error Handling

### Common Errors

1. **No captions available**

    - Video doesn't have captions enabled
    - Check with `hasCaptions()` before extraction

2. **CORS errors**

    - Use Invidious API or Background Proxy
    - XHR Interceptor bypasses CORS

3. **Timeout errors**

    - Increase timeout option
    - Try different method

4. **Rate limiting**
    - Implement exponential backoff
    - Use caching to reduce requests

### Error Messages

```javascript
try {
    const transcript = await transcriptExtractor.extract(videoId);
} catch (error) {
    if (error.message.includes("No captions")) {
        // Handle no captions case
    } else if (error.message.includes("Timeout")) {
        // Handle timeout
    } else {
        // Handle other errors
    }
}
```

---

## Performance Comparison

| Method           | Speed      | Reliability | CORS-Free | Offline |
| ---------------- | ---------- | ----------- | --------- | ------- |
| XHR Interceptor  | ⚡⚡⚡⚡⚡ | ⭐⭐⭐      | ✅        | ❌      |
| Invidious API    | ⚡⚡⚡     | ⭐⭐⭐⭐    | ✅        | ❌      |
| YouTube Direct   | ⚡⚡⚡⚡   | ⭐⭐⭐      | ❌        | ❌      |
| Background Proxy | ⚡⚡⚡     | ⭐⭐⭐⭐    | ✅        | ❌      |
| DOM Parser       | ⚡⚡⚡⚡   | ⭐⭐⭐⭐    | ❌        | ❌      |

---

## Testing Checklist

-   [ ] Videos with manual captions
-   [ ] Videos with auto-generated captions only
-   [ ] Videos with multiple language options
-   [ ] Videos with no captions
-   [ ] Videos with translated captions
-   [ ] Long videos (>1 hour)
-   [ ] Live streams
-   [ ] Age-restricted videos
-   [ ] Private/unlisted videos
-   [ ] Videos in different regions

---

## Debugging

### Enable Logging

All methods include detailed logging. Check the browser console for:

-   `[TranscriptExtractor]` - Main extractor logs
-   `[XHR-Interceptor]` - Interception logs
-   `[Invidious]` - Invidious API logs
-   `[Method X]` - Individual method logs

### Common Issues

1. **Method fails silently**

    - Check console for error messages
    - Verify video has captions
    - Try different method manually

2. **Interceptor not capturing**

    - Ensure interceptor is initialized
    - Check if YouTube has loaded captions
    - Refresh page and try again

3. **Invidious instances failing**
    - Instances may be temporarily down
    - Extension automatically tries multiple instances
    - Check instance status at https://api.invidious.io/

---

## Future Improvements

1. **Caching Layer**

    - Implement persistent caching (IndexedDB)
    - Cache transcript data across sessions
    - Reduce API calls

2. **Language Detection**

    - Auto-detect video language
    - Fallback to user's preferred language
    - Support language preferences

3. **Translation Support**

    - Fetch translated captions
    - Support multiple languages simultaneously
    - Real-time translation

4. **Performance Optimization**

    - Parallel method execution
    - Faster instance selection
    - Preload transcripts

5. **Offline Support**
    - Cache transcripts for offline viewing
    - Sync with browser storage
    - Export/import functionality

---

## References

-   [YouTube Timedtext API](https://www.youtube.com/api/timedtext)
-   [Invidious API Documentation](https://docs.invidious.io/api/)
-   [WebVTT Format Specification](https://www.w3.org/TR/webvtt1/)
-   [YouTube Player API](https://developers.google.com/youtube/iframe_api_reference)
