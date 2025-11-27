import { decodeHTML } from '../utils/dom.js'

// Singleton instance
let transcriptServiceInstance = null

/**
 * Logger utility for consistent logging
 */
class Logger {
    constructor(prefix) {
        this.prefix = prefix
    }

    info(message, ...args) {
        console.log(`[${this.prefix}] ℹ️ ${message}`, ...args)
    }

    success(message, ...args) {
        console.log(`[${this.prefix}] ✅ ${message}`, ...args)
    }

    warn(message, ...args) {
        console.warn(`[${this.prefix}] ⚠️ ${message}`, ...args)
    }

    error(message, ...args) {
        console.error(`[${this.prefix}] ❌ ${message}`, ...args)
    }

    debug(message, ...args) {
        console.debug(`[${this.prefix}] 🔍 ${message}`, ...args)
    }
}

const logger = new Logger('TranscriptService')

export class TranscriptService {
    async getTranscript(v, l = 'en') {
        logger.info(`Fetching transcript for video: ${v}, language: ${l}`)

        // Priority order: Invidious API first, then fallbacks
        const methods = [
            { name: 'Invidious API', fn: () => this._method1_InvidiousAPI(v, l) },
            { name: 'YouTube Direct API', fn: () => this._method2_YouTubeAPI(v, l) },
            { name: 'Background Proxy', fn: () => this._method3_BackgroundProxy(v, l) },
            { name: 'DOM Parser', fn: () => this._method4_DOMParse() }
        ]

        let lastError = null

        for (let i = 0; i < methods.length; i++) {
            const method = methods[i]
            try {
                logger.info(`Attempting method ${i + 1}/${methods.length}: ${method.name}`)
                const startTime = performance.now()

                const result = await method.fn()

                if (result?.length > 0) {
                    const duration = (performance.now() - startTime).toFixed(2)
                    logger.success(`${method.name} succeeded in ${duration}ms with ${result.length} segments`)
                    return result
                } else {
                    logger.warn(`${method.name} returned empty result`)
                }
            } catch (e) {
                lastError = e
                logger.error(`${method.name} failed:`, e.message)
            }
        }

        // Provide more specific error messages
        if (lastError?.message.includes('No transcript data') || lastError?.message.includes('captions')) {
            throw new Error('This video does not have captions available')
        }
        throw new Error('Unable to fetch transcript. The video may not have captions enabled.')
    }
    async getMetadata(v) {
        logger.info(`Fetching metadata for video: ${v}`)

        // Try Invidious API first
        try {
            logger.debug('Attempting Invidious API for metadata')
            const r = await chrome.runtime.sendMessage({ action: 'FETCH_INVIDIOUS_METADATA', videoId: v })
            if (r.success) {
                logger.success('Metadata fetched from Invidious API')
                return r.data
            }
        } catch (e) {
            logger.warn('Invidious metadata fetch failed:', e.message)
        }

        // Fallback to ytInitialPlayerResponse
        if (window.ytInitialPlayerResponse) {
            logger.debug('Using ytInitialPlayerResponse for metadata')
            const d = window.ytInitialPlayerResponse.videoDetails
            return { title: d.title, duration: parseInt(d.lengthSeconds, 10), author: d.author, viewCount: d.viewCount }
        }

        // Fallback to background message
        try {
            logger.debug('Attempting background proxy for metadata')
            const r = await chrome.runtime.sendMessage({ action: 'GET_METADATA', videoId: v })
            if (r.success) return r.data
        } catch (e) {
            logger.error('Background metadata fetch failed:', e.message)
        }

        throw new Error('Failed to get metadata')
    }

    async _method1_InvidiousAPI(v, l) {
        logger.debug(`Calling Invidious API for video ${v}, lang ${l}`)
        try {
            const r = await chrome.runtime.sendMessage({
                action: 'FETCH_INVIDIOUS_TRANSCRIPT',
                videoId: v,
                lang: l
            })

            if (r.success && r.data) {
                logger.debug(`Invidious returned ${r.data.length} segments`)
                return r.data
            }

            throw new Error(r.error || 'Invidious API returned no data')
        } catch (e) {
            logger.error('Invidious API error:', e.message)
            throw new Error(`Invidious API failed: ${e.message}`)
        }
    }

    async _method2_YouTubeAPI(v, l) {
        logger.debug(`Calling YouTube Direct API for video ${v}, lang ${l}`)
        const u = `https://www.youtube.com/api/timedtext?v=${v}&lang=${l}&fmt=json3`
        logger.debug(`Request URL: ${u}`)

        const r = await fetch(u)
        if (!r.ok) {
            throw new Error(`YouTube API failed: HTTP ${r.status}`)
        }

        const d = await r.json()
        if (!d.events) {
            throw new Error('No transcript data in YouTube API response')
        }

        const segments = d.events
            .filter(e => e.segs)
            .map(e => ({
                start: e.tStartMs / 1000,
                duration: (e.dDurationMs || 0) / 1000,
                text: e.segs.map(s => s.utf8).join('')
            }))

        logger.debug(`YouTube API returned ${segments.length} segments`)
        return segments
    }
    async _method3_BackgroundProxy(v, l) {
        const r = await chrome.runtime.sendMessage({ action: 'FETCH_TRANSCRIPT', videoId: v, lang: l })
        if (!r.success) throw new Error(r.error)
        return r.data.segments
    }
    async _method4_DOMParse() {
        if (window.ytInitialPlayerResponse) {
            const t = window.ytInitialPlayerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks
            if (t?.length > 0) {
                const tr = t[0], r = await fetch(tr.baseUrl), x = await r.text()
                return this._parseXML(x)
            }
        }
        throw new Error('DOM parse failed')
    }
    _parseXML(x) {
        const s = [], re = /<text start="([\d.]+)" dur="([\d.]+)">([^<]+)<\/text>/g; let m
        while ((m = re.exec(x)) !== null) s.push({ start: parseFloat(m[1]), duration: parseFloat(m[2]), text: decodeHTML(m[3]) })
        return s
    }
}


/**
 * Get transcript for a video (convenience function)
 */
export async function getTranscript(videoId, lang = 'en') {
    if (!transcriptServiceInstance) {
        transcriptServiceInstance = new TranscriptService()
    }
    return transcriptServiceInstance.getTranscript(videoId, lang)
}

/**
 * Get video metadata (convenience function)
 */
export async function getMetadata(videoId) {
    if (!transcriptServiceInstance) {
        transcriptServiceInstance = new TranscriptService()
    }
    return transcriptServiceInstance.getMetadata(videoId)
}
