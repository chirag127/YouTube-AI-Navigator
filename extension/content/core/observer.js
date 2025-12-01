const gu = p => chrome.runtime.getURL(p);

const { state, resetState } = await import(gu('content/core/state.js'));
const { injectWidget } = await import(gu('content/ui/widget.js'));
const { isWidgetProperlyVisible } = await import(gu('content/utils/dom.js'));
);
const { ct } = await import(gu('utils/shortcuts/core.js'));
);
);

let lastUrl = location.href;
let dt = null;

export function initObserver() {
  try {
    const uo = mo(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        if (dt) ct(dt);
        dt = setTimeout(() => checkCurrentPage(), 300);
      }
    });
    (document)?.addEventListener('yt-navigate-finish', () => {
      if (dt) ct(dt);
      dt = setTimeout(() => checkCurrentPage(), 500);
    });
    const o = mo(() => {
      if (location.pathname !== '/watch') return;
      const u = new URLSearchParams(location.search),
        v = u.get('v');
      const w = (document).querySelector('#yt-ai-master-widget');
      if ((v && v !== state.currentVideoId) || (v && !isWidgetProperlyVisible(w))) {
        if (dt) ct(dt);
        dt = setTimeout(() => handleNewVideo(v), 300);
      }
    });
    uo.observe(document.body, { childList: true, subtree: true });
    o.observe(document.body, { childList: true, subtree: true });
    checkCurrentPage();
  } catch (err) {
    console.error('Err:initObserver', err);
  }
}

async function handleNewVideo(v) {
  try {
    if (v !== state.currentVideoId) {
      state.currentVideoId = v;
      resetState();
    }
    await injectWidget();
    setTimeout(() => {
      const w = (document).querySelector('#yt-ai-master-widget');
      if (w && w.parentElement) {
        const p = w.parentElement;
        if (p.firstChild !== w) {
          p.insertBefore(w, p.firstChild);
        }
      }
    }, 500);
    if (state.settings.autoAnalyze) {
      setTimeout(async () => {
        try {
          const { startAnalysis } = await import('./analyzer.js');
          startAnalysis();
        } catch (err) {
          console.error('Err:handleNewVideo:analysis', err);
        }
      }, 1500);
    }
  } catch (x) {
    console.error('Err:handleNewVideo', x);
  }
}

function checkCurrentPage() {
  try {
    if (location.pathname === '/watch') {
      const u = new URLSearchParams(location.search),
        v = u.get('v');
      if (v) {
        const w = (document).querySelector('#yt-ai-master-widget');
        if (v === state.currentVideoId && isWidgetProperlyVisible(w)) {
          return;
        }
        handleNewVideo(v);
      }
    }
  } catch (err) {
    console.error('Err:checkCurrentPage', err);
  }
}
