// Detect YouTube video ID from URL

/**
 * Extract video ID from YouTube URL
 * @param {string} url - YouTube URL
 * @returns {string|null} Video ID or null
 */
export function extractVideoId(url) {
    const patterns = [
        /[?&]v=([^&]+)/,           // ?v=VIDEO_ID
        /\/embed\/([^/?]+)/,        // /embed/VIDEO_ID
        /\/v\/([^/?]+)/,            // /v/VIDEO_ID
        /youtu\.be\/([^/?]+)/       // youtu.be/VIDEO_ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }

    return null;
}

/**
 * Get current video ID from page
 * @returns {string|null} Current video ID or null
 */
export function getCurrentVideoId() {
    return extractVideoId(window.location.href);
}

/**
 * Check if current page is a video page
 * @returns {boolean} True if on video page
 */
export function isVideoPage() {
    return window.location.pathname === '/watch';
}
