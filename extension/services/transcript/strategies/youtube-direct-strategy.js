// YouTube Direct API Strategy
// Priority: 3 (Direct timedtext endpoint)

import { parseXML } from '../parsers/xml-parser.js'
import { parseJSON3 } from '../parsers/json3-parser.js'

export async function fetchViaYouTubeDirect(videoId, lang = 'en') {
    const formats = ['json3', 'srv3', 'srv2', 'srv1']

    for (const fmt of formats) {
        try {
            const url = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&fmt=${fmt}`
            const res = await fetch(url)

            if (!res.ok) continue

            if (fmt === 'json3') {
                const data = await res.json()
                const segments = parseJSON3(data)
                if (segments.length) return segments
            } else {
                const xmlText = await res.text()
                const segments = parseXML(xmlText)
                if (segments.length) return segments
            }
        } catch (e) {
            continue
        }
    }

    throw new Error('YouTube Direct API failed for all formats')
}

export const strategy = {
    name: 'YouTube Direct API',
    priority: 3,
    fetch: fetchViaYouTubeDirect
}
