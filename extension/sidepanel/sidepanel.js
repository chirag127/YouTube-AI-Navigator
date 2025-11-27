import { ChunkingService } from '../services/chunking/index.js'
import { GeminiService } from '../services/gemini/index.js'
import { SegmentClassificationService } from '../services/segments/index.js'
import { StorageService } from '../services/storage/index.js'
const ss = new StorageService(), cs = new ChunkingService()
let gs = null, scs = null, ctx = '', segs = []
const ab = document.getElementById('analyze-btn'), st = document.getElementById('status'), aw = document.getElementById('auth-warning'), tbs = document.querySelectorAll('.tab-btn'), tcs = document.querySelectorAll('.tab-content'), sc = document.getElementById('summary-content'), ic = document.getElementById('insights-content'), tc = document.getElementById('transcript-container'), ci = document.getElementById('chat-input'), csb = document.getElementById('chat-send-btn'), ch = document.getElementById('chat-history')
document.addEventListener('DOMContentLoaded', async () => {
  const { geminiApiKey } = await chrome.storage.local.get('geminiApiKey')
  if (!geminiApiKey) { aw.style.display = 'block'; ab.disabled = true; return }
  gs = new GeminiService(geminiApiKey)
  scs = new SegmentClassificationService(gs, cs)
  try { await gs.fetchAvailableModels() } catch (e) { }
  for (const b of tbs) { b.addEventListener('click', () => { for (const x of tbs) x.classList.remove('active'); for (const x of tcs) x.classList.remove('active'); b.classList.add('active'); document.getElementById(`${b.getAttribute('data-tab')}-tab`).classList.add('active') }) }
  csb.addEventListener('click', handleChat)
  ci.addEventListener('keypress', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat() } })
})
async function handleChat() {
  const q = ci.value.trim()
  if (!q) return
  if (!ctx) { appendMsg('ai', 'Please analyze a video first so I have context to answer your question.'); return }
  appendMsg('user', q)
  ci.value = ''
  const lid = appendMsg('ai', 'Thinking...')
  try { const a = await gs.chatWithVideo(q, ctx); updateMsg(lid, a) }
  catch (e) { updateMsg(lid, `Error: ${e.message}`) }
}
function appendMsg(r, t) { const d = document.createElement('div'); d.className = `chat-message ${r}`; d.id = `msg-${Date.now()}`; d.textContent = t; ch.appendChild(d); ch.scrollTop = ch.scrollHeight; return d.id }
function updateMsg(id, t) { const d = document.getElementById(id); if (d) { d.innerHTML = marked.parse(t); ch.scrollTop = ch.scrollHeight } }
ab.addEventListener('click', async () => {
  try {
    st.textContent = 'Fetching video info...'; st.className = ''; ab.disabled = true
    sc.innerHTML = '<p style="text-align:center;color:#888;">Generating summary...</p>'
    ic.innerHTML = '<p style="text-align:center;color:#888;">Generating insights...</p>'
    tc.innerHTML = '<p style="text-align:center;color:#888;">Loading transcript...</p>'
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab || !tab.url.includes('youtube.com/watch')) throw new Error('Please open a YouTube video page.')
    const u = new URLSearchParams(new URL(tab.url).search), v = u.get('v')
    if (!v) throw new Error('Could not find Video ID.')
    st.textContent = 'Fetching transcript...'
    const mr = await chrome.tabs.sendMessage(tab.id, { action: 'GET_METADATA', videoId: v })
    if (mr.error) throw new Error(`Metadata fetch failed: ${mr.error}`)
    const md = mr.metadata
    const tr = await chrome.tabs.sendMessage(tab.id, { action: 'GET_TRANSCRIPT', videoId: v })
    if (tr.error) { if (tr.error.includes('does not have captions')) throw new Error('This video does not have captions/subtitles. Please try a different video that has closed captions enabled.'); if (tr.error.includes('Transcript analysis failed')) throw new Error(tr.error); throw new Error(`Unable to analyze video: ${tr.error}`) }
    const ts = tr.transcript
    ctx = ts.map(s => s.text).join(' ')
    if (!ctx.trim()) throw new Error('Transcript text is empty. Please try a different video or language.')
    st.textContent = 'Classifying segments...'
    const cls = await scs.classifyTranscript(ts)
    segs = cls
    renderTranscript(cls)
    chrome.tabs.sendMessage(tab.id, { action: 'SHOW_SEGMENTS', segments: cls }).catch(e => console.warn('Failed to send segments:', e))
    const opts = await chrome.storage.local.get(['summaryLength', 'targetLanguage']), so = { length: opts.summaryLength || 'Medium', language: opts.targetLanguage || 'English' }
    st.textContent = 'Analyzing content...'
    const an = await gs.generateComprehensiveAnalysis(ctx, so)
    renderMd(an.summary, sc)
    st.textContent = 'Analyzing comments...'
    const cr = await chrome.tabs.sendMessage(tab.id, { action: 'GET_COMMENTS' }).catch(() => ({ comments: [] })), cms = cr?.comments || []
    let ca = 'No comments found.'
    if (cms.length > 0) { try { ca = await gs.analyzeCommentSentiment(cms) } catch (e) { ca = 'Failed to analyze comments.' } }
    const ih = `<h3>Key Insights</h3>${marked.parse(an.insights)}<hr style="border:0;border-top:1px solid #eee;margin:20px 0;"><h3>Comments Analysis</h3>${marked.parse(ca)}<hr style="border:0;border-top:1px solid #eee;margin:20px 0;"><h3>Frequently Asked Questions</h3>${marked.parse(an.faq)}`
    ic.innerHTML = ih
    st.textContent = 'Done!'
    await ss.saveTranscript(v, md, ts, an.summary)
  } catch (e) { st.textContent = `Error: ${e.message}`; st.className = 'error'; if (sc.innerHTML.includes('Generating')) sc.innerHTML = '<p class="error">Failed to generate.</p>' }
  finally { ab.disabled = false }
})
function renderMd(t, el) { el.innerHTML = typeof marked !== 'undefined' ? marked.parse(t) : t }
function renderTranscript(sg) { tc.innerHTML = ''; for (const s of sg) { const d = document.createElement('div'); d.className = `transcript-segment ${getSgClass(s.label)}`; const tm = document.createElement('span'); tm.className = 'timestamp'; tm.textContent = fmtTime(s.start); const tx = document.createElement('span'); tx.className = 'text'; tx.textContent = s.text; if (s.label) { const lb = document.createElement('span'); lb.className = 'segment-label'; lb.textContent = s.label; lb.title = getSgDesc(s.label); d.appendChild(lb) } d.appendChild(tm); d.appendChild(tx); d.addEventListener('click', () => seekVideo(s.start)); tc.appendChild(d) } }
function getSgClass(l) { const m = { Sponsor: 'segment-sponsor', 'Interaction Reminder': 'segment-interaction', 'Self Promotion': 'segment-self-promo', 'Unpaid Promotion': 'segment-unpaid-promo', Highlight: 'segment-highlight', 'Preview/Recap': 'segment-preview', 'Hook/Greetings': 'segment-hook', 'Tangents/Jokes': 'segment-tangent', Content: 'segment-content' }; return m[l] || 'segment-unknown' }
function getSgDesc(l) { const d = { Sponsor: 'Paid advertisement or sponsorship', 'Interaction Reminder': 'Asking viewers to like/subscribe/share', 'Self Promotion': "Promoting creator's own products/services", 'Unpaid Promotion': 'Shout-outs to other creators/channels', Highlight: 'Most important or interesting part', 'Preview/Recap': 'Coming up next or previously on', 'Hook/Greetings': 'Video introduction or greeting', 'Tangents/Jokes': 'Off-topic content or humor', Content: 'Main video content' }; return d[l] || 'Unknown segment type' }
async function seekVideo(sec) { try { const [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); if (tab?.id) await chrome.tabs.sendMessage(tab.id, { action: 'SEEK_TO', timestamp: sec }) } catch (e) { } }
function fmtTime(s) { const m = Math.floor(s / 60), sec = Math.floor(s % 60); return `${m}:${sec.toString().padStart(2, '0')}` }
