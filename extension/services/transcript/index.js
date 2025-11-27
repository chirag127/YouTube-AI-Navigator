// Main transcript service

import { getPlayerResponse, extractCaptionTracks } from './parser.js';
import { fetchTranscriptData, parseTranscriptData } from './fetcher.js';
import { selectBestTrack } from './selector.js';
import { formatAsPlainText, formatWithTimestamps } from './formatter.js';

/**
 * Get available caption tracks for current video
 * @returns {Array} Available caption tracks
 */
export function getAvailableCaptions() {
    const playerResponse = getPlayerResponse();
    return extractCaptionTracks(playerResponse);
}

/**
 * Fetch transcript for current video
 * @param {string} [languageCode] - Preferred language code
 * @returns {Promise<Array>} Transcript segments
 */
export async function fetchTranscript(languageCode) {
    const tracks = getAvailableCaptions();

    if (tracks.length === 0) {
        throw new Error('No captions available for this video');
    }

    const track = selectBestTrack(tracks, languageCode);

    if (!track) {
        throw new Error('Could not select caption track');
    }

    const data = await fetchTranscriptData(track.baseUrl);
    return parseTranscriptData(data);
}

/**
 * Get formatted transcript text
 * @param {string} [languageCode] - Preferred language code
 * @param {boolean} [includeTimestamps] - Include timestamps
 * @returns {Promise<string>} Formatted transcript
 */
export async function getTranscriptText(languageCode, includeTimestamps = false) {
    const segments = await fetchTranscript(languageCode);

    return includeTimestamps
        ? formatWithTimestamps(segments)
        : formatAsPlainText(segments);
}

/**
 * Check if captions are available
 * @returns {boolean} True if captions available
 */
export function hasCaptions() {
    const tracks = getAvailableCaptions();
    return tracks.length > 0;
}
