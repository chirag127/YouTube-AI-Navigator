const gu = p => chrome.runtime.getURL(p);

const { getVideoElement } = await import(gu('content/utils/dom.js'));

function $(selector) {
  return document.querySelector(selector);
}

export async function injectSegmentMarkers(s) {
  try {
    if (!s?.length) return;
    const p = $('.ytp-progress-bar');
    if (!p) return;
    const ex = $('#yt-ai-markers');
    if (ex) ex.remove();
    const c = document.createElement('div');
    c.id = 'yt-ai-markers';
    c.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:30;';
    const v = getVideoElement(),
      d = v?.duration || 0;
    if (!d) return;
    for (const x of s) {
      if (x.label === 'content' || x.label === 'Content') continue;
      const st = (x.start / d) * 100,
        w = ((x.end - x.start) / d) * 100,
        m = document.createElement('div');
      const color = await getSegmentColor(x.label);
      m.style.cssText = `position:absolute;left:${st}%;width:${w}%;height:100%;background:${color};opacity:0.6;`;
      m.title = x.labelFull || x.label;
      c.appendChild(m);
    }
    p.appendChild(c);
  } catch (err) {
    console.error('Err:injectSegmentMarkers', err);
  }
}
async function getSegmentColor(lb) {
  try {
    const fallback = {
      Sponsor: '#00d26a',
      'Self Promotion': '#ffff00',
      'Unpaid/Self Promotion': '#ffff00',
      'Exclusive Access': '#008b45',
      'Interaction Reminder': '#a020f0',
      Highlight: '#ff0055',
      'Intermission/Intro': '#00ffff',
      'Endcards/Credits': '#0000ff',
      'Preview/Recap': '#00bfff',
      'Hook/Greetings': '#4169e1',
      'Tangents/Jokes': '#9400d3',
      'Filler/Tangent': '#9400d3',
      'Off-Topic': '#ff9900',
      'Music: Non-Music Section': '#ff9900',
      Content: '#999999',
    };
    return fallback[lb] || '#999999';
  } catch (err) {
    console.error('Err:getSegmentColor', err);
    return '#999999';
  }
}
