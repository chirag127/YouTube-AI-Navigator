// YouTube Direct API Strategy
// Priority: 1 (Most reliable - Direct timedtext endpoint with full parameters)

import { parseXML } from "../parsers/xml-parser.js";
import { parseJSON3 } from "../parsers/json3-parser.js";

/**
 * Build YouTube timedtext API URL with all required parameters
 * This is the most reliable method as it uses YouTube's official API
 */
function buildTimedTextUrl(videoId, lang = "en", fmt = "json3") {
    const params = new URLSearchParams({
        v: videoId,
        lang: lang,
        fmt: fmt,
        // Additional parameters for reliability
        caps: "asr",
        kind: "asr",
        xoaf: "5",
        xowf: "1",
        hl: lang,
        ip: "0.0.0.0",
        ipbits: "0",
        // Client parameters from user request
        cbr: "Chrome",
        cbrver: "142.0.0.0",
        c: "WEB",
        cver: "2.20251125.06.00",
        cplayer: "UNIPLAYER",
        cos: "Windows",
        cosver: "10.0",
        cplatform: "DESKTOP",
        xorb: "2",
        xobt: "3",
        xovt: "3",
    });

    return `https://www.youtube.com/api/timedtext?${params.toString()}`;
}

/**
 * Get caption tracks from Main World via postMessage
 */
async function getCaptionTracksFromMainWorld() {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            window.removeEventListener("message", handler);
            resolve(null);
        }, 2000);

        const handler = (event) => {
            if (event.source !== window) return;
            if (event.data.type === "YT_DATA_RESPONSE") {
                clearTimeout(timeout);
                window.removeEventListener("message", handler);
                resolve(event.data.payload);
            }
        };

        window.addEventListener("message", handler);
        window.postMessage({ type: "YT_GET_DATA" }, "*");
    });
}

/**
 * Extract caption tracks from page script tags (fallback for Isolated World)
 */
function extractCaptionTracksFromDOM() {
    try {
        // Look for ytInitialPlayerResponse in script tags
        for (const script of document.querySelectorAll("script")) {
            const text = script.textContent || "";

            // Try to find ytInitialPlayerResponse
            const match = text.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s);
            if (match) {
                try {
                    const data = JSON.parse(match[1]);
                    if (
                        data?.captions?.playerCaptionsTracklistRenderer
                            ?.captionTracks
                    ) {
                        console.log(
                            "[YouTube Direct] Found caption tracks in script tag"
                        );
                        return data.captions.playerCaptionsTracklistRenderer
                            .captionTracks;
                    }
                } catch (e) {
                    continue;
                }
            }

            // Also try to find caption URLs directly in the page
            const captionMatch = text.match(/"captionTracks":\s*(\[.+?\])/s);
            if (captionMatch) {
                try {
                    const tracks = JSON.parse(captionMatch[1]);
                    if (tracks?.length) {
                        console.log(
                            "[YouTube Direct] Found caption tracks via regex"
                        );
                        return tracks;
                    }
                } catch (e) {
                    continue;
                }
            }
        }
    } catch (e) {
        console.warn("[YouTube Direct] DOM extraction failed:", e);
    }
    return null;
}

/**
 * Helper to fetch transcript from a caption track
 * Tries multiple formats: json3, srv3, srv1, default XML
 */
