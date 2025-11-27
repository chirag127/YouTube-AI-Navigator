export async function classifyTranscript(t, g) {
    if (!t || !t.length) return []
    const f = t.map(s => `[${s.start.toFixed(1)}] ${s.text}`).join('\n')
    try { const e = await g.extractSegments(f); return e } catch (e) { return [] }
}
