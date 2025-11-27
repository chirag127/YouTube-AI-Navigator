/**
 * Video Metadata Extractor
 * Extracts title, description, and other metadata from YouTube pages
 */

class MetadataExtractor {
    constructor() {
        this.cache = new Map()
        this.cacheTimeout = 300000 // 5min
    }

    log(level, msg) {
        const icons = { info: 'ℹ️', success: '✅', warn: '⚠️', error: '❌' }
        console[level](`[MetadataExtractor] ${icons[level]} ${msg}`)
    }

    /**
     * Extract video metadata from the current page
     * @param {string} videoId - The video ID
     * @returns {Object} Metadata object with title, description, author, etc.
     */
    extract(videoId) {
        this.log('info', `Extracting metadata for: ${videoId}`)

        // Check cache first
        const cached = this._getCache(videoId)
        if (cached) {
            this.log('success', 'Cache hit')
            return cached
        }

        const metadata = {
            videoId,
            title: this._extractTitle(),
            description: this._extractDescription(),
            author: this._extractAuthor(),
            viewCount: this._extractViewCount(),
            publishDate: this._extractPublishDate(),
            duration: this._extractDuration(),
            keywords: this._extractKeywords(),
            category: this._extractCategory()
        }

        this.log('success', `Metadata extracted: ${metadata.title}`)
        this._setCache(videoId, metadata)

        return metadata
    }

    _extractTitle() {
        // Try multiple methods to get the title
        const methods = [
            () => document.querySelector('h1.ytd-watch-metadata yt-formatted-string')?.textContent,
            () => document.querySelector('h1.title yt-formatted-string')?.textContent,
            () => document.querySelector('meta[name="title"]')?.content,
            () => document.querySelector('meta[property="og:title"]')?.content,
            () => document.title.replace(' - YouTube', '')
        ]

        for (const method of methods) {
            try {
                const title = method()
                if (title?.trim()) return title.trim()
            } catch (e) {
                continue
            }
        }

        return 'Unknown Title'
    }

    _extractDescription() {
        // Try multiple methods to get the description
        const methods = [
            () => {
                const expandButton = document.querySelector('tp-yt-paper-button#expand')
                if (expandButton && !expandButton.hasAttribute('hidden')) {
                    expandButton.click()
                }
                return document.querySelector('ytd-text-inline-expander#description-inline-expander yt-attributed-string')?.textContent
            },
            () => document.querySelector('#description yt-formatted-string')?.textContent,
            () => document.querySelector('meta[name="description"]')?.content,
            () => document.querySelector('meta[property="og:description"]')?.content,
            () => this._extractFromPlayerResponse()?.videoDetails?.shortDescription
        ]

        for (const method of methods) {
            try {
                const description = method()
                if (description?.trim()) return description.trim()
            } catch (e) {
                continue
            }
        }

        return ''
    }

    _extractAuthor() {
        const methods = [
            () => document.querySelector('ytd-channel-name#channel-name yt-formatted-string a')?.textContent,
            () => document.querySelector('#owner-name a')?.textContent,
            () => document.querySelector('link[itemprop="name"]')?.content,
            () => this._extractFromPlayerResponse()?.videoDetails?.author
        ]

        for (const method of methods) {
            try {
                const author = method()
                if (author?.trim()) return author.trim()
            } catch (e) {
                continue
            }
        }

        return 'Unknown Channel'
    }

    _extractViewCount() {
        const methods = [
            () => {
                const viewText = document.querySelector('ytd-video-view-count-renderer span.view-count')?.textContent
                return this._parseViewCount(viewText)
            },
            () => {
                const viewText = document.querySelector('#info-container #count')?.textContent
                return this._parseViewCount(viewText)
            },
            () => this._extractFromPlayerResponse()?.videoDetails?.viewCount
        ]

        for (const method of methods) {
            try {
                const views = method()
                if (views) return views
            } catch (e) {
                continue
            }
        }

        return 'Unknown'
    }

    _parseViewCount(text) {
        if (!text) return null
        const match = text.match(/[\d,]+/)
        return match ? match[0].replace(/,/g, '') : null
    }

    _extractPublishDate() {
        const methods = [
            () => document.querySelector('meta[itemprop="uploadDate"]')?.content,
            () => document.querySelector('#info-strings yt-formatted-string')?.textContent,
            () => this._extractFromPlayerResponse()?.microformat?.playerMicroformatRenderer?.publishDate
        ]

        for (const method of methods) {
            try {
                const date = method()
                if (date) return date
            } catch (e) {
                continue
            }
        }

        return null
    }

    _extractDuration() {
        const methods = [
            () => document.querySelector('meta[itemprop="duration"]')?.content,
            () => {
                const video = document.querySelector('video')
                return video?.duration ? Math.floor(video.duration) : null
            },
            () => this._extractFromPlayerResponse()?.videoDetails?.lengthSeconds
        ]

        for (const method of methods) {
            try {
                const duration = method()
                if (duration) return duration
            } catch (e) {
                continue
            }
        }

        return null
    }

    _extractKeywords() {
        const methods = [
            () => document.querySelector('meta[name="keywords"]')?.content?.split(',').map(k => k.trim()),
            () => this._extractFromPlayerResponse()?.videoDetails?.keywords
        ]

        for (const method of methods) {
            try {
                const keywords = method()
                if (keywords?.length) return keywords
            } catch (e) {
                continue
            }
        }

        return []
    }

    _extractCategory() {
        try {
            return this._extractFromPlayerResponse()?.microformat?.playerMicroformatRenderer?.category
        } catch (e) {
            return null
        }
    }

    _extractFromPlayerResponse() {
        if (window.ytInitialPlayerResponse) {
            return window.ytInitialPlayerResponse
        }

        // Try to find it in script tags
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

    _getCache(videoId) {
        const cached = this.cache.get(videoId)
        return cached && (Date.now() - cached.ts < this.cacheTimeout) ? cached.data : null
    }

    _setCache(videoId, data) {
        this.cache.set(videoId, { data, ts: Date.now() })
    }

    clearCache() {
        this.cache.clear()
        this.log('info', 'Cache cleared')
    }
}

export default new MetadataExtractor()
export { MetadataExtractor }
