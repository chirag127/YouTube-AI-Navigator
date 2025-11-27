// Load transcript when video page loads

import { isVideoPage, getCurrentVideoId } from "../services/video/detector.js";
import { hasCaptions, fetchTranscript } from "../services/transcript/index.js";
import { getCached, setCached } from "../services/transcript/cache.js";

/**
 * Load transcript for current video
 * @param {string} [languageCode] - Preferred language
 * @returns {Promise<Array>} Transcript segments
 */
export async function loadTranscript(languageCode) {
    if (!isVideoPage()) {
        throw new Error("Not on a video page");
    }

    const videoId = getCurrentVideoId();
    if (!videoId) {
        throw new Error("Could not extract video ID");
    }

    // Check cache first
    const cached = getCached(videoId, languageCode || "default");
    if (cached) {
        return cached;
    }

    // Check if captions available
    if (!hasCaptions()) {
        throw new Error("No captions available");
    }

    // Fetch transcript
    const transcript = await fetchTranscript(videoId, languageCode);

    // Cache result
    setCached(videoId, languageCode || "default", transcript);

    return transcript;
}

/**
 * Initialize transcript loading on page load
 */
export function initTranscriptLoader() {
    if (!isVideoPage()) {
        return;
    }

    // Wait for player to be ready
    const checkReady = setInterval(() => {
        if (hasCaptions()) {
            clearInterval(checkReady);
            console.log("Transcript service ready");
        }
    }, 500);

    // Timeout after 10 seconds
    setTimeout(() => clearInterval(checkReady), 10000);
}
