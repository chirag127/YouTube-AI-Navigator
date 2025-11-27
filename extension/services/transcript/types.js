// Transcript data types

/**
 * @typedef {Object} TranscriptSegment
 * @property {number} start - Start time in seconds
 * @property {number} duration - Duration in seconds
 * @property {string} text - Transcript text
 */

/**
 * @typedef {Object} CaptionTrack
 * @property {string} baseUrl - API URL to fetch transcript
 * @property {string} languageCode - Language code (e.g., 'en')
 * @property {Object} name - Caption name object
 * @property {string} name.simpleText - Display name
 * @property {string} [kind] - 'asr' or 'manual'
 * @property {boolean} [isTranslatable] - Can be translated
 */

export { };
