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

## 📂 Project Structure

This project follows a highly modular architecture for maximum maintainability and debuggability.

```
extension/
├── background/         # Service worker (background processes)
├── content/            # Scripts injected into YouTube
│   ├── core/           # Core logic (state, observer)
│   ├── features/       # Feature-specific logic (analysis, summary)
│   ├── handlers/       # DOM event handlers
│   ├── metadata/       # Metadata extraction
│   ├── segments/       # Video segmentation logic
│   ├── transcript/     # Transcript fetching services
│   ├── ui/             # UI components and renderers
│   └── youtube-extractor.js # Main world script for intercepting network requests
├── options/            # Options page
├── popup/              # Popup UI
├── sidepanel/          # Sidepanel UI
├── services/           # Shared services (Gemini, Storage)
└── manifest.json       # Extension manifest
```

---

## 🧪 Development & Debugging

- **Modular Code:** Logic is split into small, focused files (e.g., `features/analysis/`, `ui/components/`).
- **Network Interception:** The `YouTubeExtractor` (injected into the main world) captures `timedtext` requests to ensure transcripts are always available, even if the initial request stream was consumed.
- **Debug Logs:** Check the Chrome DevTools console for `[YouTubeExtractor]` or `[YouTube AI Master]` logs.

---

## 📜 License

MIT License. See [LICENSE](LICENSE) for details.
