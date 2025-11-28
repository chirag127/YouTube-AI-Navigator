import { ChunkingService } from "../services/chunking/index.js";
import { GeminiService } from "../api/gemini.js";
import { SegmentClassificationService } from "../services/segments/index.js";
import { StorageService } from "../services/storage/index.js";
import { parseMarkdown } from "../lib/marked-loader.js";
const ss = new StorageService(),
    cs = new ChunkingService();
let gs = null,
    scs = null,
    ctx = "",
    segs = [];
const ab = document.getElementById("analyze-btn"),
    st = document.getElementById("status"),
    aw = document.getElementById("auth-warning"),
    tbs = document.querySelectorAll(".tab-btn"),
    tcs = document.querySelectorAll(".tab-content"),
    sc = document.getElementById("summary-content"),
    ic = document.getElementById("insights-content"),
    tc = document.getElementById("transcript-container"),
    ci = document.getElementById("chat-input"),
    csb = document.getElementById("chat-send-btn"),
    ch = document.getElementById("chat-history");
document.addEventListener("DOMContentLoaded", async () => {
    const { geminiApiKey } = await chrome.storage.local.get("geminiApiKey");
    if (!geminiApiKey) {
        aw.style.display = "block";
        ab.disabled = true;
        return;
    }
    gs = new GeminiService(geminiApiKey);
    scs = new SegmentClassificationService(gs, cs);
    try {
        await gs.fetchAvailableModels();
    } catch (e) {}
    for (const b of tbs) {
        b.addEventListener("click", () => {
            for (const x of tbs) x.classList.remove("active");
            for (const x of tcs) x.classList.remove("active");
            b.classList.add("active");
            document
                .getElementById(`${b.getAttribute("data-tab")}-tab`)
                .classList.add("active");
        });
    }
    csb.addEventListener("click", handleChat);
    ci.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleChat();
        }
    });

    // Handle timestamp clicks in summary/insights
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("timestamp-btn")) {
            const timeStr = e.target.getAttribute("data-time");
            if (timeStr) {
                const parts = timeStr.split(":").map(Number);
                let seconds = 0;
                if (parts.length === 3)
                    seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
                else if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
                seekVideo(seconds);
            }
        }
    });
});
async function handleChat() {
    const q = ci.value.trim();
    if (!q) return;
    if (!ctx) {
        appendMsg(
            "ai",
            "Please analyze a video first so I have context to answer your question."
        );
        return;
    }
    appendMsg("user", q);
    ci.value = "";
    const lid = appendMsg("ai", "Thinking...");
    try {
        const a = await gs.chatWithVideo(q, ctx);
        await updateMsg(lid, a);
    } catch (e) {
        await updateMsg(lid, `Error: ${e.message}`);
    }
}
function appendMsg(r, t) {
    const d = document.createElement("div");
    d.className = `chat-message ${r}`;
    d.id = `msg-${Date.now()}`;
    d.textContent = t;
    ch.appendChild(d);
    ch.scrollTop = ch.scrollHeight;
    return d.id;
}
async function updateMsg(id, t) {
    const d = document.getElementById(id);
    if (d) {
        d.innerHTML = await parseMarkdown(t);
        ch.scrollTop = ch.scrollHeight;
    }
}
ab.addEventListener("click", () => analyzeVideo());

async function analyzeVideo(retryCount = 0) {
    const maxRetries = 2;
    try {
        setStatus("loading", "Fetching video info...");
        ab.disabled = true;
        showLoadingState();

        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        if (!tab || !tab.url.includes("youtube.com/watch")) {
            throw new Error("Please open a YouTube video page.");
        }

        const u = new URLSearchParams(new URL(tab.url).search),
            v = u.get("v");
        if (!v) throw new Error("Could not find Video ID.");

        // Fetch metadata with retry
        setStatus("loading", "Fetching video metadata...");
        let md;
        try {
            const mr = await sendMessageWithRetry(
                tab.id,
                { action: "GET_METADATA", videoId: v },
                3
            );
            if (mr.error) throw new Error(mr.error);
            md = mr.metadata;
        } catch (e) {
            console.warn("Metadata fetch failed, using fallback:", e);
            md = {
                title: "Unknown Title",
                author: "Unknown Channel",
                videoId: v,
            };
        }

        // Fetch transcript
        setStatus("loading", "Fetching transcript...");
        const tr = await sendMessageWithRetry(
            tab.id,
            { action: "GET_TRANSCRIPT", videoId: v },
            2
        );

        if (tr.error) {
            if (tr.error.includes("does not have captions")) {
                showError(
                    "No Captions Available",
                    "This video does not have captions/subtitles. Please try a different video that has closed captions enabled."
                );
            } else {
                showError("Transcript Error", tr.error);
            }
            return;
        }

        const ts = tr.transcript;
        if (!ts || ts.length === 0) {
            throw new Error(
                "Transcript is empty. Please try a different video."
            );
        }

        ctx = ts.map((s) => s.text).join(" ");
        if (!ctx.trim()) {
            throw new Error(
                "Transcript text is empty. Please try a different video or language."
            );
        }

        // Classify segments
        setStatus("loading", "Classifying segments...");
        try {
            const cls = await scs.classifyTranscript(ts);
            segs = cls;
            renderTranscript(cls);
            chrome.tabs
                .sendMessage(tab.id, { action: "SHOW_SEGMENTS", segments: cls })
                .catch((e) => console.warn("Failed to send segments:", e));
        } catch (e) {
            console.warn("Segment classification failed:", e);
            renderTranscript(ts.map((t) => ({ ...t, label: null })));
        }

        // Generate analysis
        const opts = await chrome.storage.local.get([
            "summaryLength",
            "targetLanguage",
        ]);
        const so = {
            length: opts.summaryLength || "Medium",
            language: opts.targetLanguage || "English",
        };

        setStatus("loading", "Generating summary...");
        const an = await gs.generateComprehensiveAnalysis(ctx, so);
        await renderMd(an.summary, sc);

        // Analyze comments
        setStatus("loading", "Analyzing comments...");
        const cr = await chrome.tabs
            .sendMessage(tab.id, { action: "GET_COMMENTS" })
            .catch(() => ({ comments: [] }));
        const cms = cr?.comments || [];

        let ca = "No comments available to analyze.";
        if (cms.length > 0) {
            try {
                ca = await gs.analyzeCommentSentiment(cms);
            } catch (e) {
                console.warn("Comment analysis failed:", e);
                ca = "Failed to analyze comments.";
            }
        }

        const insightsHtml = await parseMarkdown(an.insights);
        const commentsHtml = await parseMarkdown(ca);
        const faqHtml = await parseMarkdown(an.faq);
        const ih = `<h3>Key Insights</h3>${insightsHtml}<hr style="border:0;border-top:1px solid var(--border-color);margin:20px 0;"><h3>Comments Analysis</h3>${commentsHtml}<hr style="border:0;border-top:1px solid var(--border-color);margin:20px 0;"><h3>Frequently Asked Questions</h3>${faqHtml}`;
        ic.innerHTML = ih;

        setStatus("success", "✓ Analysis complete!");

        // Save to history
        try {
            await ss.saveTranscript(v, md, ts, an.summary);
        } catch (e) {
            console.warn("Failed to save to history:", e);
        }
    } catch (e) {
        console.error("Analysis error:", e);

        // Retry logic for network errors
        if (
            retryCount < maxRetries &&
            (e.message.includes("fetch") || e.message.includes("network"))
        ) {
            console.log(`Retrying... (${retryCount + 1}/${maxRetries})`);
            await new Promise((r) => setTimeout(r, 1000 * (retryCount + 1)));
            return analyzeVideo(retryCount + 1);
        }

        showError("Analysis Failed", e.message);
    } finally {
        ab.disabled = false;
    }
}

