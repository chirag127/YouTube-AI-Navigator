// Background Proxy Strategy
// Priority: 4 (Service worker fallback)

export async function fetchViaBackground(videoId, lang = 'en') {
    const res = await chrome.runtime.sendMessage({
        action: 'FETCH_TRANSCRIPT',
        videoId,
        lang
    })

    if (!res.success || !res.data) {
        throw new Error(res.error || 'Background proxy failed')
    }

    return res.data.segments || res.data
}

export const strategy = {
    name: 'Background Proxy',
    priority: 4,
    fetch: fetchViaBackground
}
