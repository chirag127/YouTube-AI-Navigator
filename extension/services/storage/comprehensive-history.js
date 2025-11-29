// Comprehensive History Storage
// Stores ALL analysis data: transcripts, comments, segments, metadata, summaries

export class ComprehensiveHistory {
    constructor() {
        this.storageKey = 'comprehensive_history';
        this.maxItems = 100;
    }

    async save(videoId, data) {
        const entry = {
            videoId,
            timestamp: Date.now(),
            url: `https://www.youtube.com/watch?v=${videoId}`,

            // Metadata
            metadata: data.metadata || {},

            // Transcript
            transcript: data.transcript || [],

            // Comments
            comments: {
                raw: data.comments || [],
                analysis: data.commentAnalysis || null
            },

            // Segments
            segments: {
                detected: data.segments || [],
                actions: data.segmentActions || {}
            },

            // AI Analysis
            analysis: {
                summary: data.summary || null,
                comprehensive: data.comprehensiveReview || null,
                faq: data.faq || null,
                keyPoints: data.keyPoints || []
            },

            // Chat History
            chatHistory: data.chatHistory || [],

            // User Actions
            userActions: {
                liked: data.liked || false,
                watched: data.watchPercentage || 0,
                skippedSegments: data.skippedSegments || []
            }
        };

        const history = await this.getAll();

        // Remove existing entry for same video
        const filtered = history.filter(h => h.videoId !== videoId);

        // Add new entry at beginning
        filtered.unshift(entry);

        // Limit to maxItems
        const trimmed = filtered.slice(0, this.maxItems);

        await chrome.storage.local.set({ [this.storageKey]: trimmed });

        console.log(`[History] Saved comprehensive data for ${videoId}`);
        return entry;
    }

    async get(videoId) {
        const history = await this.getAll();
        return history.find(h => h.videoId === videoId);
    }

    async getAll() {
        const result = await chrome.storage.local.get(this.storageKey);
        return result[this.storageKey] || [];
    }

    async delete(videoId) {
        const history = await this.getAll();
        const filtered = history.filter(h => h.videoId !== videoId);
        await chrome.storage.local.set({ [this.storageKey]: filtered });
    }

    async clear() {
        await chrome.storage.local.remove(this.storageKey);
    }

    async search(query) {
        const history = await this.getAll();
        const lowerQuery = query.toLowerCase();

        return history.filter(entry => {
            return (
                entry.metadata?.title?.toLowerCase().includes(lowerQuery) ||
                entry.metadata?.author?.toLowerCase().includes(lowerQuery) ||
                entry.videoId.includes(lowerQuery)
            );
        });
    }

    async getStats() {
        const history = await this.getAll();

        return {
            totalVideos: history.length,
            totalTranscripts: history.filter(h => h.transcript?.length > 0).length,
            totalComments: history.filter(h => h.comments?.raw?.length > 0).length,
            totalSegments: history.filter(h => h.segments?.detected?.length > 0).length,
            totalAnalyses: history.filter(h => h.analysis?.summary).length,
            storageSize: JSON.stringify(history).length
        };
    }

    async export() {
        const history = await this.getAll();
        return JSON.stringify(history, null, 2);
    }

    async import(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            if (!Array.isArray(imported)) throw new Error('Invalid format');

            await chrome.storage.local.set({ [this.storageKey]: imported });
            return true;
        } catch (e) {
            console.error('[History] Import failed:', e);
            return false;
        }
    }
}

// Singleton
let instance = null;
export function getHistory() {
    if (!instance) instance = new ComprehensiveHistory();
    return instance;
}