async function sendMessageWithRetry(tabId, message, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await chrome.tabs.sendMessage(tabId, message);
            return response;
        } catch (e) {
            if (i === maxRetries - 1) throw e;
            await new Promise((r) => setTimeout(r, 500 * (i + 1)));
        }
    }
}

function setStatus(type, text) {
    st.className = type;
    if (type === "loading") {
        st.innerHTML = `<span class="spinner"></span>${text}`;
    } else {
        st.textContent = text;
    }
}

function showLoadingState() {
    sc.innerHTML =
        '<div class="empty-state"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg><p class="empty-state-title">Generating summary...</p></div>';
    ic.innerHTML =
        '<div class="empty-state"><svg viewBox="0 0 24 24"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/></svg><p class="empty-state-title">Generating insights...</p></div>';
    tc.innerHTML =
        '<div class="empty-state"><svg viewBox="0 0 24 24"><path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z"/></svg><p class="empty-state-title">Loading transcript...</p></div>';
}

function showError(title, message) {
    const errorHtml = `
    <div class="error-container">
      <svg class="error-icon" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      <h3 class="error-title">${title}</h3>
      <p class="error-message">${message}</p>
      <button class="retry-btn" onclick="document.getElementById('analyze-btn').click()">Try Again</button>
    </div>
  `;
    sc.innerHTML = errorHtml;
    setStatus("error", `Error: ${title}`);
}
async function renderMd(t, el) {
    el.innerHTML = await parseMarkdown(t);
}
function renderTranscript(sg) {
    tc.innerHTML = "";
    for (const s of sg) {
        const d = document.createElement("div");
        d.className = `transcript-segment ${getSgClass(s.label)}`;
        const tm = document.createElement("span");
        tm.className = "timestamp";
        tm.textContent = fmtTime(s.start);
        const tx = document.createElement("span");
        tx.className = "text";
        tx.textContent = s.text;
        if (s.label) {
            const lb = document.createElement("span");
            lb.className = "segment-label";
            lb.textContent = s.label;
            lb.title = getSgDesc(s.label);
            d.appendChild(lb);
        }
        d.appendChild(tm);
        d.appendChild(tx);
        d.addEventListener("click", () => seekVideo(s.start));
        tc.appendChild(d);
    }
}
function getSgClass(l) {
    const m = {
        Sponsor: "segment-sponsor",
        "Interaction Reminder": "segment-interaction",
        "Self Promotion": "segment-self-promo",
        "Unpaid Promotion": "segment-unpaid-promo",
        Highlight: "segment-highlight",
        "Preview/Recap": "segment-preview",
        "Hook/Greetings": "segment-hook",
        "Tangents/Jokes": "segment-tangent",
        Content: "segment-content",
    };
    return m[l] || "segment-unknown";
}
function getSgDesc(l) {
    const d = {
        Sponsor: "Paid advertisement or sponsorship",
        "Interaction Reminder": "Asking viewers to like/subscribe/share",
        "Self Promotion": "Promoting creator's own products/services",
        "Unpaid Promotion": "Shout-outs to other creators/channels",
        Highlight: "Most important or interesting part",
        "Preview/Recap": "Coming up next or previously on",
        "Hook/Greetings": "Video introduction or greeting",
        "Tangents/Jokes": "Off-topic content or humor",
        Content: "Main video content",
    };
    return d[l] || "Unknown segment type";
}
async function seekVideo(sec) {
    try {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        if (tab?.id)
            await chrome.tabs.sendMessage(tab.id, {
                action: "SEEK_TO",
                timestamp: sec,
            });
    } catch (e) {}
}
function fmtTime(s) {
    const m = Math.floor(s / 60),
        sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
}
