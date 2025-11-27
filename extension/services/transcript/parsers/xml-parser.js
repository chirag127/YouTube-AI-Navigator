// XML Transcript Parser (YouTube timedtext format)
// Shared parser for XML format transcripts

export function parseXML(xmlText) {
    const segments = []
    const regex = /<text start="([\d.]+)"(?:\s+dur="([\d.]+)")?[^>]*>([^<]*)<\/text>/g
    let match

    while ((match = regex.exec(xmlText))) {
        const text = decodeHTML(match[3])
        if (text.trim()) {
            segments.push({
                start: parseFloat(match[1]),
                duration: match[2] ? parseFloat(match[2]) : 0,
                text
            })
        }
    }

    return segments
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
