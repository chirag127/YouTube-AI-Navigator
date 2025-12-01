

);
const { showPlaceholder } = await import(chrome.runtime.getURL('content/ui/components/loading.js'));
const { makeTimestampsClickable } = await import(chrome.runtime.getURL('content/utils/timestamps.js'));
const { parseMarkdown } = await import(chrome.runtime.getURL('lib/marked-loader.js'));

function processHighlights(html) {
  try {
    return html.replace(/==(.*?)==/g, '<mark class="yt-ai-highlight">$1</mark>');
  } catch (err) {
    console.error('Err:processHighlights', err);
    return html;
  }
}

export async function renderSummary(c, d) {
  try {
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

    // Liquid Glass Structure with Cards
    c.innerHTML = `
      <div class="yt-ai-summary-container" style="display: flex; flex-direction: column; gap: 16px; padding: 0;">

        <div class="yt-ai-card glass-panel">
          <h3 class="yt-ai-card-title">📝 Summary</h3>
          <div class="yt-ai-card-content">${summaryHtml}</div>
        </div>

        <div class="yt-ai-card glass-panel">
          <h3 class="yt-ai-card-title">💡 Key Insights</h3>
          <div class="yt-ai-card-content">${insightsHtml}</div>
        </div>

        <div class="yt-ai-card glass-panel">
          <h3 class="yt-ai-card-title">❓ FAQ</h3>
          <div class="yt-ai-card-content">${faqHtml}</div>
        </div>

      </div>
    `;

    makeTimestampsClickable(c);
  } catch (err) {
    console.error('Err:renderSummary', err);
  }
}
