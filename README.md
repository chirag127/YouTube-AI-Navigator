# YouTube AI Navigator

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-blue?logo=google-chrome)](https://chrome.google.com/webstore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Privacy First](https://img.shields.io/badge/Privacy-First-brightgreen)](PRIVACY.md)

**Your intelligent guide through the YouTube universe.**

Navigate YouTube smarter with AI-powered insights, smart segmentation, and instant context from 10+ data sources. Free, private, and zero-config.

---

## 🎯 The Vision

YouTube AI Navigator transforms passive video consumption into active intelligence gathering. While other extensions simply wrap an LLM in a browser popup, we've engineered a **Context Engine**—a sophisticated orchestration layer that autonomously queries 10+ specialized APIs in parallel, synthesizing external knowledge into a unified context window that empowers Google's Gemini AI to deliver analysis rivaling human expert commentary.

**The Result:** Instant, deep, context-aware insights for any video. Zero cost. Zero friction. Zero compromise.

---

## 🚀 Installation & Setup

### 1. Install the Extension

> **Note:** This extension is currently in development and not yet published to the Chrome Web Store. Follow the Developer Mode installation instructions below to use it now.

**Developer Mode Installation (Current Method)**

Since the extension is not yet available on the Chrome Web Store, you'll need to load it manually using Chrome's Developer Mode:

**Step 1: Download the Source Code**

```bash
git clone https://github.com/chirag127/YouTube-AI-Navigator.git
cd YouTube-AI-Navigator
```

Alternatively, download the repository as a ZIP file from GitHub and extract it to a folder on your computer.

**Step 2: Install Dependencies & Build**

```bash
npm install
```

This will:

-   Install YouTube.js (InnerTube API client)
-   Install build tools
-   Automatically bundle YouTube.js to `extension/lib/youtubei.js`

**Step 3: Enable Developer Mode in Chrome**

1. Open Google Chrome
2. Navigate to `chrome://extensions/` (or click the three-dot menu → Extensions → Manage Extensions)
3. In the top-right corner, toggle **Developer mode** ON (the switch will turn blue)

**Step 4: Load the Extension**

1. Click the **Load unpacked** button that appears after enabling Developer mode
2. Navigate to the `extension` folder inside the repository
3. Select the `extension` folder (not the root folder)
4. Click **Select Folder**

**Step 4: Complete the Setup Wizard**

After installation, the extension will automatically open a **guided onboarding flow** that walks you through:

1. **Welcome Screen** - Overview of features and capabilities
2. **API Key Setup** - Step-by-step guide to get your free Google Gemini API key
    - Direct link to [Google AI Studio API Key page](https://aistudio.google.com/app/apikey)
    - Built-in connection tester to verify your key works
    - Option to skip and configure later
3. **Basic Configuration** - Set your preferences:
    - Output language for AI responses
    - Auto-analyze videos on page load
    - Enable segment detection
4. **Completion** - Quick start guide and next steps

**The onboarding wizard ensures you're ready to use the extension immediately with zero confusion.**

**Developer Mode Limitations**

-   Chrome may display warnings about running extensions in developer mode
-   The extension will be disabled if you restart Chrome with developer mode turned off
-   You'll need to manually update the extension by pulling the latest code from GitHub

**Updating the Extension**

To update to the latest version:

```bash
cd YouTube-AI-Navigator
git pull origin main
```

Then click the refresh icon on the extension card in `chrome://extensions/`.

**From Chrome Web Store** _(Coming Soon)_

Once published, you'll be able to install directly from the Chrome Web Store:

1. Search for "YouTube AI Navigator" in the Chrome Web Store
2. Click "Add to Chrome"
3. The onboarding wizard will launch automatically on first install
4. Automatic updates will be handled by Chrome

### 2. Manual Configuration (If You Skipped Onboarding)

If you skipped the onboarding wizard, you can configure your API key manually:

**Required: Google Gemini API Key**

1. Visit [Google AI Studio API Key Page](https://aistudio.google.com/app/apikey)
2. Click "Create API Key" (or "Get API Key")
3. Copy the generated key
4. Open the extension settings:
    - Click the extension icon in your toolbar
    - Click "Settings" button, OR
    - Click "Start Setup Guide" if you haven't configured yet
5. Paste your API key in the "Gemini API Key" field
6. Click "Test Connection" to verify it works
7. Click "Save"

**The extension is now fully functional.** All other API keys are optional enhancements.

**Re-run Onboarding**

If you want to see the setup wizard again:

-   Click the extension icon → "Start Setup Guide"
-   Or open Settings and click "Start Setup" in the welcome banner

### 3. Optional: Enhance with Additional APIs

For deeper contextual analysis, configure optional API keys:

**TMDB (Movies & TV)**

-   Visit [TMDB API](https://www.themoviedb.org/settings/api)
-   Register for a free account
-   Copy your API key (v3 auth)

**IGDB (Gaming)**

-   Visit [Twitch Developers](https://dev.twitch.tv/console/apps)
-   Create an application
-   Copy Client ID and Client Secret

**NewsData.io (News)**

-   Visit [NewsData.io](https://newsdata.io/register)
-   Register for free tier (200 requests/day)
-   Copy your API key

**Google Fact Check API**

-   Visit [Google Cloud Console](https://console.cloud.google.com/)
-   Enable Fact Check Tools API
-   Create credentials (API key)

All other services (Semantic Scholar, Open Library, Wikidata, Datamuse, OpenMeteo, MusicBrainz, Genius) require **no API keys** and work out of the box.

---

## ✨ Core Capabilities

### 🧭 Intelligent Navigation

**Smart Segmentation**
The AI automatically partitions videos into logical chapters, identifying:

-   Content segments (intro, main content, outro)
-   Sponsor segments (with SponsorBlock integration)
-   Interaction reminders (like, subscribe, notifications)

| Domain        | Service           | Purpose                                     | API Key Required |
| ------------- | ----------------- | ------------------------------------------- | ---------------- |
| **AI Core**   | Google Gemini     | Natural language understanding & generation | ✅ Required      |
| Movies/TV     | TMDB              | Film & television metadata, cast, reviews   | ⚪ Optional      |
| Gaming        | IGDB (Twitch)     | Video game data, genres, platforms          | ⚪ Optional      |
| News          | NewsData.io       | Breaking news, current events               | ⚪ Optional      |
| Fact-Checking | Google Fact Check | Claim verification, source validation       | ⚪ Optional      |
| Academic      | Semantic Scholar  | Research papers, citations, authors         | ⚫ No Key Needed |
| Books         | Open Library      | Book metadata, authors, editions            | ⚫ No Key Needed |
| Knowledge     | Wikidata          | Structured knowledge graph                  | ⚫ No Key Needed |
| Language      | Datamuse          | Word associations, rhymes, definitions      | ⚫ No Key Needed |
| Weather       | OpenMeteo         | Weather data, forecasts                     | ⚫ No Key Needed |
| Music         | MusicBrainz       | Artist info, albums, releases               | ⚫ No Key Needed |
| Lyrics        | Genius            | Song lyrics, annotations                    | ⚫ No Key Needed |
| Transcripts   | Invidious/Piped   | Privacy-friendly YouTube frontends          | ⚫ No Key Needed |
| Segments      | SponsorBlock      | Community-verified video segments           | ⚫ No Key Needed |
| Titles        | DeArrow           | Crowdsourced clickbait-free titles          | ⚫ No Key Needed |

**Graceful Degradation**
Every external API is treated as **optional**. If a service is unavailable or an API key is missing, the system silently skips that data source and continues. The extension works perfectly with just a Gemini API key—additional services simply enhance the depth of analysis.

**Multi-Model Support**

-   Gemini 1.5 Flash (fast, cost-effective)
-   Gemini 1.5 Pro (deeper reasoning)
-   Gemini 2.0 Flash (latest experimental)
-   Automatic fallback if primary model fails

### 📊 Analysis Features

**Comprehensive Summaries**

-   Configurable length (brief, standard, detailed)
-   Multi-language output (50+ languages)
-   Markdown formatting with structure
-   Key points extraction
-   Timestamp references

**Interactive Chat**

-   Ask follow-up questions about the video
-   Context-aware responses using video transcript
-   Multi-turn conversations with memory
-   Code explanation for programming tutorials
-   Fact-checking for news content

**Comment Analysis**

-   Sentiment analysis of top comments
-   Common themes and reactions
-   Controversial topics identification
-   Community consensus detection

---

## 🏗️ Engineering Excellence

### Unbreakable UI Architecture

The user interface is engineered to survive the hostile environment of modern web applications:

**Self-Healing DOM Injection**
A dedicated `MutationObserver` monitors the YouTube sidebar 60 times per second. If the AI Widget is displaced, covered, or removed by YouTube's dynamic navigation, it is instantly re-injected at the top of the sidebar.

**Z-Index Supremacy**
Calculated stacking context (`z-index: 2202`) ensures the widget floats above all YouTube native elements, including playlists, transcripts, and advertisements.

**SPA-Aware Navigation**
The extension listens to YouTube's internal `yt-navigate-finish` events, handling soft navigations seamlessly without page reloads.

### Production-Grade Reliability

**Exponential Backoff Retry**

-   Automatically retries transient failures (rate limits, server errors, timeouts)
-   Configurable retry attempts with exponential delays (1s → 2s → 4s)
-   Fails fast on non-retryable errors (authentication, bad requests)

**Rate Limiting**

-   Token bucket algorithm prevents exceeding API limits
-   Gemini free tier: 15 requests per minute (RPM)
-   Request queuing when limit reached
-   Real-time statistics tracking

**Timeout Protection**

-   All API calls have configurable timeouts (default 30s)
-   Prevents hanging requests from blocking the extension
-   Uses `AbortController` for clean cancellation

**Error Classification**

-   Distinguishes between retryable and fatal errors
-   Provides user-friendly, actionable error messages
-   Structured logging for debugging

### Performance Optimizations

**Parallel Execution**
Context Manager fetches 10+ APIs simultaneously using `Promise.allSettled`, ensuring zero latency impact from sequential operations.

**Request Caching**
Previously analyzed videos return instantly from local storage, eliminating redundant API calls.

**Service Worker Keep-Alive**
Prevents Chrome from terminating the background script during long operations, ensuring uninterrupted analysis.

**Model Fallback**
Automatically tries alternative Gemini models if the primary model fails, maximizing success rate.

### Security & Validation

**Input Sanitization**
All external data is validated and sanitized at entry points, preventing injection attacks.

**Sender Verification**
Message handlers verify sender origin, accepting only messages from extension pages.

**API Key Protection**
Keys are stored securely in Chrome's sync storage, never logged or transmitted except to official endpoints.

**Minimal Permissions**
The extension requests only the `storage` permission. No access to browsing history, tabs, or personal data.

---

## 🎮 Usage Guide

### Basic Workflow

1. **Navigate to any YouTube video**
2. **The AI Widget appears** in the right sidebar
3. **Click "Analyze Video"** to generate insights
4. **View the analysis** with timestamps, key points, and context
5. **Ask follow-up questions** in the chat interface
6. **Click segment markers** on the timeline to jump to specific sections

### Advanced Features

**Auto-Analysis**
Enable "Auto-analyze on page load" in settings to automatically analyze every video you watch.

**Auto-Skip**
Configure per-category auto-skip rules:

-   Skip sponsors automatically
-   Skip intros/outros
-   Skip interaction reminders
-   Skip self-promotion

**Auto-Liker**
Automate your engagement:

-   **Watch Threshold**: Set percentage (0-100%) of video to watch before liking
-   **Live Streams**: Option to include/exclude live streams
-   **Subscription Logic**: Option to only like videos from subscribed channels

**Custom Prompts**
Modify the AI prompt template in settings to customize analysis style and focus areas.

**Export History**
Export your analysis history as JSON for backup or migration.

**Multi-Language**
Set your preferred output language in settings. The AI will respond in your chosen language regardless of the video's original language.

---

## 🔒 Privacy & Data Handling

YouTube AI Navigator is designed with **privacy-first principles**:

### Data Storage

**Local Storage Only**

-   All data is stored in Chrome's local storage on your device
-   Video analysis, transcripts, and chat history never leave your browser
-   No external databases or cloud storage

**Sync Storage for Settings**

-   API keys and preferences are stored in Chrome's sync storage
-   Synced across your Chrome browsers (if signed in)
-   Encrypted by Chrome's built-in sync encryption

### Data Transmission

**API Keys**

-   Stored securely in Chrome sync storage
-   Transmitted only to official API endpoints over HTTPS
-   Never logged, never shared with third parties

**Video Data**

-   Video IDs and metadata are sent to configured APIs for analysis
-   Transcript data is sent to Gemini AI for processing
-   No personal information (browsing history, identity) is transmitted

**No Tracking**

-   No analytics
-   No telemetry
-   No user tracking
-   No advertisements

### Permissions Explained

The extension requests only **one permission**:

**`storage`** - Required to:

-   Save your API keys securely
-   Cache video analysis for instant retrieval
-   Store your preferences and settings
-   Maintain chat history

**No other permissions are requested.** The extension cannot:

-   Access your browsing history
-   Read data from other websites
-   Track your activity
-   Access your personal information

For complete details, see [PRIVACY.md](PRIVACY.md).

---

## 🛠️ Architecture Deep Dive

### Modular Design Pattern

The codebase strictly adheres to the **Single Responsibility Principle** with maximum modularity:

```
extension/
├── api/                    # External API integrations (isolated, fault-tolerant)
│   ├── core/              # Shared infrastructure (HTTP client, rate limiter, error handler)
│   ├── gemini.js          # Gemini AI integration
│   ├── tmdb.js            # TMDB API wrapper
│   ├── igdb.js            # IGDB API wrapper
│   └── ...                # 15+ API wrappers
├── background/            # Service worker (Manifest V3)
│   ├── handlers/          # Message handlers (analyze, transcribe, settings)
│   ├── security/          # Input validation, sender verification
│   └── utils/             # API key management, keep-alive
├── content/               # Content scripts (YouTube page injection)
│   ├── ui/                # Widget, timeline, markers, legend
│   ├── segments/          # Segment detection, auto-skip, timeline
│   └── transcript/        # Transcript extraction strategies
├── services/              # Business logic (context manager, storage, segments)
│   ├── context-manager.js # Orchestrates parallel API calls
│   ├── storage/           # Video cache, history, transcript storage
│   └── segments/          # Rule engine, classification, detection
├── options/               # Settings page
├── popup/                 # Extension popup
├── sidepanel/             # Side panel (chat interface)
└── utils/                 # Shared utilities (shortcuts, logging)
```

### Concurrency Model

**Context Manager** (`services/context-manager.js`)
Orchestrates parallel data gathering:

```javascript
const results = await Promise.allSettled([
    fetchFromTMDB(title),
    fetchFromIGDB(title),
    fetchFromNewsData(title),
    fetchFromSemanticScholar(title),
    fetchFromWikidata(title),
    // ... 10+ concurrent requests
]);
```

Each API call is wrapped in a fault-tolerant wrapper that:

1. Checks if API key exists (if required)
2. Executes the request with timeout
3. Retries on transient failures
4. Returns `null` on error (graceful degradation)
5. Never throws exceptions that would break the entire flow

### Transcript Extraction Strategies

The extension employs multiple strategies to extract video transcripts, attempting each in sequence until one succeeds:

1. **YouTube Direct Strategy** - Extracts from YouTube's internal API
2. **DOM Strategy** - Parses transcript from YouTube's DOM
3. **XHR Interception Strategy** - Intercepts YouTube's network requests
4. **Invidious Strategy** - Fetches from Invidious API
5. **Piped Strategy** - Fetches from Piped API

This multi-strategy approach ensures maximum reliability across different video types and YouTube UI variations.

### Segment Classification

**Rule Engine** (`services/segments/rule-engine.js`)
Classifies video segments using pattern matching:

-   **Sponsor Detection** - Keywords: "sponsor", "promo code", "discount"
-   **Intro Detection** - First 30 seconds, common intro patterns
-   **Outro Detection** - Last 30 seconds, "thanks for watching"
-   **Interaction Reminder** - "like", "subscribe", "notification bell"
-   **Self Promotion** - Creator's own products/services
-   **Unpaid Promotion** - Charity, friend shout-outs

Rules are modular and extensible. New rules can be added without modifying core logic.

---

## 🤝 Contributing

Contributions are welcome! This project follows elite engineering standards:

### Code Quality Standards

-   **Modularity**: One class/function per file (Single Responsibility Principle)
-   **Conciseness**: Minimal tokens, modern syntax, no verbose comments
-   **Error Handling**: Zero-failure tolerance, graceful degradation
-   **Logging**: Comprehensive logging for debugging
-   **Documentation**: Inline JSDoc for complex algorithms

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Testing

-   Manual testing on YouTube videos of various types
-   Verify graceful degradation when APIs fail
-   Test with and without API keys
-   Validate UI responsiveness and self-healing

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

Built with ❤️ for the open-source community.

---

## 🙏 Acknowledgments

**APIs & Services**

-   [Google Gemini](https://ai.google.dev/) - AI foundation
-   [TMDB](https://www.themoviedb.org/) - Movie & TV data
-   [IGDB](https://www.igdb.com/) - Gaming data
-   [NewsData.io](https://newsdata.io/) - News aggregation
-   [Semantic Scholar](https://www.semanticscholar.org/) - Academic research
-   [Open Library](https://openlibrary.org/) - Book data
-   [Wikidata](https://www.wikidata.org/) - Knowledge graph
-   [MusicBrainz](https://musicbrainz.org/) - Music metadata
-   [Genius](https://genius.com/) - Lyrics & annotations
-   [Invidious](https://invidious.io/) - Privacy-friendly YouTube frontend
-   [Piped](https://piped.video/) - Privacy-friendly YouTube frontend
-   [SponsorBlock](https://sponsor.ajay.app/) - Community segment database
-   [DeArrow](https://dearrow.ajay.app/) - Crowdsourced titles

**Inspiration**
This extension stands on the shoulders of giants in the YouTube enhancement ecosystem, including SponsorBlock, Return YouTube Dislike, and Enhancer for YouTube.

---

## 📞 Support

**Issues & Bug Reports**
[GitHub Issues](https://github.com/chirag127/YouTube-AI-Navigator/issues)

**Feature Requests**
[GitHub Discussions](https://github.com/chirag127/YouTube-AI-Navigator/discussions)

**Security Vulnerabilities**
Please report security issues privately to the repository owner.

---

**Navigate smarter. Watch better. YouTube AI Navigator.**
