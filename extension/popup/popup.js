import { id } from '../utils/shortcuts/dom.js';
import { sg, slg } from '../utils/shortcuts/storage.js';
import { w } from '../utils/shortcuts/log.js';
import { tq, tm, tc } from '../utils/shortcuts/tabs.js';
import { url, oop } from '../utils/shortcuts/runtime.js';
import { to } from '../utils/shortcuts/global.js';

const a = id('api-status'),
  p = id('page-status'),
  b = id('analyze-btn'),
  h = id('history-btn'),
  o = id('options-btn'),
  m = id('message'),
  g = id('setup-guide-btn');

function showMsg(t, y = 'info') {
  m.textContent = t;
  m.className = `show ${y}`;
  to(() => m.classList.remove('show'), 3000);
}

async function checkApi() {
  try {
    const s = await sg(['apiKey', 'onboardingCompleted']),
      lc = await slg('geminiApiKey'),
      k = s.apiKey || lc.geminiApiKey;
    if (k) {
      a.innerHTML = '<span>✅ Configured</span>';
      a.className = 'value success';
      return true;
    }
    a.innerHTML = '<span>⚠️ Not configured</span>';
    a.className = 'value warning';
    if (!s.onboardingCompleted) {
      g.style.display = 'block';
      g.onclick = () => oop();
    }
    return false;
  } catch (x) {
    w('API check failed:', x);
    return false;
  }
}

async function checkPage() {
  try {
    const [t] = await tq({ active: true, currentWindow: true });
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
    w('Page check failed:', x);
    return false;
  }
}

b.onclick = async () => {
  try {
    const [t] = await tq({ active: true, currentWindow: true });
    if (!t) return;
    await tm(t.id, { action: 'ANALYZE_VIDEO' });
    showMsg('Analysis started!', 'success');
  } catch (x) {
    showMsg('Failed to start analysis', 'error');
  }
};

h.onclick = () => tc({ url: url('history/history.html') });
o.onclick = () => oop();

(async () => {
  await checkApi();
  await checkPage();
})();
