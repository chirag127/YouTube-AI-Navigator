import { GeminiService } from "../services/GeminiService.js";
import { ChunkingService } from "../services/ChunkingService.js";
import { SegmentClassificationService } from "../services/SegmentClassificationService.js";

console.log("YouTube AI Master: Background service worker started.");

const chunkingService = new ChunkingService();
let geminiService = null;
let segmentClassificationService = null;

// Initialize services
async function initServices() {
    const { geminiApiKey } = await chrome.storage.local.get("geminiApiKey");
    if (geminiApiKey) {
        geminiService = new GeminiService(geminiApiKey);
        segmentClassificationService = new SegmentClassificationService(
            geminiService,
            chunkingService
        );
        console.log("Services initialized with API key.");
    } else {
        console.log("API Key not found. Waiting for user input.");
    }
}

initServices();

// Listen for storage changes to update API key
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local" && changes.geminiApiKey) {
        initServices();
    }
});

// Handle messages from Content Script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "ANALYZE_VIDEO") {
        handleAnalyzeVideo(request, sendResponse);
        return true; // Async response
    } else if (request.action === "CHAT") {
        handleChat(request, sendResponse);
        return true; // Async response
    } else if (request.action === "ANALYZE_COMMENTS") {
        handleAnalyzeComments(request, sendResponse);
        return true; // Async response
    } else if (request.action === "FETCH_TRANSCRIPT") {
        handleFetchTranscript(request, sendResponse);
        return true; // Async response
    }
});

async function handleAnalyzeVideo(request, sendResponse) {
    try {
        if (!geminiService) {
            await initServices();
            if (!geminiService)
                throw new Error(
                    "API Key is missing. Please set it in options."
                );
        }

        const { transcript, metadata, options } = request;

        // 1. Generate Comprehensive Analysis (Summary, FAQ, Insights)
        const analysis = await geminiService.generateComprehensiveAnalysis(
            transcript.map((t) => t.text).join(" "),
            options
        );

        // 2. Classify Segments
        // Format transcript for segmentation
        const formattedTranscript = transcript
            .map((t) => `[${t.start.toFixed(1)}] ${t.text}`)
            .join("\n");

        const segments = await geminiService.extractSegments(
            formattedTranscript
        );

        sendResponse({
            success: true,
            data: {
                ...analysis,
                segments,
            },
        });
    } catch (error) {
        console.error("Analysis failed:", error);
        sendResponse({ success: false, error: error.message });
    }
}

async function handleChat(request, sendResponse) {
    try {
        if (!geminiService) throw new Error("API Key is missing.");

        const { question, context } = request;
        const answer = await geminiService.chatWithVideo(question, context);

        sendResponse({ success: true, answer });
    } catch (error) {
        console.error("Chat failed:", error);
        sendResponse({ success: false, error: error.message });
    }
}

async function handleAnalyzeComments(request, sendResponse) {
    try {
        if (!geminiService) {
            await initServices();
            if (!geminiService)
                throw new Error(
                    "API Key is missing. Please set it in options."
                );
        }

        const { comments } = request;
        const analysis = await geminiService.analyzeCommentSentiment(comments);

        sendResponse({ success: true, analysis });
    } catch (error) {
        console.error("Comment analysis failed:", error);
        sendResponse({ success: false, error: error.message });
    }
}
