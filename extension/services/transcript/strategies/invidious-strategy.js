// Invidious API Strategy
// Priority: 3 (Fallback - Uses background script to bypass CORS)

export async function fetchViaInvidious(videoId, lang = 'en') {
    // Route through background script to bypass CORS
    const response = await chrome.runtime.sendMessage({
        action: 'FETCH_INVIDIOUS_TRANSCRIPT',
        videoId,
        lang
    });

    if (!response.success || !response.data) {
        throw new Error(response.error || 'Invidious API failed');
    }

    return response.data;
}

export const strategy = {
    name: 'Invidious API',
    priority: 3,
    fetch: fetchViaInvidious
}
