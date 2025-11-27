// Fetch transcript data from YouTube API

/**
 * Fetch transcript from caption track URL
 * @param {string} baseUrl - Caption track base URL
 * @returns {Promise<Object>} Raw transcript data
 */
export async function fetchTranscriptData(baseUrl) {
    const response = await fetch(baseUrl);

    if (!response.ok) {
        throw new Error(`Failed to fetch transcript: ${response.status}`);
    }

    return await response.json();
}

/**
 * Parse raw transcript data into segments
 * @param {Object} data - Raw transcript data
 * @returns {Array} Transcript segments
 */
export function parseTranscriptData(data) {
    if (!data?.events) {
        return [];
    }

    return data.events
        .filter(event => event.segs)
        .map(event => ({
            start: event.tStartMs / 1000,
            duration: event.dDurationMs / 1000,
            text: event.segs.map(seg => seg.utf8).join('')
        }));
}
