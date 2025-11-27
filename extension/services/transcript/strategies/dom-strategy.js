// DOM Parser Strategy
// Priority: 5 (ytInitialPlayerResponse fallback)

import { parseEvents } from '../parsers/events-parser.js'
import { parseXML } from '../parsers/xml-parser.js'

export async function fetchViaDOM(videoId, lang = 'en') {
    const pr = getPlayerResponse()

    if (!pr) throw new Error('No ytInitialPlayerResponse')

    const tracks = pr?.captions?.playerCaptionsTracklistRenderer?.captionTracks
    if (!tracks?.length) throw new Error('No caption tracks')

    let track = tracks.find(t => t.languageCode === lang)
    if (!track) track = tracks[0]

    const res = await fetch(track.baseUrl)
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)

    const ct = res.headers.get('content-type')

    if (ct?.includes('json')) {
        const data = await res.json()
        return parseEvents(data)
    } else {
        const xmlText = await res.text()
        return parseXML(xmlText)
    }
}

function getPlayerResponse() {
    if (window.ytInitialPlayerResponse) return window.ytInitialPlayerResponse

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

export const strategy = {
    name: 'DOM Parser',
    priority: 5,
    fetch: fetchViaDOM
}
