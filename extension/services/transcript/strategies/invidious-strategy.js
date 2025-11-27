// Invidious API Strategy
// Priority: 2 (Primary - CORS-free, reliable)

import { parseVTT } from '../parsers/vtt-parser.js'

const INSTANCES = [
    'https://inv.perditum.com',
    'https://invidious.privacyredirect.com',
    'https://invidious.fdn.fr',
    'https://iv.ggtyler.dev',
    'https://invidious.protokolla.fi'
]

export async function fetchViaInvidious(videoId, lang = 'en') {
    for (const instance of INSTANCES) {
        try {
            const videoUrl = `${instance}/api/v1/videos/${videoId}`
            const res = await fetch(videoUrl, { signal: AbortSignal.timeout(8000) })

            if (!res.ok) continue

            const data = await res.json()

            if (!data.captions?.length) {
                throw new Error('No captions available')
            }

            let track = data.captions.find(c => c.language_code === lang)
            if (!track) track = data.captions[0]

            const captionUrl = track.url.startsWith('http') ? track.url : `${instance}${track.url}`
            const captionRes = await fetch(captionUrl, { signal: AbortSignal.timeout(10000) })

            if (!captionRes.ok) continue

            const captionText = await captionRes.text()
            return parseVTT(captionText)
        } catch (e) {
            continue
        }
    }

    throw new Error('All Invidious instances failed')
}

export const strategy = {
    name: 'Invidious API',
    priority: 2,
    fetch: fetchViaInvidious
}
