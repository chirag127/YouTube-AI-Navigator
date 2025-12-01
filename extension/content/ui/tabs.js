const gu = p => chrome.runtime.getURL(p);

const { state } = await import(gu('content/core/state.js'));
const { renderSummary } = await import(gu('content/ui/renderers/summary.js'));
const { renderSegments } = await import(gu('content/ui/renderers/segments.js'));
const { renderChat } = await import(gu('content/ui/renderers/chat.js'));
const { renderComments } = await import(gu('content/ui/renderers/comments.js'));

export function initTabs(c) {
  try {
    c.querySelectorAll('.yt-ai-tab').forEach(t => t?.addEventListener('click', () => switchTab(t.dataset.tab, c)));
  } catch (err) {
    console.error('Err:initTabs', err);
  }
}

export function switchTab(n, container) {
  try {
    const c = container || document.getElementById('yt-ai-master-widget');
    if (!c) return;
    c.querySelectorAll('.yt-ai-tab').forEach(t => t.classList.remove('active'));
    const activeTab = c.querySelector(`[data-tab="${n}"]`);
    if (activeTab) activeTab.classList.add('active');
    const i = c.querySelector('#yt-ai-chat-input-area');
    if (i) i.style.display = n === 'chat' ? 'flex' : 'none';
    const a = c.querySelector('#yt-ai-content-area');
    if (!a) return;
    try {
      switch (n) {
        case 'summary':
          renderSummary(a, state.analysisData || {});
          break;

        case 'segments':
          renderSegments(a, state.analysisData || {});
          break;
        case 'chat':
          renderChat(a);
          break;
        case 'comments':
          renderComments(a);
          break;
      }
    } catch (x) {
      console.error('Err:switchTab', x);
      a.innerHTML = `<div class="yt-ai-error">Error loading tab content</div>`;
    }
  } catch (err) {
    console.error('Err:switchTab', err);
  }
}
