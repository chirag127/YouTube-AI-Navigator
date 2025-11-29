import { state } from "../../core/state.js";
import { showLoading, showPlaceholder } from "../components/loading.js";
import { getComments } from "../../handlers/comments.js";
import { parseMarkdown } from "../../../lib/marked-loader.js";

export async function renderComments(c) {
    if (state.analysisData?.commentAnalysis) {
        const html = await parseMarkdown(state.analysisData.commentAnalysis);
        c.innerHTML = `<div class="yt-ai-markdown">${html}</div>`;
        return;
    }
    showLoading(c, "Fetching comments...");
    try {
        const cm = await getComments();
        if (!cm.length) {
            showPlaceholder(
                c,
                "No comments found. Comments may be disabled for this video."
            );
            return;
        }
        showLoading(c, "Analyzing comment sentiment...");
        console.log('[CommentsRenderer] Sending comments for analysis:', cm);
        const r = await chrome.runtime.sendMessage({
            action: "ANALYZE_COMMENTS",
            comments: cm,
        });
        if (r.success) {
            // Check config for scroll-back behavior
            const config = await getConfig();
            if (config.scroll?.scrollBackAfterComments) {
                scrollBackToTop(config.scroll?.showScrollNotification ?? true);
            }

            if (!state.analysisData) state.analysisData = {};
            state.analysisData.commentAnalysis = r.analysis;
            const html = await parseMarkdown(r.analysis);
            c.innerHTML = `<div class="yt-ai-markdown"><h3>💬 Comment Sentiment Analysis</h3>${html}<hr><h4>Top Comments (${cm.length
                })</h4>${cm
                    .slice(0, 5)
                    .map(
                        (x) =>
                            `<div class="yt-ai-comment"><div class="yt-ai-comment-author">${x.author}</div><div class="yt-ai-comment-text">${x.text}</div><div class="yt-ai-comment-likes">👍 ${x.likes}</div></div>`
                    )
                    .join("")}</div>`;
        }
    } catch (e) {
        c.innerHTML = `<div class="yt-ai-error-msg">Failed: ${e.message}</div>`;
    }
}

async function getConfig() {
    try {
        const result = await chrome.storage.sync.get('config');
        return result.config || {};
    } catch (e) {
        return {};
    }
}

function scrollBackToTop(showNotification = true) {
    console.log("[CommentsRenderer] 📜 IMMEDIATE scroll to top");

    // Triple-force instant scroll
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Force repaint
    void document.body.offsetHeight;

    // Verify scroll position
    requestAnimationFrame(() => {
        if (window.scrollY > 0) {
            console.warn("[CommentsRenderer] ⚠️ Scroll failed, retrying...");
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }
        console.log("[CommentsRenderer] ✅ Final scroll position:", window.scrollY);
    });

    // Visual feedback (if enabled)
    if (showNotification) {
        showScrollNotification();
    }
}

function showScrollNotification() {
    const notification = document.createElement('div');
    notification.id = 'yt-ai-scroll-notification';
    notification.textContent = '⬆️ Scrolled to top';
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #3ea6ff;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-family: 'Roboto', Arial, sans-serif;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}
