# YouTube AI Master - Architecture Documentation

## Overview

YouTube AI Master is a Chromium browser extension built with **Vanilla JavaScript (ES6 Modules)** following a **highly modular, token-efficient architecture**. The extension uses Google's Gemini AI API for video analysis and implements a sophisticated transcript extraction system with multiple fallback strategies.

## Core Principles

1. **Maximum Modularity** - Many small files distributed across many folders
2. **Minimum Tokens** - Terse, dense, efficient ES6 code
3. **Strategy Pattern** - Pluggable extraction and parsing strategies
4. **Priority-Based Fallback** - Automatic failover between methods
5. **No Frameworks** - Pure JavaScript, HTML, CSS only

## Directory Structure

```
extension/
├── assets/                    # Icons and static resources
├── background/
│   └── service-worker.js      # Manifest V3 service worker
├── content/
│   ├── core/                  # Core initialization and state
│   │   ├── analyzer.js        # Main analysis orchestrator
│   │   ├── debug.js           # Debug utilities
│   │   ├── init.js            # Initialization logic
│   │   ├── observer.js        # DOM mutation observer
│   │   └── state.js           # Global state management
│   ├── handlers/              # Event handlers
│   │   ├── chat.js            # Chat interaction handler
│   │   ├── comments.js        # Comment analysis handler
│   │   └── events.js          # UI event handlers
│   ├── segments/              # Segment-related features
│   │   ├── autoskip.js        # Auto-skip functionality
│   │   ├── markers.js         # Video player markers
│   │   └── timeline.js        # Timeline visualization
│   ├── transcript/            # Transcript extraction
│   │   ├── display.js         # Transcript UI rendering
│   │   ├── extractor.js       # High-level extraction API
│   │   ├── service.js         # Transcript service
│   │   ├── xhr-interceptor.js # XHR/Fetch interception
│   │   └── styles.css         # Transcript styles
│   ├── ui/                    # UI components and renderers
│   │   ├── components/        # Reusable UI components
│   │   ├── renderers/         # Content renderers
│   │   ├── templates/         # HTML templates
│   │   ├── tabs.js            # Tab navigation
│   │   └── widget.js          # Main widget container
│   ├── utils/                 # Utility functions
│   │   ├── dom.js             # DOM manipulation
│   │   ├── retry.js           # Retry logic
│   │   ├── time.js            # Time formatting
│   │   └── timestamps.js      # Timestamp parsing
│   ├── content.css            # Main content styles
│   ├── main.js                # Content script entry point
│   └── transcript-loader.js   # Transcript loading logic
├── history/
│   ├── history.html           # History page
│   └── history.js             # History logic
├── lib/
│   └── marked-loader.js       # Markdown parser loader
├── options/
│   ├── options.html           # Options page
│   ├── options.css            # Options styles
│   └── options.js             # Options logic
├── popup/
│   ├── popup.html             # Extension popup
│   └── popup.js               # Popup logic
├── services/                  # Core services (business logic)
│   ├── api/
│   │   └── invidious.js       # Invidious API client
│   ├── chunking/              # Text chunking for AI
│   │   ├── index.js           # Chunking orchestrator
│   │   ├── segments.js        # Segment chunking
│   │   └── text.js            # Text chunking
│   ├── gemini/                # Gemini AI integration
│   │   ├── prompts/           # Prompt templates
│   │   ├── api.js             # Gemini API client
│   │   ├── index.js           # Gemini service
│   │   ├── models.js          # Model configuration
│   │   ├── prompts.js         # Prompt definitions
│   │   └── streaming-summary.js # Streaming responses
│   ├── segments/              # Segment classification
│   │   ├── classifier.js      # Segment classifier
│   │   ├── gaps.js            # Gap detection
│   │   └── index.js           # Segment service
│   ├── storage/               # Data persistence
│   │   ├── history.js         # History storage
│   │   ├── index.js           # Storage service
│   │   ├── transcript.js      # Transcript cache
│   │   └── video-cache.js     # Video data cache
│   ├── transcript/            # Transcript extraction (NEW)
│   │   ├── strategies/        # Extraction strategies
│   │   │   ├── xhr-strategy.js           # Priority 1
│   │   │   ├── invidious-strategy.js     # Priority 2
│   │   │   ├── youtube-direct-strategy.js # Priority 3
│   │   │   ├── background-proxy-strategy.js # Priority 4
│   │   │   └── dom-strategy.js           # Priority 5
│   │   ├── parsers/           # Format parsers
│   │   │   ├── xml-parser.js  # YouTube XML format
│   │   │   ├── json3-parser.js # YouTube JSON3 format
│   │   │   ├── vtt-parser.js  # WebVTT format
│   │   │   └── events-parser.js # Events format
│   │   ├── cache.js           # Transcript caching
│   │   ├── constants.js       # Constants
│   │   ├── errors.js          # Error definitions
│   │   ├── fetcher.js         # Strategy orchestrator
│   │   ├── formatter.js       # Output formatting
│   │   ├── index.js           # Transcript service
│   │   ├── parser.js          # Parser utilities
│   │   ├── selector.js        # Strategy selection
│   │   ├── types.js           # Type definitions
│   │   └── utils.js           # Utilities
│   └── video/                 # Video utilities
│       ├── detector.js        # Video detection
│       └── player.js          # Player interaction
├── sidepanel/
│   ├── sidepanel.html         # Side panel UI
│   └── sidepanel.js           # Side panel logic
└── manifest.json              # Extension manifest

```

