// Events Transcript Parser (ytInitialPlayerResponse format)
// Used when parsing from DOM player response

export function parseEvents(data) {
    if (!data?.events) return []

    return data.events
        .filter(e => e.segs)
        .map(e => ({
            start: e.tStartMs / 1000,
            duration: (e.dDurationMs || 0) / 1000,
            text: e.segs.map(s => s.utf8).join('')
        }))
}
