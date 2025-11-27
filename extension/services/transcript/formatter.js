// Format transcript for display

/**
 * Format time in seconds to HH:MM:SS or MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
        return `${h}:${pad(m)}:${pad(s)}`;
    }
    return `${m}:${pad(s)}`;
}

/**
 * Pad number with leading zero
 * @param {number} num - Number to pad
 * @returns {string} Padded string
 */
function pad(num) {
    return num.toString().padStart(2, '0');
}

/**
 * Format transcript segments as plain text
 * @param {Array} segments - Transcript segments
 * @returns {string} Plain text transcript
 */
export function formatAsPlainText(segments) {
    return segments.map(seg => seg.text).join(' ');
}

/**
 * Format transcript segments with timestamps
 * @param {Array} segments - Transcript segments
 * @returns {string} Formatted transcript with timestamps
 */
export function formatWithTimestamps(segments) {
    return segments
        .map(seg => `[${formatTime(seg.start)}] ${seg.text}`)
        .join('\n');
}

/**
 * Format transcript segments as JSON
 * @param {Array} segments - Transcript segments
 * @returns {string} JSON string
 */
export function formatAsJSON(segments) {
    return JSON.stringify(segments, null, 2);
}
