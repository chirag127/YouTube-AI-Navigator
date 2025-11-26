/**
 * YouTube AI Master - Content Script
 * Handles DOM interaction and UI Injection.
 */

console.log('YouTube AI Master: Content script loaded.')

// --- UI Injection Logic ---

let currentVideoId = null
let widgetContainer = null
let isAnalyzing = false

// Observer to handle SPA navigation
const observer = new MutationObserver(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const videoId = urlParams.get('v')

  if (window.location.pathname === '/watch' && videoId && videoId !== currentVideoId) {
    currentVideoId = videoId
    console.log('YouTube AI Master: New video detected:', videoId)
    injectWidget()
  } else if (window.location.pathname === '/watch' && videoId && !document.getElementById('yt-ai-master-widget')) {
    // Re-inject if removed
    injectWidget()
  }
})

observer.observe(document.body, { childList: true, subtree: true })

// Initial check
if (window.location.pathname === '/watch') {
  const urlParams = new URLSearchParams(window.location.search)
  currentVideoId = urlParams.get('v')
  if (currentVideoId) injectWidget()
}

function injectWidget() {
  const secondaryColumn = document.querySelector('#secondary')
  if (!secondaryColumn) {
    // Retry if secondary column not yet loaded
    setTimeout(injectWidget, 1000)
    return
  }

  if (document.getElementById('yt-ai-master-widget')) return

  console.log('YouTube AI Master: Injecting widget...')

  // Create Widget Container
  widgetContainer = document.createElement('div')
  widgetContainer.id = 'yt-ai-master-widget'
  widgetContainer.innerHTML = `
    <div class="yt-ai-header">
      <div class="yt-ai-title">
        <span>✨ YouTube AI Master</span>
      </div>
      <button id="yt-ai-analyze-btn" class="yt-ai-btn">Analyze Video</button>
    </div>
    <div class="yt-ai-tabs">
      <div class="yt-ai-tab active" data-tab="summary">Summary</div>
      <div class="yt-ai-tab" data-tab="transcript">Transcript</div>
      <div class="yt-ai-tab" data-tab="comments">Comments</div>
      <div class="yt-ai-tab" data-tab="segments">Segments</div>
    </div>
    <div id="yt-ai-content-area" class="yt-ai-content">
      <div class="yt-ai-placeholder">Click "Analyze Video" to start.</div>
    </div>
  `

  // Insert at top of secondary column
  secondaryColumn.insertBefore(widgetContainer, secondaryColumn.firstChild)

  // Attach Event Listeners
  document.getElementById('yt-ai-analyze-btn').addEventListener('click', startAnalysis)

  const tabs = widgetContainer.querySelectorAll('.yt-ai-tab')
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab))
  })
}

// --- State Management ---
let analysisData = null
let currentTranscript = []

async function startAnalysis() {
  if (isAnalyzing) return
  isAnalyzing = true

  const btn = document.getElementById('yt-ai-analyze-btn')
  btn.disabled = true
  btn.textContent = 'Analyzing...'

  const contentArea = document.getElementById('yt-ai-content-area')
  contentArea.innerHTML = '<div class="yt-ai-loading">Analyzing video... This may take a few seconds.</div>'

  try {
    // 1. Get Metadata & Transcript (Local)
    const transcriptService = new ContentScriptTranscriptService()
    const metadata = await transcriptService.getVideoMetadata(currentVideoId)
    const transcript = await transcriptService.getTranscript(currentVideoId)
    currentTranscript = transcript

    // 2. Send to Background for AI Processing
    const response = await chrome.runtime.sendMessage({
      action: 'ANALYZE_VIDEO',
      transcript,
      metadata,
      options: { length: 'Medium' } // Default options
    })

    if (!response.success) throw new Error(response.error)

    analysisData = response.data

    // 3. Render Results
    renderSummary()

    // 4. Inject Segments into Player
    injectSegmentMarkers(analysisData.segments)

  } catch (error) {
    console.error('Analysis Error:', error)
    contentArea.innerHTML = `<div class="yt-ai-error">Error: ${error.message}</div>`
  } finally {
    isAnalyzing = false
    btn.disabled = false
    btn.textContent = 'Analyze Video'
  }
}

