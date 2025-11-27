import { decodeHTML } from '../utils/dom.js'
export class TranscriptService {
    async getTranscript(v, l = 'en') {
        const m = [() => this._method1_YouTubeAPI(v, l), () => this._method2_InvidiousAPI(v, l), () => this._method3_BackgroundProxy(v, l), () => this._method4_DOMParse()]
        for (let i = 0; i < m.length; i++) {
            try {
                console.log(`Transcript method ${i + 1}...`)
                const r = await m[i]()
                if (r?.length > 0) { console.log(`✓ Method ${i + 1} succeeded`); return r }
            } catch (e) { console.warn(`Method ${i + 1} failed:`, e.message) }
        }
        throw new Error('All transcript methods failed')
    }
    async getMetadata(v) {
        if (window.ytInitialPlayerResponse) {
            const d = window.ytInitialPlayerResponse.videoDetails
            return { title: d.title, duration: parseInt(d.lengthSeconds, 10), author: d.author, viewCount: d.viewCount }
        }
        try {
            const r = await chrome.runtime.sendMessage({ action: 'GET_METADATA', videoId: v })
            if (r.success) return r.data
        } catch (e) { }
        throw new Error('Failed to get metadata')
    }
    async _method1_YouTubeAPI(v, l) {
        const u = `https://www.youtube.com/api/timedtext?v=${v}&lang=${l}&fmt=json3`, r = await fetch(u)
        if (!r.ok) throw new Error('YouTube API failed')
        const d = await r.json()
        if (!d.events) throw new Error('No transcript data')
        return d.events.filter(e => e.segs).map(e => ({ start: e.tStartMs / 1000, duration: (e.dDurationMs || 0) / 1000, text: e.segs.map(s => s.utf8).join('') }))
    }
    async _method2_InvidiousAPI(v, l) {
        try {
            const r = await chrome.runtime.sendMessage({ action: 'FETCH_INVIDIOUS_TRANSCRIPT', videoId: v, lang: l })
            if (r.success) return r.data
            throw new Error(r.error || 'Invidious failed')
        } catch (e) { throw new Error('Invidious API failed') }
    }
    async _method3_BackgroundProxy(v, l) {
        const r = await chrome.runtime.sendMessage({ action: 'FETCH_TRANSCRIPT', videoId: v, lang: l })
        if (!r.success) throw new Error(r.error)
        return r.data.segments
    }
    async _method4_DOMParse() {
        if (window.ytInitialPlayerResponse) {
            const t = window.ytInitialPlayerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks
            if (t?.length > 0) {
                const tr = t[0], r = await fetch(tr.baseUrl), x = await r.text()
                return this._parseXML(x)
            }
        }
        throw new Error('DOM parse failed')
    }
    _parseXML(x) {
        const s = [], re = /<text start="([\d.]+)" dur="([\d.]+)">([^<]+)<\/text>/g; let m
        while ((m = re.exec(x)) !== null) s.push({ start: parseFloat(m[1]), duration: parseFloat(m[2]), text: decodeHTML(m[3]) })
        return s
    }
}
