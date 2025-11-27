// TTML (Timed Text Markup Language) Parser
// Used by Piped API responses

export function parseTTML(ttmlText) {
    const segments = []

    // TTML format: <p begin="00:00:10.500" end="00:00:12.800">Hello world</p>
    const regex = /<p\s+begin="([^"]+)"\s+end="([^"]+)"[^>]*>([^<]*)<\/p>/g
    let match

    while ((match = regex.exec(ttmlText))) {
        const start = parseTTMLTime(match[1])
        const end = parseTTMLTime(match[2])
        const text = decodeHTML(match[3])

        if (text.trim()) {
            segments.push({
                start,
                duration: end - start,
                text
            })
        }
    }

    return segments
}

function parseTTMLTime(timestamp) {
    // TTML format: HH:MM:SS.mmm or HH:MM:SS:frames
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

function decodeHTML(text) {
    const entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&nbsp;': ' '
    }
    return text.replace(/&[^;]+;/g, m => entities[m] || m)
}
