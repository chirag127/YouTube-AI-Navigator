// Cache transcript data to avoid repeated fetches

const cache = new Map();

/**
 * Generate cache key for video
 * @param {string} videoId - YouTube video ID
 * @param {string} languageCode - Language code
 * @returns {string} Cache key
 */
function getCacheKey(videoId, languageCode) {
    return `${videoId}_${languageCode}`;
}

/**
 * Get cached transcript
 * @param {string} videoId - YouTube video ID
 * @param {string} languageCode - Language code
 * @returns {Array|null} Cached transcript or null
 */
export function getCached(videoId, languageCode) {
    const key = getCacheKey(videoId, languageCode);
    return cache.get(key) || null;
}

/**
 * Set cached transcript
 * @param {string} videoId - YouTube video ID
 * @param {string} languageCode - Language code
 * @param {Array} transcript - Transcript segments
 */
export function setCached(videoId, languageCode, transcript) {
    const key = getCacheKey(videoId, languageCode);
    cache.set(key, transcript);
}

/**
 * Clear cache for video
 * @param {string} videoId - YouTube video ID
 */
export function clearVideo(videoId) {
    for (const key of cache.keys()) {
        if (key.startsWith(videoId)) {
            cache.delete(key);
        }
    }
}

/**
 * Clear all cache
 */
export function clearAll() {
    cache.clear();
}
