const a = document.getElementById('api-status'), p = document.getElementById('page-status'), b = document.getElementById('analyze-btn'), h = document.getElementById('history-btn'), o = document.getElementById('options-btn'), m = document.getElementById('message')
function showMsg(t, y = 'info') { m.textContent = t; m.className = `show ${y}`; setTimeout(() => m.classList.remove('show'), 3000) }
async function checkApi() {
  try {
    const s = await chrome.storage.sync.get('apiKey'), l = await chrome.storage.local.get('geminiApiKey'), k = s.apiKey || l.geminiApiKey
    if (k) { a.innerHTML = '<span>✅ Configured</span>'; a.className = 'value success'; return true }
    a.innerHTML = '<span>⚠️ Not configured</span>'; a.className = 'value warning'; return false
  } catch (e) { a.innerHTML = '<span>❌ Error</span>'; a.className = 'value error'; return false }
}
async function checkPage() {
  try {
    const [t] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!t || !t.url) { p.innerHTML = '<span>❌ No active tab</span>'; p.className = 'value error'; return null }
    if (t.url.includes('youtube.com/watch')) {
      const u = new URL(t.url), v = u.searchParams.get('v')
      if (v) { p.innerHTML = '<span>✅ YouTube Video</span>'; p.className = 'value success'; return { tab: t, videoId: v } }
    }
    p.innerHTML = '<span>⚠️ Not a YouTube video</span>'; p.className = 'value warning'; return null
  } catch (e) { p.innerHTML = '<span>❌ Error</span>'; p.className = 'value error'; return null }
}
async function init() { const k = await checkApi(), pg = await checkPage(); if (k && pg) b.disabled = false }
b.addEventListener('click', async () => {
  try {
    b.disabled = true; b.textContent = '⏳ Analyzing...'
    const [t] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!t) { showMsg('No active tab found', 'error'); return }
    const r = await chrome.tabs.sendMessage(t.id, { action: 'START_ANALYSIS' })
    if (r?.success) { showMsg('Analysis started!', 'success'); setTimeout(() => window.close(), 1000) }
    else showMsg(r?.error || 'Failed to start analysis', 'error')
  } catch (e) { showMsg('Failed to communicate with page. Try refreshing.', 'error') }
  finally { b.disabled = false; b.textContent = '🎬 Analyze Current Video' }
})
h.addEventListener('click', () => chrome.tabs.create({ url: chrome.runtime.getURL('history/history.html') }))
o.addEventListener('click', () => chrome.runtime.openOptionsPage())
document.addEventListener('DOMContentLoaded', init)