function switchTab(tabName) {
  // Update Tab UI
  const tabs = widgetContainer.querySelectorAll('.yt-ai-tab')
  tabs.forEach(t => t.classList.remove('active'))
  widgetContainer.querySelector(`[data-tab="${tabName}"]`).classList.add('active')

  // Render Content
  if (!analysisData && !currentTranscript.length) {
    return // Nothing to show yet
  }

  switch (tabName) {
    case 'summary':
      renderSummary()
      break
    case 'transcript':
      renderTranscript()
      break
    case 'comments':
      renderComments()
      break
    case 'segments':
      renderSegments()
      break
  }
}

function renderSummary() {
  const contentArea = document.getElementById('yt-ai-content-area')
  if (!analysisData) return

  contentArea.innerHTML = `
    <div class="yt-ai-markdown">
      ${marked.parse(analysisData.summary)}
      <hr style="border-color: #333; margin: 20px 0;">
      <h3>Key Insights</h3>
      ${marked.parse(analysisData.insights)}
      <hr style="border-color: #333; margin: 20px 0;">
      <h3>FAQ</h3>
      ${marked.parse(analysisData.faq)}
    </div>
  `
  addTimestampListeners(contentArea)
}

function renderTranscript() {
  const contentArea = document.getElementById('yt-ai-content-area')
  contentArea.innerHTML = ''

  if (currentTranscript.length === 0) {
    contentArea.innerHTML = 'No transcript available.'
    return
  }

  // Virtual scrolling or just limit for now? Let's limit to first 100 lines or implement lazy load later.
  // For now, simple list.
  const list = document.createElement('div')
  currentTranscript.forEach(line => {
    const row = document.createElement('div')
    row.className = 'yt-ai-segment'
    row.innerHTML = `
      <span class="yt-ai-timestamp">${formatTime(line.start)}</span>
      <span class="yt-ai-text">${line.text}</span>
    `
    row.addEventListener('click', () => seekToTimestamp(line.start))
    list.appendChild(row)
  })
  contentArea.appendChild(list)
}

