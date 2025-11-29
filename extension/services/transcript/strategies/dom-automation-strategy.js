import { $, $$, l, w, e as er, d, sl, nt } from '../../../utils/shortcuts.js';
class DOMAutomationStrategy {
    constructor() {
        this.name = 'DOM Automation';
        this.priority = 1;
        this.logger = this._createLogger('DOM-Automation');
    }
    _createLogger(prefix) {
        return {
            info: (msg, ...args) => l(`[${prefix}]ℹ️${msg}`, ...args),
            success: (msg, ...args) => l(`[${prefix}]✅${msg}`, ...args),
            warn: (msg, ...args) => w(`[${prefix}]⚠️${msg}`, ...args),
            error: (msg, ...args) => er(`[${prefix}]❌${msg}`, ...args),
            debug: (msg, ...args) => d(`[${prefix}]🔍${msg}`, ...args),
        };
    }
    async fetch(videoId, lang = 'en') {
        this.logger.info(`Starting DOM automation for ${videoId}...`);
        try {
            let transcriptContainer = $('ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-searchable-transcript"]');
            if (!this._isTranscriptVisible(transcriptContainer)) {
                this.logger.debug('Transcript panel not visible, attempting to open...');
                await this._openTranscriptPanel();
            } else {
                this.logger.debug('Transcript panel already visible');
            }
            await this._waitForSegments();
            const segments = this._scrapeSegments();
            if (!segments || segments.length === 0) throw new Error('No segments found after automation');
            this.logger.success(`Successfully scraped ${segments.length} segments`);
            return segments;
        } catch (error) {
            this.logger.error('Automation failed:', error.message);
            throw error;
        }
    }
    _isTranscriptVisible(container) {
        return container && container.visibility !== 'hidden' && container.offsetParent !== null;
    }
    async _openTranscriptPanel() {
        const expandButton = $('#expand');
        if (expandButton && expandButton.offsetParent !== null) {
            this.logger.debug('Clicking description expand button...');
            expandButton.click();
            await this._wait(500);
        }
        const selectors = [
            'button[aria-label="Show transcript"]',
            'ytd-button-renderer[aria-label="Show transcript"]',
            '#primary-button button[aria-label="Show transcript"]',
        ];
        let showTranscriptBtn = null;
        for (const selector of selectors) {
            showTranscriptBtn = $(selector);
            if (showTranscriptBtn) break;
        }
        if (!showTranscriptBtn) {
            const buttons = Array.from($$('button, ytd-button-renderer'));
            showTranscriptBtn = buttons.find(b => b.textContent.includes('Show transcript'));
        }
        if (showTranscriptBtn) {
            this.logger.debug('Clicking "Show transcript" button...');
            showTranscriptBtn.click();
            await this._wait(1000);
        } else {
            throw new Error('"Show transcript" button not found');
        }
    }
    async _waitForSegments(timeout = 5000) {
        const startTime = nt();
        while (nt() - startTime < timeout) {
            const segments = $$('ytd-transcript-segment-renderer');
            if (segments.length > 0) return;
            await this._wait(500);
        }
        throw new Error('Timeout waiting for transcript segments');
    }
    _scrapeSegments() {
        const segmentElements = $$('ytd-transcript-segment-renderer');
        const segments = [];
        segmentElements.forEach(el => {
            const timestampEl = el.querySelector('.segment-timestamp');
            const textEl = el.querySelector('.segment-text');
            if (timestampEl && textEl) {
                const timestampStr = timestampEl.textContent.trim();
                const text = textEl.textContent.trim();
                const start = this._parseTimestamp(timestampStr);
                segments.push({ start, text, duration: 0 });
            }
        });
        for (let i = 0; i < segments.length; i++) {
            if (i < segments.length - 1) {
                segments[i].duration = segments[i + 1].start - segments[i].start;
            } else {
                segments[i].duration = 5;
            }
        }
        return segments;
    }
    _parseTimestamp(str) {
        const parts = str.split(':').map(Number);
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
        else if (parts.length === 2) return parts[0] * 60 + parts[1];
        return 0;
    }
    _wait(ms) { return sl(ms); }
}
export const strategy = new DOMAutomationStrategy();
