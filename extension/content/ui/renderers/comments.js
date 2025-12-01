const { state } = await import(chrome.runtime.getURL('content/core/state.js'));
const { showLoading, showPlaceholder } = await import(chrome.runtime.getURL('content/ui/components/loading.js'));
const { getComments } = await import(chrome.runtime.getURL('content/handlers/comments.js'));
const { parseMarkdown } = await import(chrome.runtime.getURL('lib/marked-loader.js'));

function $(selector, context = document) {
  return context.querySelector(selector);
}

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

async function sendRuntimeMessage(message) {
  return await chrome.runtime.sendMessage(message);
}

export async function renderComments(c) {
  try {
    if (state.analysisData?.commentAnalysis) {
      const html = await parseMarkdown(state.analysisData.commentAnalysis);
      // Wrap existing analysis in glass card
      (c).innerHTML = `
        <div class="yt-ai-card glass-panel" style="animation: slideUpFade 0.4s var(--ease-fluid)">
          <h3 class="yt-ai-card-title">💬 Comment Sentiment Analysis</h3>
          <div class="yt-ai-card-content">${html}</div>
        </div>
      `;
      return;
    }

    showLoading(c, 'Loading comments section...');
    const cfg = await getConfig();
    const origPos = window.scrollY;
    const retries = cfg.comments?.retries ?? 10;

    // Scroll to comments and wait for them to load
    await forceLoadComments();
    showLoading(c, 'Waiting for comments...');
    await setTimeout(() => { }, 1200); // Increased wait time for lazy-load

    try {
      // Extract comments with retry logic - stay scrolled down during this process
      const cm = await getComments(retries);

      // Scroll back AFTER extraction completes
      if (cfg.scroll?.scrollBackAfterComments !== false) {
        await setTimeout(() => { }, 300); // Brief delay before scroll-back
        scrollBackToTop(origPos, cfg.scroll?.showScrollNotification ?? true);
      }

      if (!cm.length) {
        showPlaceholder(c, 'No comments found.');
        return;
      }

      showLoading(c, 'Analyzing...');
      const r = await sendRuntimeMessage({ action: 'ANALYZE_COMMENTS', comments: cm });

      if (r.success) {
        if (!state.analysisData) state.analysisData = {};
        state.analysisData.commentAnalysis = r.analysis;
        const html = await parseMarkdown(r.analysis);

        // Render with Liquid Glass Design
        const topCommentsHtml = cm.slice(0, 5)
          .map((x, i) => `
              <div class="yt-ai-comment glass-panel-sub" style="animation: slideUpFade 0.3s var(--ease-fluid) ${0.1 + i * 0.05}s backwards; margin-bottom: 8px; padding: 12px; border-radius: var(--radius-md);">
                <div class="yt-ai-comment-header" style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.85em; opacity: 0.8;">
                  <span class="yt-ai-comment-author" style="font-weight: 600; color: var(--accent);">${x.author}</span>
                  <span class="yt-ai-comment-likes">👍 ${x.likes}</span>
                </div>
                <div class="yt-ai-comment-text" style="font-size: 0.95em; line-height: 1.4;">${x.text}</div>
              </div>
            `)
          .join('');

        (c).innerHTML = `
            <div class="yt-ai-comments-container" style="display: flex; flex-direction: column; gap: 16px; padding: 8px 0;">
              <div class="yt-ai-card glass-panel" style="animation: slideUpFade 0.4s var(--ease-fluid)">
                <h3 class="yt-ai-card-title">💬 Comment Sentiment Analysis</h3>
                <div class="yt-ai-card-content">${html}</div>
              </div>

              <div class="yt-ai-card glass-panel" style="animation: slideUpFade 0.4s var(--ease-fluid) 0.1s backwards">
                <h4 class="yt-ai-card-title" style="font-size: 1em; margin-bottom: 12px;">Top Comments (${cm.length})</h4>
                <div class="yt-ai-card-content">
                  ${topCommentsHtml}
                </div>
              </div>
            </div>
          `;
      }
    } catch (x) {
      // Scroll back even on error after full retry attempts
      if (cfg.scroll?.scrollBackAfterComments !== false) {
        await setTimeout(() => { }, 300);
        scrollBackToTop(origPos, cfg.scroll?.showScrollNotification ?? true);
      }
      (c).innerHTML = `<div class="yt-ai-error-msg">Failed: ${x.message}</div>`;
      console.error('Err:renderComments', x);
    }
  } catch (err) {
    console.error('Err:renderComments', err);
  }
}

