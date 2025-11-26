/**
 * YouTube AI Master - Content Script
 * Handles DOM interaction: video seeking, data extraction, transcript fetching, and UI injection.
 */

console.log('YouTube AI Master: Content script loaded.')

// Import transcript service functionality
class ContentScriptTranscriptService {
  async _fetchVideoPage(videoId) {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch video page: ${response.statusText}`)
    }
    return response.text()
  }

  _extractPlayerResponse(html) {
    const startPattern = 'ytInitialPlayerResponse = '
    const startIndex = html.indexOf(startPattern)
    if (startIndex === -1) {
      throw new Error('Failed to extract player response')
    }

    let braceCount = 0
    let endIndex = -1
    let foundStart = false
    const jsonStartIndex = startIndex + startPattern.length

    for (let i = jsonStartIndex; i < html.length; i++) {
      if (html[i] === '{') {
        braceCount++
        foundStart = true
      } else if (html[i] === '}') {
        braceCount--
      }

      if (foundStart && braceCount === 0) {
        endIndex = i + 1
        break
      }
    }

    if (endIndex === -1) {
      throw new Error('Failed to parse player response JSON')
    }

    const jsonStr = html.substring(jsonStartIndex, endIndex)
    try {
      return JSON.parse(jsonStr)
    } catch (e) {
      throw new Error('Failed to parse player response JSON content')
    }
  }

  async getVideoMetadata(videoId) {
    if (!videoId) throw new Error('Video ID is required')

    try {
      const html = await this._fetchVideoPage(videoId)
      const playerResponse = this._extractPlayerResponse(html)
      const videoDetails = playerResponse.videoDetails

      if (!videoDetails) {
        throw new Error('No video details found')
      }

      return {
        title: videoDetails.title,
        duration: Number.parseInt(videoDetails.lengthSeconds, 10),
        author: videoDetails.author,
        viewCount: videoDetails.viewCount,
      }
    } catch (error) {
      console.error('ContentScriptTranscriptService getVideoMetadata Error:', error)
      throw error
    }
  }

  async getTranscript(videoId, lang = 'en') {
    if (!videoId) {
      throw new Error('Video ID is required')
    }

    try {
      const html = await this._fetchVideoPage(videoId)

      const captionTracksMatch = html.match(/["']?captionTracks["']?\s*:\s*(\[[\s\S]+?\])/)
      if (!captionTracksMatch) {
        throw new Error('No captions found for this video')
      }

      const captionTracksJson = captionTracksMatch[1]

      const tracks = []
      const trackRegex =
        /["']?languageCode["']?\s*:\s*["']([^"']+)["'][\s\S]+?["']?baseUrl["']?\s*:\s*["']([^"']+)["']/g

      let trackMatch
      while ((trackMatch = trackRegex.exec(captionTracksJson)) !== null) {
        tracks.push({
          languageCode: trackMatch[1],
          baseUrl: trackMatch[2],
        })
      }

      if (tracks.length === 0) {
        throw new Error('Failed to parse caption tracks')
      }

      const track =
        tracks.find((t) => t.languageCode === lang) ||
        tracks.find((t) => t.languageCode.startsWith('en')) ||
        tracks[0]

      if (!track) {
        throw new Error('No suitable caption track found')
      }

      const transcriptResponse = await fetch(track.baseUrl)
      const transcriptXml = await transcriptResponse.text()

      return this.parseTranscriptXml(transcriptXml)
    } catch (error) {
      console.error('ContentScriptTranscriptService Error:', error)
      throw error
    }
  }

  parseTranscriptXml(xml) {
    const segments = []
    const regex = /<text start="([\d.]+)" dur="([\d.]+)">([^<]+)<\/text>/g
    let match

    while ((match = regex.exec(xml)) !== null) {
      segments.push({
        start: Number.parseFloat(match[1]),
        duration: Number.parseFloat(match[2]),
        text: this.decodeHtml(match[3]),
      })
    }

    return segments
  }

  decodeHtml(html) {
    const txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
  }
}

const transcriptService = new ContentScriptTranscriptService()

// Listen for messages from the extension (Side Panel / Background)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SEEK_TO') {
    seekToTimestamp(request.timestamp)
    sendResponse({ status: 'success' })
  } else if (request.action === 'GET_VIDEO_DATA') {
    // Placeholder for extracting data if needed directly from DOM
    sendResponse({ title: document.title })
  } else if (request.action === 'GET_COMMENTS') {
    const comments = extractComments()
    sendResponse({ comments })
  } else if (request.action === 'GET_TRANSCRIPT') {
    (async () => {
      try {
        const transcript = await transcriptService.getTranscript(request.videoId)
        sendResponse({ transcript })
      } catch (error) {
        sendResponse({ error: error.message })
      }
    })()
    return true // Keep the message channel open for async response
  } else if (request.action === 'GET_METADATA') {
    (async () => {
      try {
        const metadata = await transcriptService.getVideoMetadata(request.videoId)
        sendResponse({ metadata })
      } catch (error) {
        sendResponse({ error: error.message })
      }
    })()
    return true // Keep the message channel open for async response
  }
})

/**
 * Extracts top comments from the DOM.
 * @returns {Array<string>}
 */
function extractComments() {
  const commentElements = document.querySelectorAll('#content-text')
  const comments = []
  // Get top 10 visible comments
  for (let i = 0; i < Math.min(commentElements.length, 10); i++) {
    comments.push(commentElements[i].innerText)
  }

  if (comments.length === 0) {
    // Try to scroll down a bit to trigger loading?
    // Or just warn that comments might not be loaded.
    console.warn('YouTube AI Master: No comments found in DOM. User might need to scroll.')
  }
  return comments
}

/**
 * Seeks the YouTube video player to the specified timestamp.
 * @param {number} seconds - Timestamp in seconds.
 */
function seekToTimestamp(seconds) {
  const video = document.querySelector('video')
  if (video) {
    video.currentTime = seconds
    video.play() // Optional: auto-play after seek
    console.log(`YouTube AI Master: Seeked to ${seconds}s`)
  } else {
    console.error('YouTube AI Master: Video element not found.')
  }
}

// Example: Inject a button (placeholder for future UI)
function injectTestButton() {
  // Wait for player to be ready
  const checkPlayer = setInterval(() => {
    const player = document.querySelector('#movie_player')
    if (player) {
      clearInterval(checkPlayer)
      console.log('YouTube AI Master: Player found, ready for injection.')
      // Logic to inject UI elements can go here
    }
  }, 1000)
}

injectTestButton()
