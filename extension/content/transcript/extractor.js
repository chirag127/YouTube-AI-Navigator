import { fetchTranscript } from '../../services/transcript/fetcher.js'

class TranscriptExtractor {
    constructor() {
        this.cache = new Map()
        this.cacheTimeout = 300000 // 5min
    }

    log(level, msg) {
        const icons = { info: 'ℹ️', success: '✅', warn: '⚠️', error: '❌' }
        console[level](`[TranscriptExtractor] ${icons[level]} ${msg}`)
    }

    async extract(videoId, { lang = 'en', useCache = true, timeout = 30000 } = {}) {
        this.log('info', `Extracting: ${videoId}, lang: ${lang}`)

        if (useCache) {
            const cached = this._getCache(videoId, lang)
            if (cached) {
                this.log('success', 'Cache hit')
                return cached
            }
        }

        try {
            const result = await fetchTranscript(videoId, lang, timeout)

            if (result?.length) {
                this.log('success', `${result.length} segments extracted`)
                this._setCache(videoId, lang, result)
                return result
            }

            throw new Error('Empty result from fetcher')
        } catch (e) {
            this.log('error', e.message)
            throw e
        }
    }

    getAvailableTracks() {
        const pr = getPlayerResponse()
        return pr?.captions?.playerCaptionsTracklistRenderer?.captionTracks || []
    }

    getAvailableLanguages() {
        return this.getAvailableTracks().map(t => ({
            code: t.languageCode,
            name: t.name?.simpleText || t.languageCode,
            kind: t.kind
        }))
    }

    hasCaptions() {
        return this.getAvailableTracks().length > 0
    }

    formatWithTimestamps(segments) {
        return segments.map(s => `[${formatTime(s.start)}] ${s.text}`).join('\n')
    }

    formatPlainText(segments) {
        return segments.map(s => s.text).join(' ')
    }

    _getCache(videoId, lang) {
        const cached = this.cache.get(`${videoId}_${lang}`)
        return cached && (Date.now() - cached.ts < this.cacheTimeout) ? cached.data : null
    }

    _setCache(videoId, lang, data) {
        this.cache.set(`${videoId}_${lang}`, { data, ts: Date.now() })
    }

    clearCache() {
        this.cache.clear()
        this.log('info', 'Cache cleared')
    }
}

function getPlayerResponse() {
    if (window.ytInitialPlayerResponse) return window.ytInitialPlayerResponse

    for (const script of document.querySelectorAll('script')) {
        const match = script.textContent?.match(/ytInitialPlayerResponse\s*=\s*({.+?});/)
        if (match) {
            try {
                return JSON.parse(match[1])
            } catch (e) {
                continue
            }
        }
    }
    return null
}

function formatTime(sec) {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = Math.floor(sec % 60)
    return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        : `${m}:${s.toString().padStart(2, '0')}`
}

export default new TranscriptExtractor()
export { TranscriptExtractor }
