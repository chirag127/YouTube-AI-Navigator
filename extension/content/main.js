/**
 * YouTube AI Master - Main Entry Point
 * Modular content script for YouTube video analysis
 */

(async () => {
    // Exit if not on YouTube
    if (window.location.hostname !== 'www.youtube.com') {
        return
    }

    console.log('YouTube AI Master: Starting...')

    try {
        // Import initialization module
        const { initializeExtension, waitForPageReady } = await import(
            chrome.runtime.getURL('content/core/init.js')
        )

        // Wait for page to be ready
        await waitForPageReady()

        // Initialize extension
        const success = await initializeExtension()

        if (success) {
            console.log('YouTube AI Master: Ready ✓')
        } else {
            console.error('YouTube AI Master: Initialization failed')
        }
    } catch (error) {
        console.error('YouTube AI Master: Fatal error', error)
    }
})()

// Message listener for popup/sidepanel communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const action = request.action || request.type

    switch (action) {
        case 'START_ANALYSIS':
            import(chrome.runtime.getURL('content/core/analyzer.js')).then(({ startAnalysis }) => {
                startAnalysis()
                sendResponse({ success: true })
            }).catch(error => {
                console.error('Analysis import failed:', error)
                sendResponse({ success: false, error: error.message })
            })
            return true

        case 'GET_METADATA':
            handleGetMetadata(request, sendResponse)
            return true

        case 'GET_TRANSCRIPT':
            handleGetTranscript(request, sendResponse)
            return true

        case 'GET_COMMENTS':
            handleGetComments(request, sendResponse)
            return true

        case 'SEEK_TO':
            handleSeekTo(request, sendResponse)
            return true

        case 'SHOW_SEGMENTS':
            handleShowSegments(request, sendResponse)
            return true

        default:
            return false
    }
})

/**
 * Get video metadata from page
 */
async function handleGetMetadata(request, sendResponse) {
    try {
        const { videoId } = request

        // Method 1: Try ytInitialPlayerResponse (most reliable)
        if (window.ytInitialPlayerResponse?.videoDetails) {
            const details = window.ytInitialPlayerResponse.videoDetails
            const metadata = {
                title: details.title || 'Unknown Title',
                author: details.author || 'Unknown Channel',
                viewCount: details.viewCount || '0',
                duration: parseInt(details.lengthSeconds, 10) || 0,
                videoId: videoId
            }
            console.log('[Metadata] ✓ Extracted from ytInitialPlayerResponse')
            sendResponse({ success: true, metadata })
            return
        }

        // Method 2: Try DOM selectors (fallback)
        const titleEl = document.querySelector('h1.ytd-video-primary-info-renderer yt-formatted-string, h1.ytd-watch-metadata yt-formatted-string, h1.title yt-formatted-string')
        const channelEl = document.querySelector('ytd-channel-name a, #channel-name a, #owner-name a')
        const viewsEl = document.querySelector('#info-strings yt-formatted-string, .view-count, #count')

        if (titleEl?.textContent) {
            const metadata = {
                title: titleEl.textContent.trim(),
                author: channelEl?.textContent?.trim() || 'Unknown Channel',
                viewCount: viewsEl?.textContent?.trim() || 'Unknown views',
                videoId: videoId
            }
            console.log('[Metadata] ✓ Extracted from DOM')
            sendResponse({ success: true, metadata })
            return
        }

        // Method 3: Wait a bit and try again (page might still be loading)
        console.log('[Metadata] Waiting for page to load...')
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (window.ytInitialPlayerResponse?.videoDetails) {
            const details = window.ytInitialPlayerResponse.videoDetails
            const metadata = {
                title: details.title || 'Unknown Title',
                author: details.author || 'Unknown Channel',
                viewCount: details.viewCount || '0',
                duration: parseInt(details.lengthSeconds, 10) || 0,
                videoId: videoId
            }
            console.log('[Metadata] ✓ Extracted after wait')
            sendResponse({ success: true, metadata })
            return
        }

        // Method 4: Provide minimal fallback (better than failing)
        console.warn('[Metadata] Using fallback metadata')
        const metadata = {
            title: document.title.replace(' - YouTube', '') || 'YouTube Video',
            author: 'Unknown Channel',
            viewCount: 'Unknown',
            videoId: videoId
        }
        sendResponse({ success: true, metadata })

    } catch (error) {
        console.error('[Metadata] Error:', error)
        // Even on error, provide fallback to prevent UI breaking
        sendResponse({
            success: true,
            metadata: {
                title: 'YouTube Video',
                author: 'Unknown Channel',
                viewCount: 'Unknown',
                videoId: request.videoId
            }
        })
    }
}

/**
 * Get video transcript
 */
async function handleGetTranscript(request, sendResponse) {
    try {
        const { videoId } = request
        const { getTranscript } = await import(chrome.runtime.getURL('content/transcript/service.js'))
        const transcript = await getTranscript(videoId)

        if (!transcript || transcript.length === 0) {
            throw new Error('This video does not have captions available')
        }

        sendResponse({ success: true, transcript })
    } catch (error) {
        console.error('Transcript fetch error:', error)
        let errorMsg = error.message

        if (errorMsg.includes('Transcript is disabled')) {
            errorMsg = 'This video does not have captions/subtitles enabled'
        } else if (errorMsg.includes('No transcript found')) {
            errorMsg = 'No transcript available for this video'
        }

        sendResponse({ error: errorMsg })
    }
}

/**
 * Get video comments
 */
async function handleGetComments(request, sendResponse) {
    try {
        const { getComments } = await import(chrome.runtime.getURL('content/handlers/comments.js'))
        const comments = await getComments()
        sendResponse({ success: true, comments })
    } catch (error) {
        console.error('Comments fetch error:', error)
        sendResponse({ comments: [] })
    }
}

/**
 * Seek video to timestamp
 */
function handleSeekTo(request, sendResponse) {
    try {
        const { timestamp } = request
        const video = document.querySelector('video')

        if (video) {
            video.currentTime = timestamp
            sendResponse({ success: true })
        } else {
            throw new Error('Video element not found')
        }
    } catch (error) {
        console.error('Seek error:', error)
        sendResponse({ success: false, error: error.message })
    }
}

/**
 * Show segments on video timeline
 */
async function handleShowSegments(request, sendResponse) {
    try {
        const { segments } = request
        // This would integrate with the video player to show segment markers
        // Implementation depends on your segment visualization approach
        sendResponse({ success: true })
    } catch (error) {
        console.error('Show segments error:', error)
        sendResponse({ success: false, error: error.message })
    }
}