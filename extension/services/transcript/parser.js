// Parse YouTube player response for captions

/**
 * Extract caption tracks from ytInitialPlayerResponse
 * @param {Object} playerResponse - YouTube player response object
 * @returns {Array} Caption tracks array
 */
export function extractCaptionTracks(playerResponse) {
    if (!playerResponse?.captions) {
        return [];
    }

    const renderer = playerResponse.captions.playerCaptionsTracklistRenderer;
    return renderer?.captionTracks || [];
}

/**
 * Get ytInitialPlayerResponse from page
 * @returns {Object|null} Player response object
 */
export function getPlayerResponse() {
    // Try window object first
    if (window.ytInitialPlayerResponse) {
        return window.ytInitialPlayerResponse;
    }

    // Try parsing from script tags
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
        const match = script.textContent?.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
        if (match) {
            try {
                return JSON.parse(match[1]);
            } catch (e) {
                console.error('Failed to parse ytInitialPlayerResponse:', e);
            }
        }
    }

    return null;
}
