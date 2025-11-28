# YouTube AI Master

**The Definitive AI Companion for YouTube.**

_Turn passive viewing into active intelligence. YouTube AI Master orchestrates a symphony of advanced AI and real-time data sources to deliver instant, deep, and context-aware insights for any video._

---

## 💎 The Philosophy of Excellence

YouTube AI Master is not just another wrapper around an LLM. It is a **Context Engine**.

We believe that an AI is only as good as the data it consumes. A generic prompt yields a generic response. To achieve true insight, an AI must understand the world surrounding the video—the cultural references, the scientific facts, the gaming lore, and the breaking news.

This extension implements a **Multi-Threaded Context Architecture** that autonomously queries up to **10+ specialized, free-to-use APIs** in parallel. It weaves this external knowledge into a unified context window, empowering Google's Gemini 1.5 Pro/Flash to deliver analysis that rivals human expert commentary.

**Zero Cost. Zero Friction. Zero Compromise.**
Every integrated API is free. No credit cards required. No mandatory sign-ups. Complete privacy.

---

## 🌟 Core Capabilities

### 🧠 **The Context Engine (New)**

The heart of the system. When you open a video, the engine analyzes the metadata and instantly dispatches parallel agents to gather verified facts:

-   **Cinema & TV:** Fetches cast, plot, and ratings from **TMDB**.
-   **Music:** Retrieves artist discography and release data from **MusicBrainz**.
-   **Gaming:** Pulls game details, ratings, and platforms from **IGDB**.
-   **Science & Academia:** Cross-references papers and citations via **Semantic Scholar** and **Open Library**.
-   **News & Politics:** Verifies claims using **Google Fact Check Tools** and **NewsData.io**.
-   **General Knowledge:** Consults **Wikidata** and **Datamuse** for entity resolution.
-   **Environment:** Checks location-based context via **OpenMeteo**.

### ⚡ **Instant Intelligence**

-   **Deep Summarization:** Beyond simple bullet points. Get structured breakdowns with "Key Insights," "Technical Analysis," and "Actionable Takeaways."
-   **Interactive Chat:** Have a conversation with the video. Ask about specific details, timestamps, or external references.
-   **Sentiment Analysis:** Understand the audience pulse with AI-driven comment analysis.

### 🎯 **Precision Navigation**

-   **Smart Segmentation:** The AI automatically partitions the video into logical chapters.
-   **SponsorBlock Integration:** Native support for community-verified segments. Automatically skip sponsors, intros, and interaction reminders.
-   **Visual Timeline:** See the video's structure at a glance with color-coded markers on the player.

### 🛡️ **Privacy & Performance**

-   **Local-First:** Your API keys are stored in Chrome's secure sync storage. They never leave your browser except to hit the official endpoints.
-   **Concurrency:** Uses `Promise.allSettled` to fetch data from 10+ sources simultaneously, ensuring zero latency impact.
-   **Fault Tolerance:** If an API fails or a key is missing, the system gracefully degrades, skipping only that specific data point without interrupting the user experience.

---

## 🛠️ Configuration & Setup

### 1. Installation

1.  Clone this repository:
    ```bash
    git clone https://github.com/chirag127/youtube-ai-master.git
    ```
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Enable **Developer mode** (top right).
4.  Click **Load unpacked** and select the `extension` folder.

### 2. The "Context Engine" Setup (Optional but Recommended)

Go to the **Extension Settings > External APIs** tab. All keys are for **Free Tier** plans.

| Category    | Service           | Requirement  | Cost |
| :---------- | :---------------- | :----------- | :--- |
| **AI Core** | **Google Gemini** | **Required** | Free |
| Movies/TV   | TMDB              | Optional     | Free |
| Gaming      | IGDB (Twitch)     | Optional     | Free |
| News        | NewsData.io       | Optional     | Free |
| Fact Check  | Google Cloud      | Optional     | Free |
| Science     | Semantic Scholar  | **No Key**   | Free |
| Books       | Open Library      | **No Key**   | Free |
| Knowledge   | Wikidata          | **No Key**   | Free |
| Language    | Datamuse          | **No Key**   | Free |
| Weather     | OpenMeteo         | **No Key**   | Free |

_Note: The extension works perfectly with just the Gemini Key. The other APIs simply enhance the depth of the analysis._

---

## 🏗️ Architecture of Excellence

The codebase is engineered for scale, readability, and maintainability.

### **Modular Design Pattern**

We strictly adhere to the **Single Responsibility Principle**.

-   **`extension/api/`**: Contains isolated, fault-tolerant wrappers for each external service (`tmdb.js`, `musicbrainz.js`, etc.).
-   **`extension/services/context-manager.js`**: The orchestrator. It uses heuristics to determine _intent_ (e.g., "Is this a movie review?") and selectively activates the relevant API agents.
-   **`extension/background/handlers/analyze-video.js`**: The main pipeline. It fuses the Transcript, Metadata, SponsorBlock segments, and External Context into a massive prompt payload for Gemini.

### **Robust Error Handling**

-   **Graceful Degradation:** The application assumes every network request might fail. It wraps every call in safe handlers that log errors without crashing the UI.
-   **Input Sanitization:** All external data is treated as untrusted and sanitized before being injected into the prompt or DOM.

### **Future-Proofing**

-   **Manifest V3 Compliant:** Built entirely on the new Service Worker architecture.
-   **Model Agnostic:** The `ModelManager` is designed to support future Gemini iterations (Flash, Pro, Ultra) instantly.

---

## 📜 License

MIT License. Built with ❤️ for the Open Source community.