## Transcript Extraction System

### Strategy Pattern Implementation

The transcript extraction system uses a **Strategy Pattern** with **Priority-Based Fallback**:

```
Priority 1: XHR Interceptor (Fastest if available)
Priority 2: Invidious API (Primary - CORS-free, reliable)
Priority 3: YouTube Direct API (Direct timedtext endpoint)
Priority 4: Background Proxy (Service worker fallback)
Priority 5: DOM Parser (ytInitialPlayerResponse)
```

### Method-Specific Parsers

Each extraction method may return different formats:

-   **XML Parser** (`xml-parser.js`) - YouTube timedtext XML format
-   **JSON3 Parser** (`json3-parser.js`) - YouTube JSON3 format
-   **VTT Parser** (`vtt-parser.js`) - WebVTT format (Invidious)
-   **Events Parser** (`events-parser.js`) - ytInitialPlayerResponse events

### Flow Diagram

```
User requests transcript
        ↓
TranscriptExtractor.extract()
        ↓
fetchTranscript() (fetcher.js)
        ↓
Try Strategy 1 (XHR Interceptor)
        ↓ (if fails)
Try Strategy 2 (Invidious API)
        ↓ (if fails)
Try Strategy 3 (YouTube Direct API)
        ↓ (if fails)
Try Strategy 4 (Background Proxy)
        ↓ (if fails)
Try Strategy 5 (DOM Parser)
        ↓ (if fails)
Throw Error: All strategies failed
```

## Segment Classification System

### Segment Categories

1. **Sponsor** - Paid promotions (2 timestamps: start + end)
2. **Interaction Reminder** - Like/Subscribe requests (2 timestamps)
3. **Self Promotion** - Creator's merch/courses (2 timestamps)
4. **Unpaid Promotion** - Charity/shout-outs (2 timestamps)
5. **Highlight** - Core value moment (1 timestamp: start only) ⭐
6. **Preview/Recap** - Teasers/recaps (2 timestamps)
7. **Hook/Greetings** - Intros/outros (2 timestamps)
8. **Tangents/Jokes** - Off-topic content (2 timestamps)

### Critical Rules

-   **ONE HIGHLIGHT ONLY** per video (strictly enforced)
-   Highlight has **1 timestamp** (start only)
-   All other segments have **2 timestamps** (start + end)
-   **Both timestamps are clickable** in UI

### Prompt Engineering

The segment classification prompt (`services/gemini/prompts.js`) enforces:

