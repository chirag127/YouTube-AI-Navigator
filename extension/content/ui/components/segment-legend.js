const COLOR_MAPPING = {};
const LABEL_MAPPING = {};

export const renderLegend = () => {
  try {
    const h = Object.entries(COLOR_MAPPING)
      .map(
        ([apiLabel, c]) =>
          `<div class="seg-legend-item"><span class="seg-color" style="background:${c}"></span><span>${LABEL_MAPPING[apiLabel] || apiLabel}</span></div>`
      )
      .join('');
    return `<div class="seg-legend"><div class="seg-legend-title">Segment Types</div>${h}</div>`;
  } catch (err) {
    console.error('Err:renderLegend', err);
    return '';
  }
};
export const injectLegendStyles = () => {
  try {
    if (document.querySelector('#yt-ai-legend-styles')) return;
    const s = document.createElement('style');
    s.id = 'yt-ai-legend-styles';
    s.textContent = `.seg-legend{margin:10px 0;padding:10px;background:#0f0f0f;border-radius:8px}.seg-legend-title{font-weight:600;margin-bottom:8px;font-size:13px}.seg-legend-item{display:flex;align-items:center;gap:8px;margin:4px 0;font-size:12px}.seg-color{width:16px;height:16px;border-radius:3px;display:inline-block}`;
    document.head.appendChild(s);
  } catch (err) {
    console.error('Err:injectLegendStyles', err);
  }
};
