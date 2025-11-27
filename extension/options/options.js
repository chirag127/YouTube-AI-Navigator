const D = { apiKey: '', model: 'gemini-2.5-flash', summaryLength: 'medium', outputLanguage: 'en', customPrompt: '', autoAnalyze: true, enableSegments: true, autoSkipSponsors: false, autoSkipIntros: false, saveHistory: true }
const e = { apiKey: document.getElementById('apiKey'), modelSelect: document.getElementById('modelSelect'), summaryLength: document.getElementById('summaryLength'), outputLanguage: document.getElementById('outputLanguage'), customPrompt: document.getElementById('customPrompt'), autoAnalyze: document.getElementById('autoAnalyze'), enableSegments: document.getElementById('enableSegments'), autoSkipSponsors: document.getElementById('autoSkipSponsors'), autoSkipIntros: document.getElementById('autoSkipIntros'), saveHistory: document.getElementById('saveHistory'), saveBtn: document.getElementById('saveBtn'), testBtn: document.getElementById('testBtn'), clearHistory: document.getElementById('clearHistory'), statusMessage: document.getElementById('statusMessage') }
async function loadSettings() {
  try {
    const r = await chrome.storage.sync.get(D)
    e.apiKey.value = r.apiKey || ''
    e.modelSelect.value = r.model || D.model
    e.summaryLength.value = r.summaryLength || D.summaryLength
    e.outputLanguage.value = r.outputLanguage || D.outputLanguage
    e.customPrompt.value = r.customPrompt || ''
    e.autoAnalyze.checked = r.autoAnalyze !== false
    e.enableSegments.checked = r.enableSegments !== false
    e.autoSkipSponsors.checked = r.autoSkipSponsors === true
    e.autoSkipIntros.checked = r.autoSkipIntros === true
    e.saveHistory.checked = r.saveHistory !== false
  } catch (err) { showStatus('Failed to load settings', 'error') }
}
async function saveSettings() {
  try {
    const s = { apiKey: e.apiKey.value.trim(), model: e.modelSelect.value, summaryLength: e.summaryLength.value, outputLanguage: e.outputLanguage.value, customPrompt: e.customPrompt.value.trim(), autoAnalyze: e.autoAnalyze.checked, enableSegments: e.enableSegments.checked, autoSkipSponsors: e.autoSkipSponsors.checked, autoSkipIntros: e.autoSkipIntros.checked, saveHistory: e.saveHistory.checked }
    if (!s.apiKey) { showStatus('Please enter your Gemini API key', 'error'); e.apiKey.focus(); return }
    await chrome.storage.sync.set(s)
    await chrome.storage.local.set({ geminiApiKey: s.apiKey, summaryLength: s.summaryLength, targetLanguage: s.outputLanguage })
    showStatus('Settings saved successfully!', 'success')
  } catch (err) { showStatus('Failed to save settings', 'error') }
}
async function testApi() {
  const k = e.apiKey.value.trim(), m = e.modelSelect.value
  if (!k) { showStatus('Please enter your API key first', 'error'); e.apiKey.focus(); return }
  showStatus('Testing API connection...', 'info')
  e.testBtn.disabled = true
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${k}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: 'Hello! Please respond with "API connection successful"' }] }] }) })
    if (!r.ok) { const d = await r.json(); throw new Error(d.error?.message || 'API request failed') }
    const d = await r.json(), t = d.candidates?.[0]?.content?.parts?.[0]?.text
    if (t) showStatus('✅ API connection successful! Your key is working.', 'success')
    else throw new Error('Unexpected API response format')
  } catch (err) { showStatus(`❌ API test failed: ${err.message}`, 'error') }
  finally { e.testBtn.disabled = false }
}
async function clearHistory() {
  if (!confirm('Are you sure you want to clear all saved summaries? This action cannot be undone.')) return
  try { await chrome.storage.local.remove('summaryHistory'); showStatus('History cleared successfully', 'success') }
  catch (err) { showStatus('Failed to clear history', 'error') }
}
function showStatus(msg, type = 'info') {
  e.statusMessage.textContent = msg
  e.statusMessage.className = `status-message show ${type}`
  if (type !== 'error') setTimeout(() => e.statusMessage.classList.remove('show'), 5000)
}
function init() {
  e.saveBtn.addEventListener('click', saveSettings)
  e.testBtn.addEventListener('click', testApi)
  e.clearHistory.addEventListener('click', clearHistory)
  e.apiKey.addEventListener('keypress', ev => { if (ev.key === 'Enter') saveSettings() })
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { loadSettings(); init() })
else { loadSettings(); init() }
