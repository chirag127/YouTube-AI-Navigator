/**
 * Invidious API Service
 * Primary method for fetching video data and transcripts
 * Documentation: https://docs.invidious.io/api/
 */

// Fallback instances (reliable ones based on live API data)
const FALLBACK_INSTANCES = [
    'https://inv.nadeko.net',
    'https://invidious.nerdvpn.de',
    'https://invidious.f5.si',
    'https://inv.perditum.com',
    'https://yewtu.be'
]

// Cache for instances list
let cachedInstancesList = null
let instancesListCacheTime = 0
const INSTANCES_LIST_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Cache for working instance
let workingInstance = null
let lastInstanceCheck = 0
const INSTANCE_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes

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

const logger = new Logger('Invidious')

/**
 * Find a working Invidious instance
 * @returns {Promise<string>} Working instance URL
 */
async function findWorkingInstance() {
    const now = Date.now()

    // Return cached instance if still valid
    if (workingInstance && (now - lastInstanceCheck) < INSTANCE_CHECK_INTERVAL) {
        logger.debug(`Using cached instance: ${workingInstance}`)
        return workingInstance
    }

    logger.info('Finding working Invidious instance...')

    const instances = await getInstancesList()

    for (const instance of instances) {
        try {
            logger.debug(`Testing instance: ${instance}`)
            const response = await fetch(`${instance}/api/v1/stats`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000) // 5 second timeout
            })

            if (response.ok) {
                const data = await response.json()
                logger.success(`Found working instance: ${instance}`, {
                    version: data.software?.version,
                    openRegistrations: data.openRegistrations
                })
                workingInstance = instance
                lastInstanceCheck = now
                return instance
            }
        } catch (error) {
            logger.warn(`Instance ${instance} failed:`, error.message)
        }
    }

    throw new Error('No working Invidious instance found')
}

/**
 * Fetch video data from Invidious API
 * @param {string} videoId - YouTube video ID
 * @param {string} region - ISO 3166 country code
 * @returns {Promise<Object>} Video data
 */
export async function fetchVideoData(videoId, region = 'US') {
    logger.info(`Fetching video data for: ${videoId}`)

    const instance = await findWorkingInstance()
    const url = `${instance}/api/v1/videos/${videoId}?region=${region}`

    logger.debug(`Request URL: ${url}`)

    try {
        const response = await fetch(url, {
            method: 'GET',
            signal: AbortSignal.timeout(10000) // 10 second timeout
        })

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        logger.success(`Video data fetched successfully`, {
            title: data.title,
            author: data.author,
            lengthSeconds: data.lengthSeconds,
            viewCount: data.viewCount,
            captionsAvailable: data.captions?.length || 0
        })

        return data
    } catch (error) {
        logger.error(`Failed to fetch video data:`, error.message)
        throw error
    }
}

/**
 * Fetch captions/transcript from Invidious API
 * @param {string} videoId - YouTube video ID
 * @param {string} lang - Language code (default: 'en')
 * @returns {Promise<Array>} Transcript segments
 */
