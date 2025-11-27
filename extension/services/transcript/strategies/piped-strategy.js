// Piped API Strategy
// Priority: 4 (Fallback - Uses background script to bypass CORS)

export async function fetchViaPiped(videoId, lang = 'en') {
    // Route through background script to bypass CORS
    const response = await chrome.runtime.sendMessage({
        action: 'FETCH_PIPED_TRANSCRIPT',
        videoId,
        lang
    });

    if (!response.success || !response.data) {
        throw new Error(response.error || 'Piped API failed');
    }

    return response.data;
}

export const strategy = {
    name: 'Piped API',
    priority: 4,
    fetch: fetchViaPiped
}
