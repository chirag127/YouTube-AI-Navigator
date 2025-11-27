/**
 * YouTube AI Master - Background Service Worker
 * Handles extension lifecycle, message passing, and AI processing
 */

import { ChunkingService } from '../services/chunking/index.js'
import { GeminiService } from '../services/gemini/index.js'
import { SegmentClassificationService } from '../services/segments/index.js'
import { StorageService } from '../services/storage/index.js'

// Service instances (initialized on demand)
let geminiService, chunkingService, segmentClassificationService, storageService

async function initializeServices(apiKey) {
  if (!apiKey) throw new Error('API Key required')
  geminiService = new GeminiService(apiKey)
  chunkingService = new ChunkingService()
  segmentClassificationService = new SegmentClassificationService(geminiService, chunkingService)
  storageService = new StorageService()
  try { await geminiService.fetchAvailableModels() } catch (e) { }
}

async function getApiKey() {
  const s = await chrome.storage.sync.get('apiKey')
  if (s.apiKey) return s.apiKey
  const l = await chrome.storage.local.get('geminiApiKey')
  return l.geminiApiKey || null
}

// Extension installation/update handler
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('YouTube AI Master installed')
    chrome.runtime.openOptionsPage()
  } else if (details.reason === 'update') {
    console.log('YouTube AI Master updated to version', chrome.runtime.getManifest().version)
  }
})

// Message handler for communication between content scripts and background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const action = request.action || request.type
  console.log('Background received message:', action)

    // Handle async operations
    ; (async () => {
      try {
        switch (action) {
          case 'TEST':
            sendResponse({ success: true, message: 'Background script is running' })
            break

          case 'GET_SETTINGS':
            await handleGetSettings(sendResponse)
            break

          case 'FETCH_TRANSCRIPT':
            await handleFetchTranscript(request, sendResponse)
            break

          case 'ANALYZE_VIDEO':
            await handleAnalyzeVideo(request, sendResponse)
            break

          case 'ANALYZE_COMMENTS':
            await handleAnalyzeComments(request, sendResponse)
            break

          case 'GENERATE_SUMMARY':
            await handleGenerateSummary(request, sendResponse)
            break

          case 'CLASSIFY_SEGMENTS':
            await handleClassifySegments(request, sendResponse)
            break

          case 'CHAT_WITH_VIDEO':
            await handleChatWithVideo(request, sendResponse)
            break

          case 'SAVE_TO_HISTORY':
            await handleSaveToHistory(request, sendResponse)
            break

          case 'GET_METADATA':
            await handleGetMetadata(request, sendResponse)
            break

          case 'FETCH_INVIDIOUS_TRANSCRIPT':
            await handleFetchInvidiousTranscript(request, sendResponse)
            break

          default:
            console.warn('Unknown message type:', action)
            sendResponse({ success: false, error: 'Unknown message type' })
        }
      } catch (error) {
        console.error('Background handler error:', error)
        sendResponse({ success: false, error: error.message })
      }
    })()

  return true // Keep channel open for async response
})

/**
 * Get user settings from storage
 */
async function handleGetSettings(sendResponse) {
  const settings = await chrome.storage.sync.get([
    'apiKey',
    'model',
    'summaryLength',
    'outputLanguage',
    'customPrompt',
    'enableSegments',
    'autoSkipSponsors',
    'autoSkipIntros',
    'saveHistory',
  ])
  sendResponse({ success: true, data: settings })
}

/**
 * Fetch YouTube transcript
 */
async function handleFetchTranscript(request, sendResponse) {
  const { videoId, lang = 'en' } = request

  if (!transcriptService) {
    transcriptService = new YouTubeTranscriptService()
  }

  const segments = await transcriptService.getTranscript(videoId, lang)
  sendResponse({
    success: true,
    data: { segments },
  })
}

/**
 * Full video analysis: transcript + summary + segments
 */
async function handleAnalyzeVideo(request, sendResponse) {
  const { transcript, metadata, options = {} } = request

  const apiKey = await getApiKey()
  if (!apiKey) {
    sendResponse({
      success: false,
      error: 'API Key not configured. Please set your Gemini API key in extension options.',
    })
    return
  }

  await initializeServices(apiKey)

  // Format transcript for AI
  const formattedTranscript = transcript.map((t) => `[${t.start.toFixed(1)}] ${t.text}`).join('\n')

  const plainText = transcript.map((t) => t.text).join(' ')

  // Generate comprehensive analysis (summary + FAQ + insights)
  const analysis = await geminiService.generateComprehensiveAnalysis(plainText, {
    length: options.length || 'Medium',
    language: options.language || 'English',
  })

  // Classify segments
  let segments = []
  try {
    segments = await segmentClassificationService.classifyTranscript(transcript)
  } catch (e) {
    console.warn('Segment classification failed:', e)
  }

  // Save to history if enabled
  const settings = await chrome.storage.sync.get('saveHistory')
  if (settings.saveHistory !== false && storageService) {
    try {
      await storageService.saveTranscript(
        metadata?.videoId || 'unknown',
        metadata,
        transcript,
        analysis.summary
      )
    } catch (e) {
      console.warn('Failed to save to history:', e)
    }
  }

  sendResponse({
    success: true,
    data: {
      summary: analysis.summary,
      faq: analysis.faq,
      insights: analysis.insights,
      segments,
    },
  })
}

/**
 * Analyze YouTube comments sentiment
 */
async function handleAnalyzeComments(request, sendResponse) {
  const { comments } = request

  const apiKey = await getApiKey()
  if (!apiKey) {
    sendResponse({ success: false, error: 'API Key not configured' })
    return
  }

  await initializeServices(apiKey)

  const analysis = await geminiService.analyzeCommentSentiment(comments)
  sendResponse({ success: true, analysis })
}

