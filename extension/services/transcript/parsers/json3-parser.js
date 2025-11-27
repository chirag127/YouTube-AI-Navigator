// JSON3 Transcript Parser (YouTube JSON3 format)
// Used by YouTube's newer API responses

export function parseJSON3(data) {
    if (!data?.events) return []

    return data.events
        .filter(e => e.segs)
        .map(e => ({
            start: e.tStartMs / 1000,
            duration: (e.dDurationMs || 0) / 1000,
            text: e.segs.map(s => s.utf8).join('')
        }))
}
