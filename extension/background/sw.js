import { l, w, e } from '../utils/shortcuts.js';
chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
        l('YouTube AI Master installed');
        try {
            const onboardingUrl = chrome.runtime.getURL('onboarding/onboarding.html');
            await chrome.tabs.create({ url: onboardingUrl });
        } catch (x) { e('Failed to open onboarding:', x); }
    } else if (details.reason === 'update') {
        l('YouTube AI Master updated to version', chrome.runtime.getManifest().version);
    }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const action = request.action || request.type;
    l('Background received message:', action);
    (async () => {
        try {
            const { verifySender } = await import('./security/sender-check.js');
            if (!verifySender(sender)) { sendResponse({ success: false, error: 'Unauthorized' }); return; }
            const { validateMessage, sanitizeRequest } = await import('./security/validator.js');
            const validation = validateMessage(request);
            if (!validation.valid) { sendResponse({ success: false, error: validation.error }); return; }
            const sanitized = sanitizeRequest(request);
            switch (action) {
                case 'TEST': sendResponse({ success: true, message: 'Background script is running' }); break;
                case 'GET_SETTINGS': { const { handleGetSettings } = await import('./handlers/settings.js'); await handleGetSettings(sendResponse); break; }
                case 'FETCH_TRANSCRIPT': { const { handleFetchTranscript } = await import('./handlers/fetch-transcript.js'); await handleFetchTranscript(sanitized, sendResponse); break; }
                case 'ANALYZE_VIDEO': { const { handleAnalyzeVideo } = await import('./handlers/analyze-video.js'); await handleAnalyzeVideo(sanitized, sendResponse); break; }
                case 'ANALYZE_COMMENTS': { const { handleAnalyzeComments } = await import('./handlers/comments.js'); await handleAnalyzeComments(sanitized, sendResponse); break; }
                case 'CHAT_WITH_VIDEO': { const { handleChatWithVideo } = await import('./handlers/chat.js'); await handleChatWithVideo(sanitized, sendResponse); break; }
                case 'SAVE_TO_HISTORY': { const { handleSaveToHistory } = await import('./handlers/history.js'); await handleSaveToHistory(sanitized, sendResponse); break; }
                case 'SAVE_HISTORY': { const { handleSaveHistory } = await import('./handlers/video-data.js'); sendResponse(await handleSaveHistory(sanitized)); break; }
                case 'GET_METADATA': { const { handleGetMetadata } = await import('./handlers/metadata.js'); await handleGetMetadata(sanitized, sendResponse); break; }
                case 'FETCH_INVIDIOUS_TRANSCRIPT': { const { handleFetchInvidiousTranscript } = await import('./handlers/invidious.js'); sendResponse(await handleFetchInvidiousTranscript(sanitized)); break; }
                case 'FETCH_INVIDIOUS_METADATA': { const { handleFetchInvidiousMetadata } = await import('./handlers/invidious.js'); sendResponse(await handleFetchInvidiousMetadata(sanitized)); break; }
                case 'GET_CACHED_DATA': { const { handleGetCachedData } = await import('./handlers/cache.js'); await handleGetCachedData(sanitized, sendResponse); break; }
                case 'SAVE_CHAT_MESSAGE': { const { handleSaveChatMessage } = await import('./handlers/chat-history.js'); await handleSaveChatMessage(sanitized, sendResponse); break; }
                case 'SAVE_COMMENTS': { const { handleSaveComments } = await import('./handlers/comments-storage.js'); await handleSaveComments(sanitized, sendResponse); break; }
                case 'TRANSCRIBE_AUDIO': { const { handleTranscribeAudio } = await import('./handlers/transcribe-audio.js'); await handleTranscribeAudio(sanitized, sendResponse); break; }
                case 'GET_LYRICS': { const { handleGetLyrics } = await import('./handlers/get-lyrics.js'); await handleGetLyrics(sanitized, sendResponse); break; }
                case 'GET_VIDEO_DATA': { const { handleGetVideoData } = await import('./handlers/video-data.js'); sendResponse(await handleGetVideoData(sanitized)); break; }
                case 'OPEN_OPTIONS': chrome.runtime.openOptionsPage(); sendResponse({ success: true }); break;
                default: w('Unknown message type:', action); sendResponse({ success: false, error: 'Unknown message type' });
            }
        } catch (error) { e('Background handler error:', error); sendResponse({ success: false, error: error.message }); }
    })();
    return true;
});
