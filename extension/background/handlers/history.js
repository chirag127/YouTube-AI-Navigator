export async function handleSaveToHistory(req, rsp) {
  try {
    const { videoId, title, summary, timestamp } = req.data || req;
    const res = await chrome.storage.local.get('summaryHistory');
    const h = res.summaryHistory || [];
    h.unshift({ videoId, title, summary, timestamp: timestamp || Date.now() });
    await chrome.storage.local.set({ summaryHistory: h.slice(0, 100) });
    rsp({ success: true });
  } catch (x) {
    console.error('SaveHistory:', x);
    rsp({ success: false, error: x.message });
  }
}
