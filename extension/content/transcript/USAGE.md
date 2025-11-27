# Transcript Extraction - Usage Guide

Quick guide for using the comprehensive transcript extraction system.

## Basic Usage

### Simple Extraction

```javascript
import transcriptExtractor from "./extractor.js";

// Extract transcript (automatic method selection)
const transcript = await transcriptExtractor.extract("dQw4w9WgXcQ");

// Extract with specific language
const transcript = await transcriptExtractor.extract("dQw4w9WgXcQ", {
    lang: "es",
});
```

### Using TranscriptService

```javascript
import { getTranscript, getMetadata } from "./service.js";

// Get transcript
const transcript = await getTranscript("dQw4w9WgXcQ", "en");

// Get metadata
const metadata = await getMetadata("dQw4w9WgXcQ");
```

## Advanced Usage

### Preferred Method

```javascript
// Try Invidious first
const transcript = await transcriptExtractor.extract("dQw4w9WgXcQ", {
    preferredMethod: "invidious",
});

// Available methods: 'interceptor', 'invidious', 'youtube', 'background', 'dom'
```

### With Options

```javascript
const transcript = await transcriptExtractor.extract("dQw4w9WgXcQ", {
    lang: "en", // Language code
    preferredMethod: null, // Try specific method first
    useCache: true, // Use cached results
    timeout: 30000, // Timeout in milliseconds
});
```

### Check Available Captions

```javascript
// Check if video has captions
const hasCaptions = transcriptExtractor.hasCaptions();

// Get available languages
const languages = transcriptExtractor.getAvailableLanguages();
// Returns: [{ code: 'en', name: 'English', kind: 'asr' }, ...]

// Get all caption tracks
const tracks = transcriptExtractor.getAvailableTracks();
```

## Formatting

### With Timestamps

```javascript
const transcript = await transcriptExtractor.extract("dQw4w9WgXcQ");
const formatted = transcriptExtractor.formatWithTimestamps(transcript);

// Output:
// [0:00] First segment text
// [0:05] Second segment text
// [0:12] Third segment text
```

### Plain Text

```javascript
const transcript = await transcriptExtractor.extract("dQw4w9WgXcQ");
const plainText = transcriptExtractor.formatPlainText(transcript);

// Output: "First segment text Second segment text Third segment text"
```

## XHR Interceptor

### Initialize

```javascript
import transcriptInterceptor from "./xhr-interceptor.js";

// Initialize (auto-initialized on page load)
transcriptInterceptor.init();
```

### Get Intercepted Data

```javascript
// Get intercepted transcript
const transcript = transcriptInterceptor.getTranscript("dQw4w9WgXcQ", "en");

// Get available languages
const languages = transcriptInterceptor.getAvailableLanguages("dQw4w9WgXcQ");

// Get metadata
const metadata = transcriptInterceptor.getMetadata("dQw4w9WgXcQ");

// Get stats
const stats = transcriptInterceptor.getStats();
// Returns: { transcripts: 5, metadata: 2, isInitialized: true }
```

### Listen for Events

```javascript
// Listen for transcript interception
window.addEventListener("transcriptIntercepted", (event) => {
    const { lang, videoId, segments } = event.detail;
    console.log(`Intercepted ${segments.length} segments for ${lang}`);
});

// Listen for metadata interception
window.addEventListener("metadataIntercepted", (event) => {
    const { videoId, metadata } = event.detail;
    console.log(`Intercepted metadata for ${videoId}`);
});
```

## Error Handling

### Try-Catch

```javascript
try {
    const transcript = await transcriptExtractor.extract("dQw4w9WgXcQ");
    console.log("Success:", transcript.length, "segments");
} catch (error) {
    if (error.message.includes("No captions")) {
        console.log("Video has no captions");
    } else if (error.message.includes("Timeout")) {
        console.log("Request timed out");
    } else {
        console.error("Extraction failed:", error.message);
    }
}
```

### Graceful Fallback

```javascript
async function getTranscriptSafely(videoId) {
    try {
        return await transcriptExtractor.extract(videoId);
    } catch (error) {
        console.warn("Transcript extraction failed:", error.message);
        return []; // Return empty array as fallback
    }
}
```

## Caching

### Use Cache

```javascript
// Enable caching (default)
const transcript = await transcriptExtractor.extract("dQw4w9WgXcQ", {
    useCache: true,
});

// Disable caching
const transcript = await transcriptExtractor.extract("dQw4w9WgXcQ", {
    useCache: false,
});
```

### Clear Cache

```javascript
// Clear extractor cache
transcriptExtractor.clearCache();

// Clear interceptor cache
transcriptInterceptor.clear();
```

## Testing

### Test All Methods

```javascript
import { testAllMethods } from "./test-methods.js";

// Test all extraction methods
const results = await testAllMethods("dQw4w9WgXcQ");
```

### Test Specific Method

```javascript
import { testMethod } from "./test-methods.js";

// Test specific method
const transcript = await testMethod("invidious", "dQw4w9WgXcQ");
```

### Compare Performance

```javascript
import { compareMethods } from "./test-methods.js";

// Compare all methods
const results = await compareMethods("dQw4w9WgXcQ");
```

### Run All Tests

```javascript
import { runAllTests } from "./test-methods.js";

// Run complete test suite
const results = await runAllTests("dQw4w9WgXcQ");
```

