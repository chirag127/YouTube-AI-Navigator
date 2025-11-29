import { state } from "../../core/state.js";
import TranscriptExtractor from "../../transcript/extractor.js";
import metadataExtractor from "../../metadata/extractor.js";
import { getComments } from "../../handlers/comments.js";
import { showLoading, showError } from "../../ui/components/loading.js";
import { switchTab } from "../../ui/tabs.js";
import { injectSegmentMarkers } from "../../segments/markers.js";
import { setupAutoSkip } from "../../segments/autoskip.js";
import { renderTimeline } from "../../segments/timeline.js";
import { analyzeVideo } from "./service.js";

export async function startAnalysis() {
    if (state.isAnalyzing || !state.currentVideoId) return;
    state.isAnalyzing = true;
    const contentArea = document.getElementById("yt-ai-content-area");

    try {
        // 1. Metadata
        showLoading(contentArea, "Extracting video metadata...");
        const metadata = await metadataExtractor.extract(state.currentVideoId);

        // 2. Transcript
        showLoading(contentArea, "Extracting transcript...");
        let transcript = [];
        try {
            transcript = await TranscriptExtractor.extract(
                state.currentVideoId
            );
        } catch (e) {
            console.warn("[Flow] Transcript extraction failed:", e);
            // Continue without transcript, will try lyrics fallback in background
        }

        state.currentTranscript = transcript || [];

        // 3. Comments (New)
        showLoading(contentArea, "Extracting comments...");
        let comments = [];
        try {
            comments = await getComments();
        } catch (e) {
            console.warn("[Flow] Comments extraction failed:", e);
        }

        // 4. AI Analysis
        showLoading(contentArea, `Analyzing content with AI...`);
        console.log("[Flow] Starting AI analysis...", {
            transcriptLength: transcript?.length,
            commentsCount: comments?.length,
        });

        const result = await analyzeVideo(transcript, metadata, comments);
        console.log("[Flow] AI analysis result received", result);

        if (!result.success) {
            throw new Error(result.error || "Analysis failed");
        }

        state.analysisData = result.data;

        // 5. Post-processing (Segments, UI)
        if (state.analysisData.segments) {
            injectSegmentMarkers(state.analysisData.segments);
            setupAutoSkip(state.analysisData.segments);

            const video = document.querySelector("video");
            if (video) {
                renderTimeline(state.analysisData.segments, video.duration);
            }
        }

        // 6. Save to Comprehensive History
        try {
            await saveToHistory({
                videoId: state.currentVideoId,
                metadata,
                transcript,
                comments,
                commentAnalysis: state.analysisData.commentAnalysis,
                segments: state.analysisData.segments,
                summary: state.analysisData.summary,
                comprehensiveReview: state.analysisData.comprehensive,
                faq: state.analysisData.faq,
                keyPoints: state.analysisData.keyPoints,
                chatHistory: state.chatHistory || []
            });
        } catch (e) {
            console.warn('[Flow] History save failed:', e);
        }

        // Switch to Summary tab by default
        switchTab("summary");
    } catch (error) {
        showError(contentArea, error.message);
    } finally {
        state.isAnalyzing = false;
    }
}

async function saveToHistory(data) {
    await chrome.runtime.sendMessage({
        action: 'SAVE_HISTORY',
        data
    });
}
