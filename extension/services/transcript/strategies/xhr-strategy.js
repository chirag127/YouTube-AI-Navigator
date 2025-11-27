// XHR Interceptor Strategy
// Priority: 1 (Fastest if available)
// Captures live network requests

import transcriptInterceptor from '../../../content/transcript/xhr-interceptor.js'

export async function fetchViaXHR(videoId, lang = 'en') {
    const transcript = transcriptInterceptor.getTranscript(videoId, lang)

    if (!transcript?.length) {
        throw new Error('No intercepted transcript available')
    }

    return transcript
}

export const strategy = {
    name: 'XHR Interceptor',
    priority: 1,
    fetch: fetchViaXHR
}
