import { state, resetState } from './state.js'
import { injectWidget } from '../ui/widget.js'
import { startAnalysis } from './analyzer.js'
import { log, logError } from './debug.js'

export function initObserver() {
    log('Initializing observer...')

    const o = new MutationObserver(() => {
        if (window.location.pathname !== '/watch') return
        const u = new URLSearchParams(window.location.search), v = u.get('v')
        if (v && v !== state.currentVideoId) handleNewVideo(v)
    })
    o.observe(document.body, { childList: true, subtree: true })

    log('Observer started')
    checkCurrentPage()
}

async function handleNewVideo(v) {
    log('New video detected:', v)
    state.currentVideoId = v
    resetState()

    try {
        await injectWidget()
        log('Widget injected successfully')

        if (state.settings.autoAnalyze) {
            setTimeout(() => startAnalysis(), 1500)
        }
    } catch (error) {
        logError('Widget injection failed', error)
    }
}

function checkCurrentPage() {
    log('Checking current page...')

    if (window.location.pathname === '/watch') {
        const u = new URLSearchParams(window.location.search), v = u.get('v')
        if (v) {
            log('Video page detected:', v)
            handleNewVideo(v)
        } else {
            log('No video ID found in URL')
        }
    } else {
        log('Not on video page:', window.location.pathname)
    }
}
