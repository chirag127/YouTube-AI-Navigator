

const { showPlaceholder } = await import(chrome.runtime.getURL('content/ui/components/loading.js'));
const { seekVideo } = await import(chrome.runtime.getURL('content/utils/dom.js'));
const { formatTime } = await import(chrome.runtime.getURL('content/utils/time.js'));
);
);
);

let autoCloseEnabled = true;

// Load initial state from config
(async () => {
  try {
    const r = await chrome.storage.sync.get('config');
    if (r.config?.transcript?.autoClose !== undefined) {
      autoCloseEnabled = r.config.transcript.autoClose;
    }
  } catch (err) {
    console.error('Err:loadAutoClose', err);
  }
})();

export function renderTranscript(c, s) {
  try {
    if (!s?.length) {
      showPlaceholder(c, 'No transcript available.');
      return;
    }

    // Use ytai-transcript-line class from styles.css
    const h = s
      .map((x, i) => {
        // Stagger animation
        const delay = Math.min(i * 0.02, 1.0); // Cap delay to avoid long waits
        return `
            <div class="ytai-transcript-line" data-time="${x.start}" style="animation: slideUpFade 0.3s var(--ease-fluid) ${delay}s backwards">
              <span class="ytai-transcript-timestamp">${formatTime(x.start)}</span>
              <span class="ytai-transcript-text">${x.text}</span>
            </div>
          `;
      })
      .join('');

    const ab = `
      <div class="yt-ai-transcript-controls" style="margin-bottom: 12px; display: flex; justify-content: flex-end;">
        <button id="yt-ai-transcript-autoclose-toggle" class="yt-ai-btn-small ${autoCloseEnabled ? 'active' : ''}" style="font-size: 11px; padding: 4px 8px;">
          ${autoCloseEnabled ? '✓' : '✗'} Auto-close after extraction
        </button>
      </div>
    `;

    c.innerHTML = `${ab}<div class="ytai-transcript-display">${h}</div>`;

    $$('.ytai-transcript-line', c).forEach(e =>
      (e)?.addEventListener('click', () => seekVideo(parseFloat(e.dataset.time)))
    );

    const tb = $('#yt-ai-transcript-autoclose-toggle', c);
    if (tb) {
      (tb)?.addEventListener('click', async () => {
        autoCloseEnabled = !autoCloseEnabled;
        tb.classList.toggle('active', autoCloseEnabled);
        tb.textContent = `${autoCloseEnabled ? '✓' : '✗'} Auto-close after extraction`;

        // Save to config
        try {
          const r = await chrome.storage.sync.get('config');
          const config = r.config || {};
          config.transcript = config.transcript || {};
          config.transcript.autoClose = autoCloseEnabled;
          await chrome.storage.sync.set(typeof { config } === 'string' ? { [{ config }]: undefined } : { config });
        } catch (err) {
          console.error('Err:saveAutoClose', err);
        }
      });
    }
  } catch (err) {
    console.error('Err:renderTranscript', err);
  }
}

export function shouldAutoClose() {
  try {
    return autoCloseEnabled;
  } catch (err) {
    console.error('Err:shouldAutoClose', err);
    return false;
  }
}

export function collapseTranscriptWidget() {
  try {
    const w = document.getElementById('yt-ai-master-widget');
    if (w && autoCloseEnabled) {
      w.classList.add('yt-ai-collapsed');
      const cb = $('#yt-ai-close-btn', w);
      if (cb) {
        cb.textContent = '⬇️';
        cb.title = 'Expand';
      }
    }
  } catch (err) {
    console.error('Err:collapseTranscriptWidget', err);
  }
}
