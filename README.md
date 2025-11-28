# YouTube AI Master

**The Ultimate YouTube AI Companion**

Turn long videos into instant insights. YouTube AI Master uses advanced AI (Gemini) to summarize, segment, and let you chat with any YouTube video.

---

## 🌟 Features

### 🧠 **Summary & Key Insights**
- **Instant Summaries:** Get a concise overview of the video's content in seconds.
- **Key Insights:** Extract the most valuable points, takeaways, and actionable advice.
- **Customizable Length:** Choose between Short, Medium, or Long summaries.

### 💬 **Chat with Video**
- **Interactive Q&A:** Ask questions about the video content and get answers based on the transcript.
- **Context-Aware:** The AI understands the full context of the video.

### 📊 **Segments & Navigation**
- **Smart Segmentation:** Automatically breaks the video into logical chapters with topics.
- **Timeline Integration:** Visual markers on the video player timeline (if supported) to skip to specific sections.
- **Auto-Skip:** Configure the extension to automatically skip sponsors, intros, or interaction reminders.

### 📝 **Transcript & Comments**
- **Full Transcript:** View and search the full video transcript with timestamps.
- **Comment Analysis:** Get a sentiment analysis and summary of what viewers are saying.

### 🎨 **Modern Design & Widget**
- **Sidebar Widget:** Seamlessly integrated into the YouTube interface.
- **Closeable:** Easily hide the widget when not needed.
- **Dark/Light Mode:** Automatically adapts to your system or YouTube theme.

### 🚀 **Performance & Privacy**
- **Efficient:** Optimized for speed and low memory usage.
- **Secure:** Your API keys are stored locally.

---

## 🛠️ Installation

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/yourusername/youtube-ai-master.git
    cd youtube-ai-master
    ```

2.  **Load Unpacked Extension:**
    - Open Chrome and navigate to `chrome://extensions/`.
    - Enable **Developer mode** (toggle in the top right).
    - Click **Load unpacked**.
    - Select the `extension` folder from this repository.

