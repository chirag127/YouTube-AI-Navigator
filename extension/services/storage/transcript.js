export async function saveTranscript(v, m, t, s) {
    if (!v) throw new Error('Video ID required')
    const d = { videoId: v, metadata: m, transcript: t, summary: s, timestamp: Date.now() }
    await chrome.storage.local.set({ [`video_${v}`]: d })
    return d
}
export async function getTranscript(v) {
    if (!v) throw new Error('Video ID required')
    const r = await chrome.storage.local.get(`video_${v}`)
    return r[`video_${v}`] || null
}
export async function deleteTranscript(v) {
    if (!v) return
    await chrome.storage.local.remove(`video_${v}`)
}
