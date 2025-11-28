import { initializeServices, getServices } from "../services.js";
import { getApiKey } from "../utils/api-key.js";
import geniusLyricsAPI from "../../api/genius-lyrics.js";
import sponsorBlockAPI from "../../api/sponsorblock.js";
import { ContextManager } from "../../services/context-manager.js";

let keepAliveInterval = null;

function startKeepAlive() {
    if (keepAliveInterval) return;
    keepAliveInterval = setInterval(
        () => chrome.runtime.getPlatformInfo(() => {}),
        20000
    );
}

function stopKeepAlive() {
    if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
    }
}

export async function handleAnalyzeVideo(request, sendResponse) {
    const {
        transcript,
        metadata,
        comments = [],
        options = {},
        useCache = true,
    } = request;
    const videoId = metadata?.videoId;
    startKeepAlive();

    try {
        const apiKey = await getApiKey();
        if (!apiKey) {
            sendResponse({ success: false, error: "API Key not configured" });
            return;
        }

        await initializeServices(apiKey);
        const { gemini, segmentClassification, storage } = getServices();

        if (useCache && videoId) {
            const cached = await storage.getVideoData(videoId);
            // Only use cache if we have summary AND segments (and segments is not empty array)
            if (
                cached?.summary &&
                cached?.segments &&
                cached.segments.length > 0
            ) {
                console.log(
                    "[AnalyzeVideo] Returning cached data with segments"
                );
                sendResponse({
                    success: true,
                    fromCache: true,
                    data: {
                        summary: cached.summary,
                        faq: cached.faq,
                        insights: cached.insights,
                        segments: cached.segments,
                        timestamps: cached.timestamps,
                    },
                });
                return;
            } else if (cached?.summary) {
                console.log(
                    "[AnalyzeVideo] Cache exists but segments missing/empty. Re-generating segments..."
                );
                // If we have summary but no segments, we might want to just generate segments
                // But for simplicity and robustness, let's re-run the whole flow or at least the segment part.
                // Given the structure, we'll proceed to generate.
            }
        }

        let lyrics = null;
        const isMusic =
            metadata?.category === "Music" ||
            metadata?.title?.toLowerCase().includes("official video") ||
            metadata?.title?.toLowerCase().includes("lyrics");

        if (isMusic || !transcript?.length) {
            try {
                lyrics = await geniusLyricsAPI.getLyrics(
                    metadata.title,
                    metadata.author
                );
            } catch (e) {}
        }

        // Fetch SponsorBlock segments
        let sponsorBlockSegments = [];
        if (videoId) {
            try {
                sponsorBlockSegments = await sponsorBlockAPI.fetchSegments(
                    videoId
                );
                console.log(
                    `[AnalyzeVideo] SponsorBlock segments: ${sponsorBlockSegments.length}`
                );
            } catch (e) {
                console.warn(
                    "[AnalyzeVideo] SponsorBlock fetch failed:",
                    e.message
                );
            }
        }

        // Fetch External Context (APIs)
        let externalContext = {};
        try {
            console.log("[AnalyzeVideo] Starting ContextManager fetch...");

            // Step 1: Check chrome.storage.sync availability
            console.log(
                "[AnalyzeVideo] Checking chrome.storage.sync availability..."
            );
            if (!chrome.storage || !chrome.storage.sync) {
                throw new Error("chrome.storage.sync is not available");
            }

            // Step 2: Retrieve settings with detailed logging
            console.log(
                "[AnalyzeVideo] Retrieving settings from chrome.storage.sync..."
            );
            const settings = await chrome.storage.sync.get(null);
            console.log(
                "[AnalyzeVideo] Settings retrieved:",
                Object.keys(settings || {})
            );

            // Step 3: Validate settings
            if (!settings || Object.keys(settings).length === 0) {
                console.warn(
                    "[AnalyzeVideo] Warning: No settings found in chrome.storage.sync"
                );
            }

            // Step 4: Validate metadata
            if (!metadata) {
                throw new Error("Metadata is null/undefined");
            }
            console.log(
                "[AnalyzeVideo] Metadata validation - Title:",
                metadata.title ? "✓" : "✗",
                "Category:",
                metadata.category ? "✓" : "✗",
                "Author:",
                metadata.author ? "✓" : "✗"
            );

            // Step 5: Create ContextManager
            console.log(
                "[AnalyzeVideo] Creating ContextManager with settings..."
            );
            const contextManager = new ContextManager(settings);
            console.log("[AnalyzeVideo] ContextManager created successfully");

            // Step 6: Execute fetchContext with timeout
            console.log(
                "[AnalyzeVideo] Starting context fetch with 10-second timeout..."
            );
            const fetchPromise = contextManager.fetchContext(metadata);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(
                    () => reject(new Error("ContextManager timeout after 10s")),
                    10000
                )
            );

            externalContext = await Promise.race([
                fetchPromise,
                timeoutPromise,
            ]);
            console.log(
                "[AnalyzeVideo] ContextManager completed successfully, keys:",
                Object.keys(externalContext || {})
            );
        } catch (e) {
            console.error("[AnalyzeVideo] ContextManager failed:", e.message);
            console.error("[AnalyzeVideo] Error stack:", e.stack);

            // Provide specific error context
            if (e.message.includes("timeout")) {
                console.warn(
                    "[AnalyzeVideo] Issue: External API calls are taking too long (>10s)"
                );
            } else if (e.message.includes("chrome.storage")) {
                console.warn(
                    "[AnalyzeVideo] Issue: chrome.storage.sync not accessible"
                );
            } else if (e.message.includes("Metadata")) {
                console.warn(
                    "[AnalyzeVideo] Issue: Missing or invalid metadata"
                );
            } else {
                console.warn(
                    "[AnalyzeVideo] Issue: Unexpected error - check API keys and network connectivity"
                );
            }
        }

        if ((!transcript || !transcript.length) && !lyrics) {
            throw new Error("No transcript or lyrics available");
        }

        const formatTime = (s) => {
            const m = Math.floor(s / 60);
            const sec = Math.floor(s % 60);
            return `${m}:${sec.toString().padStart(2, "0")}`;
        };

        // Construct Unified Context
        const analysisContext = {
            transcript: transcript || [],
            lyrics: lyrics,
            comments: comments || [],
            metadata: metadata,
            sponsorBlockSegments: sponsorBlockSegments,
            externalContext: externalContext,
        };

        const analysis = await gemini.generateComprehensiveAnalysis(
            analysisContext,
            {
                model: "gemini-2.5-flash-lite-preview-09-2025",
                language: options.language || "English",
                length: options.length || "Medium",
            }
        );

        let segments = [];
        let fullVideoLabel = null;
        console.log("[AnalyzeVideo] Options:", JSON.stringify(options));
        if (options.generateSegments !== false) {
            console.log("[AnalyzeVideo] Generating segments...");
            const segmentResult =
                await segmentClassification.classifyTranscript({
                    transcript: transcript || [],
                    metadata,
                    lyrics,
                    comments,
                });
            segments = segmentResult.segments;
            fullVideoLabel = segmentResult.fullVideoLabel;
            console.log(
                "[AnalyzeVideo] Segments generated:",
                segments.length,
                "Full Label:",
                fullVideoLabel
            );
        } else {
            console.log(
                "[AnalyzeVideo] Segment generation disabled in options"
            );
        }

        if (videoId && storage) {
            try {
                await storage.saveVideoData(videoId, {
                    metadata,
                    transcript,
                    summary: analysis.summary,
                    faq: analysis.faq || "",
                    insights: analysis.insights || "",
                    segments,
                    timestamps: analysis.timestamps,
                });
            } catch (e) {}
        }

        sendResponse({
            success: true,
            fromCache: false,
            data: {
                summary: analysis.summary,
                faq: analysis.faq,
                insights: analysis.insights,
                segments,
                fullVideoLabel,
                timestamps: analysis.timestamps,
            },
        });
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    } finally {
        stopKeepAlive();
    }
}
