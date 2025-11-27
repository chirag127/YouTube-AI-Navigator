// WebVTT Transcript Parser
// Used by Invidious API responses

export function parseVTT(vttText) {
    const segments = []
    const lines = vttText.split('\n')
    let i = 0

    while (i < lines.length) {
        const line = lines[i].trim()

        if (line.includes('-->')) {
            const [startStr, endStr] = line.split('-->').map(t => t.trim())
            const start = parseVTTTime(startStr)
            const end = parseVTTTime(endStr)

            i++
            let text = ''
            while (i < lines.length && lines[i].trim() !== '' && !lines[i].includes('-->')) {
                text += lines[i].trim() + ' '
                i++
            }

            text = text.trim().replace(/<[^>]+>/g, '').replace(/\s+/g, ' ')

            if (text) {
                segments.push({
                    start,
                    duration: end - start,
                    text
                })
            }
        }
        i++
    }

    return segments
}

function parseVTTTime(timestamp) {
    const parts = timestamp.split(':')

    if (parts.length === 3) {
        const [h, m, s] = parts
        return parseFloat(h) * 3600 + parseFloat(m) * 60 + parseFloat(s)
    } else if (parts.length === 2) {
        const [m, s] = parts
        return parseFloat(m) * 60 + parseFloat(s)
    }
    return parseFloat(parts[0])
}
