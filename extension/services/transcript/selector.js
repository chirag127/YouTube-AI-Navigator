// Select appropriate caption track

import { CAPTION_KIND, DEFAULT_LANGUAGE } from './constants.js';

/**
 * Find caption track by language
 * @param {Array} tracks - Available caption tracks
 * @param {string} languageCode - Desired language code
 * @returns {Object|null} Caption track or null
 */
export function findTrackByLanguage(tracks, languageCode) {
    return tracks.find(track => track.languageCode === languageCode) || null;
}

/**
 * Get manual caption track (preferred over auto-generated)
 * @param {Array} tracks - Available caption tracks
 * @param {string} languageCode - Desired language code
 * @returns {Object|null} Manual caption track or null
 */
export function getManualTrack(tracks, languageCode) {
    return tracks.find(
        track => track.languageCode === languageCode &&
            track.kind !== CAPTION_KIND.ASR
    ) || null;
}

/**
 * Select best available caption track
 * @param {Array} tracks - Available caption tracks
 * @param {string} [preferredLanguage] - Preferred language code
 * @returns {Object|null} Best caption track or null
 */
export function selectBestTrack(tracks, preferredLanguage = DEFAULT_LANGUAGE) {
    if (!tracks || tracks.length === 0) {
        return null;
    }

    // Try manual track in preferred language
    const manualTrack = getManualTrack(tracks, preferredLanguage);
    if (manualTrack) {
        return manualTrack;
    }

    // Try any track in preferred language
    const preferredTrack = findTrackByLanguage(tracks, preferredLanguage);
    if (preferredTrack) {
        return preferredTrack;
    }

    // Fallback to first available track
    return tracks[0];
}
