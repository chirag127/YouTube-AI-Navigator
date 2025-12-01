const a = document.querySelector('#api-status'),
  p = document.querySelector('#page-status'),
  b = document.querySelector('#analyze-btn'),
  h = document.querySelector('#history-btn'),
  o = document.querySelector('#options-btn'),
  m = document.querySelector('#message'),
  g = document.querySelector('#setup-guide-btn');
export function showMsg(t, y = 'info') {
  m.textContent = t;
  m.className = `show ${y}`;
  setTimeout(() => m?.classList.remove('show'), 3000);
}
export async function checkApi() {
  try {
    const s = await chrome.storage.sync.get('config');
    const lc = await chrome.storage.local.get('GAK');
    const k = s.config?.ai?.GAK || lc.GAK;
    if (k) {
      a.innerHTML = '<span>✅ Configured</span>';
      a.className = 'value success';
      g.style.display = 'none';
      return true;
    }
    a.innerHTML = '<span>⚠️ Not configured</span>';
    a.className = 'value warning';
    g.style.display = 'block';
    return false;
  } catch (x) {
    console.warn('API check failed:', x);
    return false;
  }
}
export async function checkPage() {
  try {
    const [t] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (t && t.url && t.url.includes('youtube.com/watch')) {
      p.innerHTML = '<span>✅ YouTube Video</span>';
      p.className = 'value success';
      b.disabled = false;
      return true;
    }
    p.innerHTML = '<span>⚠️ Not on YouTube</span>';
    p.className = 'value warning';
    b.disabled = true;
    return false;
  } catch (x) {
    console.warn('Page check failed:', x);
    return false;
  }
}
b.onclick = async () => {
  try {
    const [t] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!t) return;
    await chrome.tabs.sendMessage(t.id, { action: 'ANALYZE_VIDEO' });
    showMsg('Analysis started!', 'success');
  } catch (x) {
    showMsg('Failed to start analysis', 'error');
  }
};
h.onclick = () => chrome.tabs.create({ url: chrome.runtime.getURL('history/history.html') });
o.onclick = () => chrome.runtime.openOptionsPage();
g.onclick = () => chrome.runtime.openOptionsPage();
(async () => {
  await checkApi();
  await checkPage();
})();
