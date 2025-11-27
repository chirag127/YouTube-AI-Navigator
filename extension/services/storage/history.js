export async function getHistory() {
    const r = await chrome.storage.local.get('history_index')
    return r.history_index || []
}
export async function updateHistory(v, m) {
    const i = await getHistory(), n = i.filter(x => x.videoId !== v)
    n.unshift({ videoId: v, title: m.title, author: m.author, timestamp: Date.now() })
    await chrome.storage.local.set({ history_index: n })
}
export async function deleteFromHistory(v) {
    const i = await getHistory()
    await chrome.storage.local.set({ history_index: i.filter(x => x.videoId !== v) })
}
export async function searchHistory(q) {
    if (!q) return getHistory()
    const i = await getHistory(), l = q.toLowerCase()
    return i.filter(x => x.title?.toLowerCase().includes(l) || x.author?.toLowerCase().includes(l))
}