```javascript
segments: (
    t
) => `Analyze transcript and classify segments. Return ONLY valid JSON array.

CATEGORIES (STRICT):
1. Sponsor - Paid promotions, ad reads, product placements
2. Interaction Reminder - "Like, Subscribe, Hit the Bell" requests
3. Self Promotion - Creator's merch, courses, Patreon
4. Unpaid Promotion - Shout-outs to friends/charities
5. Highlight - Core value moment of video (ONLY ONE PER VIDEO)
6. Preview/Recap - "Coming up" teasers or "Previously on" recaps
7. Hook/Greetings - Generic intros/outros
8. Tangents/Jokes - Off-topic or entertainment filler

CRITICAL RULES:
- There can be ONLY ONE "Highlight" segment per video (the absolute peak moment)
- Highlight has ONE timestamp (start only): {"label":"Highlight","start":120.5,"description":"..."}
- ALL other segments have TWO timestamps (start + end): {"label":"Sponsor","start":10.5,"end":45.2,"description":"..."}
- Both start and end timestamps MUST be clickable in the UI to allow users to jump to segment boundaries
...
`;
```

## Communication Architecture

### Message Passing

```
Content Script ←→ Service Worker ←→ Gemini API
       ↓
   DOM/UI Updates
```

### Message Types

-   `ANALYZE_VIDEO` - Analyze video with AI
-   `FETCH_TRANSCRIPT` - Fetch transcript
-   `FETCH_INVIDIOUS_TRANSCRIPT` - Fetch via Invidious
-   `CLASSIFY_SEGMENTS` - Classify segments
-   `CHAT_WITH_VIDEO` - Chat interaction
-   `SAVE_TO_HISTORY` - Save to history
-   `GET_SETTINGS` - Get user settings

## State Management

### Global State (`content/core/state.js`)

```javascript
export const state = {
    currentVideoId: null,
    currentTranscript: null,
    analysisData: null,
    isAnalyzing: false,
    settings: {},
};
```

### Storage

-   **chrome.storage.sync** - User settings (API key, preferences)
-   **chrome.storage.local** - Cache, history, video data
-   **In-memory cache** - Transcript cache (5 min TTL)

## Performance Optimizations

1. **Caching**

    - Transcript cache: 5 minutes
    - Video data cache: Persistent
    - Instance list cache: 5 minutes

2. **Lazy Loading**

    - Markdown parser loaded on demand
    - Strategies loaded only when needed

3. **Token Efficiency**

    - ~250 lines across 9 files (transcript system)
    - Terse ES6 syntax
    - Minimal comments (only for complex logic)

4. **Timeout Management**
    - 30s timeout per strategy
    - 8-10s timeout per API call
    - Automatic failover

## Security

1. **API Key Storage** - Encrypted in chrome.storage.sync
2. **Input Sanitization** - All user inputs sanitized
3. **CORS Handling** - Service worker proxy for CORS bypass
4. **Content Security Policy** - Strict CSP in manifest

## Testing Strategy

### Unit Testing

-   Test each parser independently
-   Test each strategy independently
-   Mock API responses

### Integration Testing

-   Test strategy fallback chain
-   Test message passing
-   Test UI rendering

### Manual Testing

-   Test on various video types
-   Test with different languages
-   Test with/without captions

## Best Practices

1. **Modularity** - One responsibility per file
2. **Token Efficiency** - Minimize code size
3. **Error Handling** - Descriptive errors, graceful degradation
4. **Logging** - Consistent logging format
5. **Documentation** - README in each major directory

## Future Enhancements

1. **WebSocket Support** - Real-time transcript updates
2. **Offline Mode** - IndexedDB for offline access
3. **Export Formats** - PDF, DOCX, JSON export
4. **Custom Prompts** - User-defined segment categories
5. **Multi-Video Analysis** - Playlist analysis

## Contributing

See `CONTRIBUTING.md` for development guidelines.

## License

MIT License - See `LICENSE` file.