async function getConfig() {
  try {
    const r = await chrome.storage.sync.get('config');
    return r.config || {};
  } catch (err) {
    return {};
  }
}

async function forceLoadComments() {
  try {
    const cs = document.querySelector('ytd-comments#comments');
    if (cs) {
      cs.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Poll for comments to appear
      let attempts = 0;
      const maxAttempts = 20; // 20 * 500ms = 10 seconds

      while (attempts < maxAttempts) {
        await setTimeout(() => { }, 500);

        // Check if comments have loaded
        const comments = document.querySelectorAll('ytd-comment-thread-renderer, ytd-comment-renderer');
        if (comments && comments.length > 0) {
          // Comments appeared! Give a tiny bit more time for text to render
          await setTimeout(() => { }, 500);
          return;
        }

        // Check for spinner (still loading)
        // const spinner = document.querySelector('ytd-item-section-renderer #spinner');

        // Check for "disabled" message to exit early
        const msg = document.querySelector('ytd-comments-header-renderer #message');
        if (msg && msg.textContent.toLowerCase().includes('turned off')) {
          return; // Comments disabled, stop waiting
        }

        // If we are at the bottom, maybe scroll up a bit to trigger lazy load
        if (attempts % 5 === 0) {
          window.scrollBy(0, -50);
          await setTimeout(() => { }, 100);
          window.scrollBy(0, 50);
        }

        attempts++;
      }
      return;
    }

    // Fallback if no comments section found (e.g. mobile/other layout)
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    await setTimeout(() => { }, 2000);
  } catch (err) {
    console.error('Err:forceLoadComments', err);
  }
}

function scrollBackToTop(pos = 0, sn = true) {
  try {
    window.scrollTo({ top: pos, behavior: 'smooth' });
    document.documentElement.scrollTop = pos;
    document.body.scrollTop = pos;
    void document.body.offsetHeight;
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => {
        if (Math.abs(window.scrollY - pos) > 10) {
          window.scrollTo(pos, pos);
          document.documentElement.scrollTop = pos;
          document.body.scrollTop = pos;
        }
      });
    } else {
      setTimeout(() => {
        if (Math.abs(window.scrollY - pos) > 10) {
          window.scrollTo(pos, pos);
          document.documentElement.scrollTop = pos;
          document.body.scrollTop = pos;
        }
      }, 16);
    }
    if (sn) showScrollNotification();
  } catch (err) {
    console.error('Err:scrollBackToTop', err);
  }
}

function showScrollNotification() {
  try {
    const n = document.createElement('div');
    n.id = 'yt-ai-scroll-notification';
    (n).textContent = '⬆️ Scrolled to top';
    // Updated style to match Neo-Brutalist/Glass aesthetic
    n.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: var(--accent, #3ea6ff);
      color: #000;
      padding: 12px 20px;
      border-radius: var(--radius-md, 8px);
      font-family: var(--font-display, 'Outfit', sans-serif);
      font-size: 14px;
      font-weight: 600;
      z-index: 10000;
      box-shadow: var(--brutal-shadow, 4px 4px 0px rgba(0,0,0,0.5));
      border: 2px solid #000;
      animation: slideIn 0.3s var(--ease-fluid, ease-out);
    `;
    (document.body)?.appendChild(n);
    setTimeout(() => {
      n.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => n.remove(), 300);
    }, 2000);
  } catch (err) {
    console.error('Err:showScrollNotification', err);
  }
}