3.  **Configure API Key:**
    - Click the extension icon or the "Settings" button in the widget.
    - Enter your Google Gemini API Key (get one from [Google AI Studio](https://aistudio.google.com/)).
    - Save.

---

## 📚 Code Documentation

The codebase is designed with extreme modularity to ensure debuggability and maintainability. Below is a comprehensive guide to every component in the extension.

### 📂 `extension/background/`
The service worker handles long-running tasks, cross-origin requests, and state management.

-   **`service-worker.js`**: The central hub.
    -   **Proxying:** Handles API requests (Transcript, Metadata, Gemini) to bypass CORS restrictions encountered by content scripts.
    -   **Transcript Strategy:** Implements fallback logic for fetching transcripts (YouTube Direct -> Invidious -> Piped).
    -   **Settings:** Manages retrieval of user settings (`apiKey`, `model`, etc.) from Chrome storage.
    -   **Message Handling:** Listens for `ANALYZE_VIDEO`, `FETCH_TRANSCRIPT`, `OPEN_OPTIONS`, etc.
-   **`security/sender-check.js`**: Verifies that messages originate from trusted parts of the extension.
-   **`security/validator.js`**: Validates the structure and content of incoming messages to prevent injection attacks.

### 📂 `extension/content/`
Scripts injected directly into the YouTube page.

#### **Root Files**
-   **`youtube-extractor.js`**: **Critical Component.** Injected into the "Main World" (page context) to intercept network requests.
    -   **Interception:** Hooks into `window.fetch` to detect `timedtext` (transcript) requests.
    -   **Re-Fetch Logic:** When a transcript URL is detected, it captures it and *explicitly re-fetches* it. This ensures we get a fresh stream of data, solving issues where the original stream was already consumed by YouTube.
    -   **Data Emitter:** Emits events (`transcript`, `metadata`, `comments`) to the extension's isolated world via `window.postMessage`.
-   **`main.js`**: The entry point. Detects if the current page is YouTube, injects the `youtube-extractor.js`, and initializes the UI.
-   **`content.css`**: Contains all the styles for the Sidebar Widget. Uses modern CSS variables for theming (Dark/Light mode) and "glassmorphism" effects.
-   **`transcript-loader.js`**: Legacy loader, now largely delegates to the `TranscriptExtractor` service.

#### **`content/core/`** (Core Logic)
-   **`init.js`**: Orchestrates the startup sequence (Load settings -> Init Observer -> Init UI).
-   **`observer.js`**: Watches for URL changes (SPA navigation) to trigger re-analysis when the user clicks a new video.
-   **`state.js`**: A centralized store for the current video's state (`currentVideoId`, `transcript`, `analysisData`).
-   **`debug.js`**: Utility for consistent logging with prefixes.
-   **`analyzer.js`**: **Legacy entry point** (kept for compatibility). Re-exports functionality from `features/analysis/`.

#### **`content/features/analysis/`** (Analysis Logic)
-   **`index.js`**: Public API for the analysis feature.
-   **`flow.js`**: The main orchestration flow:
    1.  Extract Metadata.
    2.  Extract Transcript.
    3.  Send to AI (Gemini) via background script.
    4.  Render results.
-   **`service.js`**: Handles the communication with the background script for the actual analysis request.

#### **`content/ui/`** (User Interface)
-   **`widget.js`**: Manages the lifecycle of the Sidebar Widget (Injection, Removal, Event Wiring).
-   **`components/widget/structure.js`**: Returns the raw HTML string for the widget structure. Separated for readability.
-   **`tabs.js`**: Handles tab switching logic (Summary vs. Transcript vs. Chat).
-   **`renderers/`**:
    -   **`summary.js`**: Renders the Markdown summary into the UI.
    -   **`transcript.js`**: Renders the interactive transcript list.
    -   **`segments.js`**: Renders video segments/chapters.
    -   **`chat.js`**: Renders the chat interface.

#### **`content/transcript/`**
-   **`extractor.js`**: High-level service to get transcripts. Checks cache first, then tries the `fetcher.js` strategies.

#### **`content/segments/`** (Segments Visualization)
-   **`markers.js`**: Injects visual markers onto the YouTube player timeline.
-   **`timeline.js`**: Renders the custom timeline visualization overlay.
-   **`autoskip.js`**: Logic for automatically skipping unwanted segments (Sponsors, Intros) based on user settings.

#### **`content/metadata/`**
-   **`extractor.js`**: Extracts video metadata (Title, Channel, Duration) from the DOM (`ytInitialPlayerResponse`).

#### **`content/utils/`**
-   **`dom.js`**: Helpers for finding YouTube specific DOM elements (like the secondary column).
-   **`retry.js`**: Utility for retrying async operations with exponential backoff.
-   **`time.js` & `timestamps.js`**: Utilities for parsing and formatting time strings (e.g., "1h 2m 30s" to seconds).

### 📂 `extension/api/`
Unified directory for all external API interactions.

-   **`gemini.js`**: Main entry point for the Gemini AI service. Handles initialization and high-level generation methods.
-   **`api.js`**: The low-level HTTP client for Gemini. Includes a robust SSE (Server-Sent Events) parser for handling streaming responses.
-   **`models.js`**: Manages the list of available Gemini models, caching, and prioritization logic.
-   **`prompts.js`**: Centralized repository of system prompts for Summarization, Chat, FAQ generation, and Sentiment Analysis.
-   **`streaming-summary.js`**: Service for handling streaming AI responses, parsing real-time markdown, and extracting timestamps.
-   **`dearrow.js`**: Client for the DeArrow API (crowdsourced clickbait removal).
-   **`invidious.js`**: Client for Invidious API (transcript fallback).
-   **`piped.js`**: Client for Piped API (metadata/transcript fallback).

### 📂 `extension/services/`
Shared business logic used by both Background and Content scripts.

#### **`services/transcript/`** (The "Brain" of Extraction)
-   **`fetcher.js`**: Orchestrates the **Priority-Based Fallback System**. It tries strategies in this order:
    1.  **YouTube Direct**: Uses the `captions` object found in the player metadata.
    2.  **XHR Interception**: Uses the URL captured by `youtube-extractor.js`.
    3.  **Background Proxy**: Asks the service worker to fetch (bypasses CORS).
    4.  **Invidious**: Tries to fetch from Invidious instances (fallback API).
    5.  **DOM**: Scrapes the interactive transcript panel (last resort).
-   **`strategies/`**: Individual files for each of the above strategies (`youtube-direct-strategy.js`, `xhr-strategy.js`, etc.).

#### **`services/storage/`**
-   **`index.js`**: Wrapper around `chrome.storage.local` to save/load analysis history and user preferences.

#### **`services/chunking/`** (Text Processing)
-   **`index.js`**: Main entry point for splitting large text.
-   **`text.js`**: Splits long transcripts into overlapping chunks to fit within AI context windows.
-   **`segments.js`**: Helper to chunk segment objects while preserving boundary integrity.

#### **`services/segments/`** (Classification Logic)
-   **`classifier.js`**: Uses Gemini to classify transcript segments into categories (Content, Sponsor, Self-Promo).
-   **`rule-engine.js`**: Heuristic-based pre-classification (e.g., detecting "Thanks to our sponsor" keywords).
-   **`index.js`**: Coordinates the classification pipeline.

### 📂 `extension/sidepanel/`
Code for the browser sidepanel (if used instead of the injected widget).
-   **`sidepanel.html`**: HTML structure.
-   **`sidepanel.js`**: Logic for the sidepanel UI (similar to `content/ui/widget.js` but for the native sidebar).

### 📂 `extension/options/`
Settings page.
-   **`options.html`**: Structure of the settings page.
-   **`options.js`**: Saves user preferences (API key, skip settings) to Chrome storage.

### 📂 `extension/popup/`
Extension popup (toolbar icon).
-   **`popup.html`**: Simple status view.
-   **`popup.js`**: Displays current status or quick links to options.

---

## 🧪 Debugging Guide

1.  **Open Developer Tools**: Right-click anywhere on the YouTube page -> Inspect.
2.  **Console Logs**: Look for logs prefixed with:
    -   `[YouTubeExtractor]`: Network interception logs (Main World).
    -   `[Transcript]`: Transcript fetching strategy logs.
    -   `[Fetcher]`: Detailed fallback attempts.
3.  **Network Tab**: Filter by `timedtext` to see raw transcript requests.
4.  **Breakpoints**:
    -   To debug interception: `extension/content/youtube-extractor.js`.
    -   To debug analysis flow: `extension/content/features/analysis/flow.js`.

---

## 📜 License

MIT License. See [LICENSE](LICENSE) for details.