export async function fetchTranscript(videoId, lang = 'en') {
    logger.info(`Fetching transcript for: ${videoId} (lang: ${lang})`)

    try {
        // First, get video data to find available captions
        const videoData = await fetchVideoData(videoId)

        if (!videoData.captions || videoData.captions.length === 0) {
            throw new Error('No captions available for this video')
        }

        logger.debug(`Available captions:`, videoData.captions.map(c => ({
            label: c.label,
            languageCode: c.language_code
        })))

        // Find caption track for requested language
        let captionTrack = videoData.captions.find(c => c.language_code === lang)

        // Fallback to first available caption if requested language not found
        if (!captionTrack) {
            logger.warn(`Language '${lang}' not found, using fallback: ${videoData.captions[0].language_code}`)
            captionTrack = videoData.captions[0]
        }

        logger.debug(`Selected caption track:`, {
            label: captionTrack.label,
            languageCode: captionTrack.language_code,
            url: captionTrack.url
        })

        // Fetch caption data
        const captionUrl = captionTrack.url
        const response = await fetch(captionUrl, {
            signal: AbortSignal.timeout(10000)
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch captions: HTTP ${response.status}`)
        }

        const captionText = await response.text()
        logger.debug(`Caption data received, length: ${captionText.length} bytes`)

        // Parse caption format (usually WebVTT or XML)
        const segments = parseCaptionData(captionText)

        logger.success(`Transcript parsed successfully: ${segments.length} segments`)

        return segments
    } catch (error) {
        logger.error(`Failed to fetch transcript:`, error.message)
        throw error
    }
}

/**
 * Parse caption data (WebVTT or XML format)
 * @param {string} data - Raw caption data
 * @returns {Array} Transcript segments
 */
function parseCaptionData(data) {
    logger.debug('Parsing caption data...')

    // Try WebVTT format first
    if (data.includes('WEBVTT')) {
        return parseWebVTT(data)
    }

    // Try XML format
    if (data.trim().startsWith('<?xml') || data.includes('<transcript>')) {
        return parseXML(data)
    }

    // Try JSON3 format
    try {
        const json = JSON.parse(data)
        if (json.events) {
            return parseJSON3(json)
        }
    } catch (e) {
        // Not JSON, continue
    }

    logger.warn('Unknown caption format, attempting generic parse')
    return parseGeneric(data)
}

/**
 * Parse WebVTT format captions
 */
function parseWebVTT(data) {
    logger.debug('Parsing WebVTT format')
    const segments = []
    const lines = data.split('\n')
    let currentSegment = null

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        // Skip empty lines and WEBVTT header
        if (!line || line.startsWith('WEBVTT') || line.startsWith('NOTE')) {
            continue
        }

        // Timestamp line (e.g., "00:00:00.000 --> 00:00:02.000")
        if (line.includes('-->')) {
            const [startStr, endStr] = line.split('-->').map(s => s.trim())
            const start = parseTimestamp(startStr)
            const end = parseTimestamp(endStr)

            currentSegment = {
                start,
                duration: end - start,
                text: ''
            }
        }
        // Text line
        else if (currentSegment) {
            currentSegment.text += (currentSegment.text ? ' ' : '') + line

            // Check if next line is empty or timestamp (end of segment)
            if (i + 1 >= lines.length || !lines[i + 1].trim() || lines[i + 1].includes('-->')) {
                segments.push(currentSegment)
                currentSegment = null
            }
        }
    }

    logger.debug(`Parsed ${segments.length} WebVTT segments`)
    return segments
}

/**
 * Parse XML format captions
 */
function parseXML(data) {
    logger.debug('Parsing XML format')
    const segments = []
    const regex = /<text start="([\d.]+)" dur="([\d.]+)"[^>]*>([^<]*)<\/text>/g
    let match

    while ((match = regex.exec(data)) !== null) {
        segments.push({
            start: parseFloat(match[1]),
            duration: parseFloat(match[2]),
            text: decodeHTML(match[3])
        })
    }

    logger.debug(`Parsed ${segments.length} XML segments`)
    return segments
}

/**
 * Parse JSON3 format (YouTube's format)
 */
function parseJSON3(data) {
    logger.debug('Parsing JSON3 format')
    const segments = data.events
        .filter(event => event.segs)
        .map(event => ({
            start: event.tStartMs / 1000,
            duration: (event.dDurationMs || 0) / 1000,
            text: event.segs.map(seg => seg.utf8).join('')
        }))

    logger.debug(`Parsed ${segments.length} JSON3 segments`)
    return segments
}

/**
 * Generic parser for unknown formats
 */
function parseGeneric(data) {
    logger.debug('Attempting generic parse')
    // Basic fallback - split by lines and create segments
    const lines = data.split('\n').filter(line => line.trim())
    return lines.map((line, index) => ({
        start: index * 2, // Assume 2 seconds per line
        duration: 2,
        text: line.trim()
    }))
}

/**
 * Parse timestamp string to seconds
 * Supports formats: HH:MM:SS.mmm, MM:SS.mmm, SS.mmm
 */
function parseTimestamp(timestamp) {
    const parts = timestamp.split(':')
    let seconds = 0

    if (parts.length === 3) {
        // HH:MM:SS.mmm
        seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2])
    } else if (parts.length === 2) {
        // MM:SS.mmm
        seconds = parseInt(parts[0]) * 60 + parseFloat(parts[1])
    } else {
        // SS.mmm
        seconds = parseFloat(parts[0])
    }

    return seconds
}

/**
 * Decode HTML entities
 */
function decodeHTML(text) {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = text
    return textarea.value
}

/**
 * Get video metadata from Invidious
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} Video metadata
 */
export async function fetchMetadata(videoId) {
    logger.info(`Fetching metadata for: ${videoId}`)

    try {
        const data = await fetchVideoData(videoId)

        const metadata = {
            videoId: data.videoId,
            title: data.title,
            author: data.author,
            authorId: data.authorId,
            lengthSeconds: data.lengthSeconds,
            viewCount: data.viewCount,
            likeCount: data.likeCount,
            published: data.published,
            description: data.description,
            keywords: data.keywords || [],
            genre: data.genre,
            isFamilyFriendly: data.isFamilyFriendly,
            captionsAvailable: (data.captions?.length || 0) > 0,
            availableLanguages: data.captions?.map(c => c.language_code) || []
        }

        logger.success('Metadata extracted successfully')
        return metadata
    } catch (error) {
        logger.error('Failed to fetch metadata:', error.message)
        throw error
    }
}

/**
 * Search videos using Invidious
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Search results
 */
export async function searchVideos(query, options = {}) {
    logger.info(`Searching for: ${query}`)

    const instance = await findWorkingInstance()
    const params = new URLSearchParams({
        q: query,
        page: options.page || 1,
        sort: options.sort || 'relevance',
        type: options.type || 'video',
        ...options
    })

    const url = `${instance}/api/v1/search?${params}`
    logger.debug(`Search URL: ${url}`)

    try {
        const response = await fetch(url, {
            signal: AbortSignal.timeout(10000)
        })

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const results = await response.json()
        logger.success(`Found ${results.length} results`)

        return results
    } catch (error) {
        logger.error('Search failed:', error.message)
        throw error
    }
}