async function renderComments() {
  const contentArea = document.getElementById('yt-ai-content-area')

  if (analysisData?.commentAnalysis) {
    // Already analyzed, just render
    contentArea.innerHTML = `
      <div class="yt-ai-markdown">
        ${marked.parse(analysisData.commentAnalysis)}
      </div>
    `
    return
  }

  contentArea.innerHTML = '<div class="yt-ai-loading">Fetching and analyzing comments...</div>'

  try {
    const comments = await fetchCommentsFromDOM()

    if (comments.length === 0) {
      contentArea.innerHTML = '<div class="yt-ai-error">No comments found on this page. Try scrolling down to load comments first.</div>'
      return
    }

    // Send to background for analysis
    const response = await chrome.runtime.sendMessage({
      action: 'ANALYZE_COMMENTS',
      comments: comments.map(c => c.text)
    })

    if (!response.success) throw new Error(response.error)

    // Cache result
    if (!analysisData) analysisData = {}
    analysisData.commentAnalysis = response.analysis

    // Render
    contentArea.innerHTML = `
      <div class="yt-ai-markdown">
        <h3>Comment Sentiment Analysis</h3>
        ${marked.parse(response.analysis)}
        <hr style="border-color: #333; margin: 20px 0;">
        <h4>Top Comments Analyzed (${comments.length})</h4>
        <div class="yt-ai-comments-list">
          ${comments.slice(0, 5).map(c => `
            <div class="yt-ai-comment-item">
              <div class="yt-ai-comment-author">${c.author}</div>
              <div class="yt-ai-comment-text">${c.text}</div>
              <div class="yt-ai-comment-stats">👍 ${c.likes}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `
  } catch (error) {
    console.error('Comments analysis error:', error)
    contentArea.innerHTML = `<div class="yt-ai-error">Failed to analyze comments: ${error.message}</div>`
  }
}

function fetchCommentsFromDOM() {
  return new Promise((resolve) => {
    // Wait a bit for comments to potentially load
    setTimeout(() => {
      const comments = []

      // YouTube comment selectors (may change over time)
      const commentElements = document.querySelectorAll('ytd-comment-thread-renderer')

      for (const elem of commentElements) {
        if (comments.length >= 20) break

        try {
          const authorElem = elem.querySelector('#author-text')
          const textElem = elem.querySelector('#content-text')
          const likeElem = elem.querySelector('#vote-count-middle')

          if (authorElem && textElem) {
            comments.push({
              author: authorElem.textContent.trim(),
              text: textElem.textContent.trim(),
              likes: likeElem ? likeElem.textContent.trim() : '0'
            })
          }
        } catch (e) {
          console.warn('Failed to parse comment:', e)
        }
      }

      resolve(comments)
    }, 1000)
  })
}

function renderSegments() {
  const contentArea = document.getElementById('yt-ai-content-area')
  if (!analysisData?.segments) {
    contentArea.innerHTML = 'No segments found.'
    return
  }

  const list = document.createElement('div')
  analysisData.segments.forEach(seg => {
    const item = document.createElement('div')
    item.className = `yt-ai-segment-item ${seg.label}`
    item.innerHTML = `
      <div style="font-weight:bold; color:#fff;">${seg.label}</div>
      <div style="font-size:12px; color:#aaa;">${formatTime(seg.start)} - ${formatTime(seg.end)}</div>
      <div style="margin-top:4px;">${seg.description || ''}</div>
    `
    item.addEventListener('click', () => seekToTimestamp(seg.start))
    list.appendChild(item)
  })
  contentArea.appendChild(list)
}

// --- Helper Functions ---

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function seekToTimestamp(seconds) {
  const video = document.querySelector('video')
  if (video) {
    video.currentTime = seconds
    video.play()
  }
}

function addTimestampListeners(container) {
  // Parse and make timestamps clickable
  // Supports formats: [12:30], (12:30), 12:30
  const timestampPattern = /(\[|\()?(\d{1,2}):(\d{2})(\]|\))?/g

  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null
  )

  const nodesToReplace = []
  let currentNode

  while (currentNode = walker.nextNode()) {
    const text = currentNode.textContent
    if (timestampPattern.test(text)) {
      nodesToReplace.push(currentNode)
    }
  }

  nodesToReplace.forEach(node => {
    const text = node.textContent
    const fragment = document.createDocumentFragment()
    let lastIndex = 0

    text.replace(timestampPattern, (match, prefix, minutes, seconds, suffix, offset) => {
      // Add text before match
      if (offset > lastIndex) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex, offset)))
      }

      // Create clickable timestamp
      const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds)
      const link = document.createElement('span')
      link.textContent= match
      link.style.color = 'var(--yt-ai-accent)'
      link.style.cursor = 'pointer'
      link.style.fontWeight = '600'
      link.style.textDecoration = 'underline'
      link.addEventListener('click', () => seekToTimestamp(totalSeconds))
      fragment.appendChild(link)

      lastIndex = offset + match.length
    })

    // Add remaining text
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.substring(lastIndex)))
    }

    node.parentNode.replaceChild(fragment, node)
  })
}

// --- Transcript Service Class (Copied/Adapted) ---
class ContentScriptTranscriptService {
  async _fetchVideoPage(videoId) {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`)
    if (!response.ok) throw new Error(`Failed to fetch video page: ${response.statusText}`)
    return response.text()
  }

  _extractPlayerResponse(html) {
    const startPattern = 'ytInitialPlayerResponse = '
    const startIndex = html.indexOf(startPattern)
    if (startIndex === -1) throw new Error('Failed to extract player response')

    let braceCount = 0
    let endIndex = -1
    let foundStart = false
    const jsonStartIndex = startIndex + startPattern.length

    for (let i = jsonStartIndex; i < html.length; i++) {
      if (html[i] === '{') { braceCount++; foundStart = true }
      else if (html[i] === '}') { braceCount-- }

      if (foundStart && braceCount === 0) {
        endIndex = i + 1
        break
      }
    }

    if (endIndex === -1) throw new Error('Failed to parse player response JSON')
    const jsonStr = html.substring(jsonStartIndex, endIndex)
    try { return JSON.parse(jsonStr) } catch (e) { throw new Error('Failed to parse player response JSON content') }
  }

  async getVideoMetadata(videoId) {
    if (!videoId) throw new Error('Video ID is required')
    try {
      const html = await this._fetchVideoPage(videoId)
      const playerResponse = this._extractPlayerResponse(html)
      const videoDetails = playerResponse.videoDetails
      if (!videoDetails) throw new Error('No video details found')
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
    if (!videoId) throw new Error('Video ID is required')
    try {
      const html = await this._fetchVideoPage(videoId)
      let tracks = []

      // Strategy 1: JSON
      try {
        const playerResponse = this._extractPlayerResponse(html)
        if (playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks) {
          tracks = playerResponse.captions.playerCaptionsTracklistRenderer.captionTracks
        }
      } catch (e) {}

      // Strategy 2: Regex
      if (tracks.length === 0) {
        const patterns = [
          /["']?captionTracks["']?\s*:\s*(\[[\s\S]+?\])/,
          /"captionTracks":\s*(\[[^\]]+\])/
        ]
        for (const pattern of patterns) {
          const match = html.match(pattern)
          if (match) {
            try {
              const json = JSON.parse(match[1])
              if (Array.isArray(json)) { tracks = json; break }
            } catch (e) {}
          }
        }
      }

      if (tracks.length === 0) throw new Error('No captions available.')

      const track = tracks.find((t) => t.languageCode === lang) || tracks.find((t) => t.languageCode.startsWith('en')) || tracks[0]
      if (!track) throw new Error('No suitable caption track found')

      const transcriptResponse = await fetch(track.baseUrl + '&fmt=json3')
      if (!transcriptResponse.ok) {
        throw new Error(`Failed to fetch transcript: ${transcriptResponse.status} ${transcriptResponse.statusText}`)
      }
      const responseText = await transcriptResponse.text()
      if (!responseText) {
        throw new Error('Transcript response was empty')
      }

      try {
        const transcriptJson = JSON.parse(responseText)
        return this.parseTranscriptJson(transcriptJson)
      } catch (e) {
        console.error('Failed to parse transcript JSON:', responseText.substring(0, 200))
        throw new Error('Invalid transcript JSON format')
      }
    } catch (error) {
      console.error('ContentScriptTranscriptService Error:', error)
      throw error
    }
  }

  parseTranscriptJson(json) {
    const segments = []
    if (!json.events) return segments
    for (const event of json.events) {
      if (!event.segs) continue
      const text = event.segs.map(s => s.utf8).join('').trim()
      if (!text) continue
      segments.push({
        start: event.tStartMs / 1000,
        duration: (event.dDurationMs || 0) / 1000,
        text: this.decodeHtml(text),
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

// --- Segment Markers (Visuals) ---
function injectSegmentMarkers(segments) {
  if (!segments) return
  const progressBar = document.querySelector('.ytp-progress-bar')
  if (!progressBar) return

  const existingContainer = document.getElementById('ai-master-markers')
  if (existingContainer) existingContainer.remove()

  const container = document.createElement('div')
  container.id = 'ai-master-markers'
  container.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 30;`

  const video = document.querySelector('video')
  const totalDuration = video ? video.duration : 0
  if (!totalDuration) return

  segments.forEach(segment => {
    if (segment.label === 'Content') return
    const startPercent = (segment.start / totalDuration) * 100
    const widthPercent = ((segment.end - segment.start) / totalDuration) * 100

    const marker = document.createElement('div')
    marker.style.cssText = `
      position: absolute;
      left: ${startPercent}%;
      width: ${widthPercent}%;
      height: 100%;
      background-color: ${getSegmentColor(segment.label)};
      opacity: 0.6;
    `
    marker.title = segment.label
    container.appendChild(marker)
  })
  progressBar.appendChild(container)
}

function getSegmentColor(label) {
  const colors = {
    'Sponsor': '#ff4444',
    'Interaction Reminder': '#ff8800',
    'Self Promotion': '#ffaa00',
    'Unpaid Promotion': '#88cc00',
    'Highlight': '#00cc44',
    'Preview/Recap': '#00aaff',
    'Hook/Greetings': '#aa66cc',
    'Tangents/Jokes': '#cc66aa',
    'Content': 'transparent'
  }
  return colors[label] || '#999999'
}
