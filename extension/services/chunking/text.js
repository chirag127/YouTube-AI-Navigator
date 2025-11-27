export function chunkText(t, s = 20000, o = 500) {
    if (!t) return []
    if (t.length <= s) return [t]
    const c = []; let i = 0
    while (i < t.length) {
        let e = i + s
        if (e < t.length) { const sp = t.lastIndexOf(' ', e), p = t.lastIndexOf('.', e); if (p > i + s * .5) e = p + 1; else if (sp > i) e = sp + 1 }
        const ch = t.substring(i, e).trim()
        if (ch) c.push(ch)
        i = e - o
        if (i >= e) i = e
    }
    return c
}
