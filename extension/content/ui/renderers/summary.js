import { showPlaceholder } from '../components/loading.js'
import { makeTimestampsClickable } from '../../utils/timestamps.js'
import { parseMarkdown } from '../../../lib/marked-loader.js'

export async function renderSummary(c, d) {
    if (!d) { showPlaceholder(c, 'Analysis not started yet.'); return }
    const summaryHtml = await parseMarkdown(d.summary || 'No summary available.')
    const insightsHtml = await parseMarkdown(d.insights || 'No insights available.')
    const faqHtml = await parseMarkdown(d.faq || 'No FAQ available.')
    c.innerHTML = `<div class="yt-ai-markdown"><h3>📝 Summary</h3>${summaryHtml}<hr><h3>💡 Key Insights</h3>${insightsHtml}<hr><h3>❓ FAQ</h3>${faqHtml}</div>`
    makeTimestampsClickable(c)
}