async function fetchFromTrack(track) {
    if (!track?.baseUrl) return null;

    console.log("[YouTube Direct] Fetching from track:", track.languageCode);

    // Try different formats - json3 first, then XML formats
    const formats = ["json3", "srv3", "srv1", ""];

    for (const fmt of formats) {
        try {
            let url = track.baseUrl;

            // Add or replace fmt parameter
            if (fmt) {
                if (url.includes("fmt=")) {
                    url = url.replace(/fmt=[^&]*/, `fmt=${fmt}`);
                } else {
                    url += `&fmt=${fmt}`;
                }
            }

            // Append client parameters if missing
            const extraParams = {
                cbr: "Chrome",
                cbrver: "142.0.0.0",
                c: "WEB",
                cver: "2.20251125.06.00",
                cplayer: "UNIPLAYER",
                cos: "Windows",
                cosver: "10.0",
                cplatform: "DESKTOP",
                xorb: "2",
                xobt: "3",
                xovt: "3",
            };

            for (const [key, value] of Object.entries(extraParams)) {
                if (!url.includes(`${key}=`)) {
                    url += `&${key}=${value}`;
                }
            }

            console.log(`[YouTube Direct] Trying format '${fmt || "default"}'`);

            const res = await fetch(url, {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) {
                console.warn(
                    `[YouTube Direct] Format '${fmt}' HTTP error:`,
                    res.status
                );
                continue;
            }

            const text = await res.text();
            console.log(
                `[YouTube Direct] Format '${fmt}' response length:`,
                text.length
            );

            if (!text || text.length === 0) continue;
            if (text.trim().startsWith("<!") || text.trim().startsWith("<html"))
                continue;

            let segments = [];

            // Try JSON parsing for json3 format
            if (fmt === "json3") {
                try {
                    const data = JSON.parse(text);
                    segments = parseJSON3(data);
                } catch (e) {
                    console.warn(
                        `[YouTube Direct] JSON parse failed for '${fmt}':`,
                        e.message
                    );
                    // Try XML parsing as fallback
                    if (
                        text.includes("<text") ||
                        text.includes("<transcript")
                    ) {
                        segments = parseXML(text);
                    }
                }
            } else {
                // XML formats (srv3, srv1, default)
                segments = parseXML(text);
            }

            if (segments?.length) {
                console.log(
                    `[YouTube Direct] ✅ Got ${segments.length
                    } segments from format '${fmt || "default"}'`
                );
                return segments;
            }
        } catch (e) {
            console.warn(`[YouTube Direct] Format '${fmt}' error:`, e.message);
        }
    }

    return null;
}

/**
 * Find the best caption track for the requested language
 */
function findBestTrack(tracks, lang) {
    if (!tracks?.length) return null;

    // Priority: exact match > starts with lang > first available
    let track = tracks.find((t) => t.languageCode === lang);
    if (!track)
        track = tracks.find((t) =>
            t.languageCode?.startsWith(lang.split("-")[0])
        );
    if (!track) track = tracks[0];

    return track;
}

export async function fetchViaYouTubeDirect(videoId, lang = "en") {
    console.log(
        `[YouTube Direct] Starting extraction for ${videoId}, lang: ${lang}`
    );

    // Strategy 1: Get data from Main World via postMessage
    try {
        console.log("[YouTube Direct] Trying Main World postMessage...");
        const initialData = await getCaptionTracksFromMainWorld();

        if (
            initialData?.playerResponse?.captions
                ?.playerCaptionsTracklistRenderer?.captionTracks
        ) {
            const tracks =
                initialData.playerResponse.captions
                    .playerCaptionsTracklistRenderer.captionTracks;
            console.log(
                `[YouTube Direct] Found ${tracks.length} tracks from Main World`
            );

            const track = findBestTrack(tracks, lang);
            if (track) {
                console.log(
                    `[YouTube Direct] Selected track: ${track.languageCode}, baseUrl: ${track.baseUrl}`
                );
                const segments = await fetchFromTrack(track);
                if (segments) return segments;
            }
        } else {
            console.log(
                "[YouTube Direct] No caption tracks found in Main World data"
            );
        }
    } catch (e) {
        console.warn(
            "[YouTube Direct] Main World postMessage failed:",
            e.message
        );
    }

    // Strategy 2: Extract caption tracks from DOM script tags
    try {
        console.log("[YouTube Direct] Trying DOM script extraction...");
        const tracks = extractCaptionTracksFromDOM();

        if (tracks?.length) {
            console.log(
                `[YouTube Direct] Found ${tracks.length} tracks from DOM`
            );
            const track = findBestTrack(tracks, lang);
            const segments = await fetchFromTrack(track);
            if (segments) return segments;
        }
    } catch (e) {
        console.warn("[YouTube Direct] DOM extraction failed:", e.message);
    }

    // Strategy 3: Try window.ytInitialPlayerResponse directly (works in Main World)
    try {
        console.log(
            "[YouTube Direct] Trying window.ytInitialPlayerResponse..."
        );
        const playerResponse = window.ytInitialPlayerResponse;
        if (
            playerResponse?.captions?.playerCaptionsTracklistRenderer
                ?.captionTracks
        ) {
            const tracks =
                playerResponse.captions.playerCaptionsTracklistRenderer
                    .captionTracks;
            console.log(
                `[YouTube Direct] Found ${tracks.length} tracks from window`
            );

            const track = findBestTrack(tracks, lang);
            const segments = await fetchFromTrack(track);
            if (segments) return segments;
        }
    } catch (e) {
        console.warn("[YouTube Direct] window access failed:", e.message);
    }

    // Try JSON3 first (most reliable and structured format)
    try {
        const url = buildTimedTextUrl(videoId, lang, "json3");
        console.log("[YouTube Direct] Fetching JSON3:", url);

        const res = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Accept-Language": lang,
            },
            credentials: "omit", // Don't send cookies to avoid auth issues
            cache: "no-cache",
        });

        console.log(
            "[YouTube Direct] Response status:",
            res.status,
            res.statusText
        );
        console.log("[YouTube Direct] Response headers:", {
            contentType: res.headers.get("content-type"),
            contentLength: res.headers.get("content-length"),
        });

        if (res.ok) {
            // Use arrayBuffer then decode to handle large responses better
            const buffer = await res.arrayBuffer();
            const text = new TextDecoder("utf-8").decode(buffer);

            console.log("[YouTube Direct] Response length:", text.length);
            console.log(
                "[YouTube Direct] Response preview:",
                text.substring(0, 100)
            );

            // Validate response is not empty
            if (!text || text.trim().length === 0) {
                throw new Error("Empty response");
            }

            // Parse JSON3 format
            const data = JSON.parse(text);
            const segments = parseJSON3(data);
            if (segments.length) {
                console.log(
                    `[YouTube Direct] ✅ Got ${segments.length} segments from JSON3 fallback`
                );
                return segments;
            }
        }
    } catch (e) {
        console.warn("[YouTube Direct] JSON3 fallback failed:", e.message);
    }

    return null;
}

export const strategy = {
    name: "YouTube Direct API",
    priority: 1, // Highest priority - most reliable method
    fetch: fetchViaYouTubeDirect,
};