/**
 * Generate AI summary
 */
async function handleGenerateSummary(request, sendResponse) {
  const { transcript, settings } = request

  const apiKey = settings?.apiKey || (await getApiKey())
  if (!apiKey) {
    sendResponse({ success: false, error: 'API Key not configured' })
    return
  }

  await initializeServices(apiKey)

  const summary = await geminiService.generateSummary(
    transcript,
    settings?.customPrompt,
    settings?.model,
    { length: settings?.summaryLength, language: settings?.outputLanguage }
  )

  sendResponse({ success: true, data: summary })
}

/**
 * Classify video segments
 */
async function handleClassifySegments(request, sendResponse) {
  const { transcript, settings } = request

  const apiKey = settings?.apiKey || (await getApiKey())
  if (!apiKey) {
    sendResponse({ success: false, error: 'API Key not configured' })
    return
  }

  await initializeServices(apiKey)

  const segments = await segmentClassificationService.classifyTranscript(transcript)
  sendResponse({ success: true, data: segments })
}

/**
 * Chat with video content
 */
async function handleChatWithVideo(request, sendResponse) {
  const { question, context } = request

  const apiKey = await getApiKey()
  if (!apiKey) {
    sendResponse({ success: false, error: 'API Key not configured' })
    return
  }

  await initializeServices(apiKey)

  const answer = await geminiService.chatWithVideo(question, context)
  sendResponse({ success: true, answer })
}

/**
 * Save summary to history
 */
async function handleSaveToHistory(request, sendResponse) {
  const { videoId, title, summary, timestamp } = request.data || request

  const result = await chrome.storage.local.get('summaryHistory')
  const history = result.summaryHistory || []

  history.unshift({
    videoId,
    title,
    summary,
    timestamp: timestamp || Date.now(),
  })

  // Keep only last 100 entries
  const trimmedHistory = history.slice(0, 100)
  await chrome.storage.local.set({ summaryHistory: trimmedHistory })

  sendResponse({ success: true })
}

/**
 * Get metadata from Invidious (CORS-free)
 */
async function handleGetMetadata(request, sendResponse) {
  const { videoId } = request
  const instances = await getInvidiousInstances()

  for (const inst of instances) {
    try {
      const url = `${inst}/api/v1/videos/${videoId}`
      const r = await fetch(url, { signal: AbortSignal.timeout(5000) })
      if (!r.ok) continue
      const d = await r.json()
      sendResponse({
        success: true,
        data: { title: d.title, duration: d.lengthSeconds, author: d.author, viewCount: d.viewCount },
      })
      return
    } catch (e) {
      continue
    }
  }
  sendResponse({ success: false, error: 'Failed to get metadata from Invidious' })
}

/**
 * Fetch transcript from Invidious (CORS-free)
 */
async function handleFetchInvidiousTranscript(request, sendResponse) {
  const { videoId, lang } = request
  const instances = await getInvidiousInstances()

  for (const inst of instances) {
    try {
      const url = `${inst}/api/v1/captions/${videoId}?lang=${lang}`
      const r = await fetch(url, { signal: AbortSignal.timeout(5000) })
      if (!r.ok) continue
      const d = await r.json()
      if (!d.captions?.length) continue
      const c = d.captions.find((x) => x.languageCode === lang || x.label.includes(lang))?.url || d.captions[0]?.url
      if (!c) continue
      const cd = await fetch(c, { signal: AbortSignal.timeout(5000) })
      const vtt = await cd.text()
      const segments = parseVTT(vtt)
      sendResponse({ success: true, data: segments })
      return
    } catch (e) {
      continue
    }
  }
  sendResponse({ success: false, error: 'All Invidious instances failed' })
}

/**
 * Get Invidious instances
 */
async function getInvidiousInstances() {
  try {
    const r = await fetch('https://api.invidious.io/instances.json?sort_by=type,users', {
      signal: AbortSignal.timeout(3000),
    })
    if (!r.ok) throw new Error('Failed to fetch instances')
    const d = await r.json()
    const instances = d
      .filter((x) => x[1]?.type === 'https' && x[1]?.api !== false && x[1]?.monitor?.down === false)
      .slice(0, 10)
      .map((x) => x[1]?.uri || `https://${x[0]}`)
    return instances.length > 0 ? instances : ['https://inv.nadeko.net', 'https://yewtu.be']
  } catch (e) {
    return ['https://inv.nadeko.net', 'https://yewtu.be']
  }
}

/**
 * Parse VTT format
 */
function parseVTT(v) {
  const s = [],
    l = v.split('\n')
  let i = 0
  while (i < l.length) {
    const ln = l[i].trim()
    if (ln.includes('-->')) {
      const [st, en] = ln.split('-->').map((t) => parseVTTTime(t.trim()))
      i++
      let txt = ''
      while (i < l.length && l[i].trim() !== '') {
        txt += l[i].trim() + ' '
        i++
      }
      if (txt.trim())
        s.push({ start: st, duration: en - st, text: txt.trim().replace(/<[^>]+>/g, '') })
    }
    i++
  }
  return s
}

function parseVTTTime(t) {
  const p = t.split(':')
  if (p.length === 3) {
    const [h, m, s] = p
    return parseFloat(h) * 3600 + parseFloat(m) * 60 + parseFloat(s)
  }
  const [m, s] = p
  return parseFloat(m) * 60 + parseFloat(s)
}

// Keep service worker alive
chrome.runtime.onConnect.addListener((port) => {
  console.log('Port connected:', port.name)
})

console.log('YouTube AI Master service worker loaded')