## Browser Console Testing

When the extension is loaded, test utilities are available in the console:

```javascript
// Test all methods
await transcriptTests.testAllMethods("dQw4w9WgXcQ");

// Test specific method
await transcriptTests.testMethod("invidious", "dQw4w9WgXcQ");

// Compare methods
await transcriptTests.compareMethods("dQw4w9WgXcQ");

// Test interceptor
transcriptTests.testInterceptor();

// Test available captions
transcriptTests.testAvailableCaptions();

// Benchmark extraction
await transcriptTests.benchmarkExtraction("dQw4w9WgXcQ", 5);

// Test error handling
await transcriptTests.testErrorHandling();

// Run all tests
await transcriptTests.runAllTests("dQw4w9WgXcQ");
```

## Integration Examples

### In Content Script

```javascript
// content/main.js
import transcriptExtractor from "./transcript/extractor.js";

async function handleGetTranscript(request, sendResponse) {
    try {
        const { videoId, lang = "en" } = request;
        const transcript = await transcriptExtractor.extract(videoId, { lang });
        sendResponse({ success: true, transcript });
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    }
}
```

### In Popup/Sidepanel

```javascript
// popup/popup.js
async function loadTranscript(videoId) {
    try {
        const response = await chrome.runtime.sendMessage({
            action: "GET_TRANSCRIPT",
            videoId,
        });

        if (response.success) {
            displayTranscript(response.transcript);
        } else {
            showError(response.error);
        }
    } catch (error) {
        showError("Failed to load transcript");
    }
}
```

### In Background Service Worker

```javascript
// background/service-worker.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_TRANSCRIPT") {
        handleFetchTranscript(request, sendResponse);
        return true; // Keep channel open
    }
});

async function handleFetchTranscript(request, sendResponse) {
    const { videoId, lang = "en" } = request;

    try {
        // Use Invidious API in background
        const response = await fetch(
            `https://inv.perditum.com/api/v1/videos/${videoId}`
        );
        const data = await response.json();

        // Process captions...
        sendResponse({ success: true, data: transcript });
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    }
}
```

## Best Practices

### 1. Always Check for Captions First

```javascript
if (transcriptExtractor.hasCaptions()) {
    const transcript = await transcriptExtractor.extract(videoId);
} else {
    console.log("No captions available");
}
```

### 2. Use Caching for Better Performance

```javascript
// Enable caching for repeated requests
const transcript = await transcriptExtractor.extract(videoId, {
    useCache: true,
});
```

### 3. Handle Errors Gracefully

```javascript
try {
    const transcript = await transcriptExtractor.extract(videoId);
} catch (error) {
    // Show user-friendly error message
    showNotification("Unable to load transcript");
    console.error(error);
}
```

### 4. Set Reasonable Timeouts

```javascript
// Increase timeout for slow connections
const transcript = await transcriptExtractor.extract(videoId, {
    timeout: 60000, // 60 seconds
});
```

### 5. Prefer Specific Methods When Needed

```javascript
// Use Invidious for reliability
const transcript = await transcriptExtractor.extract(videoId, {
    preferredMethod: "invidious",
});

// Use interceptor for speed (if available)
const transcript = await transcriptExtractor.extract(videoId, {
    preferredMethod: "interceptor",
});
```

## Troubleshooting

### No Captions Available

```javascript
// Check if video has captions
if (!transcriptExtractor.hasCaptions()) {
    console.log("This video does not have captions");
    return;
}
```

### CORS Errors

```javascript
// Use methods that bypass CORS
const transcript = await transcriptExtractor.extract(videoId, {
    preferredMethod: "invidious", // or 'background'
});
```

### Timeout Issues

```javascript
// Increase timeout
const transcript = await transcriptExtractor.extract(videoId, {
    timeout: 60000, // 60 seconds
});
```

### All Methods Failing

```javascript
// Check console for detailed error logs
// Try each method individually to identify the issue
const methods = ["interceptor", "invidious", "youtube", "background", "dom"];

for (const method of methods) {
    try {
        const transcript = await transcriptExtractor._extractWithMethod(
            method,
            videoId,
            "en",
            15000
        );
        console.log(`${method} works!`, transcript.length, "segments");
        break;
    } catch (error) {
        console.error(`${method} failed:`, error.message);
    }
}
```

## Performance Tips

1. **Use XHR Interceptor**: Fastest method when transcripts are already loaded
2. **Enable Caching**: Reduces redundant API calls
3. **Prefer Invidious**: Most reliable for CORS-free access
4. **Set Timeouts**: Prevent hanging on slow connections
5. **Clear Cache Periodically**: Prevent memory buildup

## Security Considerations

1. **Validate Video IDs**: Ensure video IDs are valid before extraction
2. **Handle Sensitive Data**: Don't log or store sensitive transcript content
3. **Rate Limiting**: Implement rate limiting for API calls
4. **Error Messages**: Don't expose internal errors to users
5. **CORS**: Use appropriate methods to bypass CORS restrictions

## Additional Resources

-   [METHODS.md](./METHODS.md) - Detailed documentation of all methods
-   [test-methods.js](./test-methods.js) - Test utilities
-   [TRANSCRIPT_EXTRACTION_METHODS.md](../../../TRANSCRIPT_EXTRACTION_METHODS.md) - Original specification
