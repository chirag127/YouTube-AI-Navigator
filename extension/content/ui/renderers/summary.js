import { showPlaceholder } from '../components/loading.js';
import { makeTimestampsClickable } from '../../utils/timestamps.js';
import { parseMarkdown } from '../../../lib/marked-loader.js';

function processHighlights(html) {
  return html.replace(/==(.*?)==/g, '<mark class="yt-ai-highlight">$1</mark>');
}

export async function renderSummary(c, d) {
  if (!d) {
    showPlaceholder(c, 'Analysis not started yet.');
    return;
  }

  let summaryHtml = await parseMarkdown(d.summary || 'No summary available.');
  let insightsHtml = await parseMarkdown(d.insights || 'No insights available.');
  let faqHtml = await parseMarkdown(d.faq || 'No FAQ available.');

  summaryHtml = processHighlights(summaryHtml);
  insightsHtml = processHighlights(insightsHtml);
  faqHtml = processHighlights(faqHtml);

  c.innerHTML = `<div class="yt-ai-markdown">
        <h3>📝 Summary</h3>
        ${summaryHtml}
        <hr>
        <h3>💡 Key Insights</h3>
        ${insightsHtml}
        <hr>
        <h3>❓ FAQ</h3>
        ${faqHtml}
    </div>`;

  makeTimestampsClickable(c);
}
