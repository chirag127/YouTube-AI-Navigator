const { showPlaceholder } = await import(chrome.runtime.getURL('content/ui/components/loading.js'));
const { seekVideo } = await import(chrome.runtime.getURL('content/utils/dom.js'));
const { formatTime } = await import(chrome.runtime.getURL('content/utils/time.js'));

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const COLOR_MAPPING = {
  Sponsor: '#00d400',
  SelfPromotion: '#ffff00',
  InteractionReminderSubscribe: '#cc00ff',
  InteractionReminder: '#cc00ff',
  HookGreetings: '#00ffff',
  IntermissionIntroAnimation: '#00ffff',
  EndcardsCredits: '#0202ed',
  PreviewRecap: '#008fd6',
  TangentsJokes: '#ff9900',
  Highlight: '#ff1684',
  ExclusiveAccess: '#008a5c',
};

const LABEL_MAPPING = {
  Sponsor: '💰 Sponsor',
  SelfPromotion: '📢 Self Promotion',
  InteractionReminderSubscribe: '🔔 Interaction Reminder',
  InteractionReminder: '🔔 Interaction Reminder',
  HookGreetings: '👋 Intro/Hook',
  IntermissionIntroAnimation: '🎬 Intermission',
  EndcardsCredits: '🎬 Outro/Credits',
  PreviewRecap: '🔄 Preview/Recap',
  TangentsJokes: '💬 Filler/Tangent',
  Highlight: '⭐ Highlight',
  ExclusiveAccess: '🔒 Exclusive Access',
};

// Mapping of segment categories to filter names
const SEGMENT_FILTER_MAP = {
  Sponsor: 'sponsor',
  SelfPromotion: 'selfpromo',
  InteractionReminderSubscribe: 'interaction',
  InteractionReminder: 'interaction',
  HookGreetings: 'intro',
  IntermissionIntroAnimation: 'intro',
  EndcardsCredits: 'outro',
  PreviewRecap: 'preview',
  TangentsJokes: 'filler',
  Highlight: 'highlight',
  ExclusiveAccess: 'exclusive',
};

async function getSegmentFilters() {
  try {
    const r = await chrome.storage.sync.get('config');
    return (
      r.config?.widget?.segmentFilters || {
        sponsor: true,
        selfpromo: true,
        interaction: true,
        intro: true,
        outro: true,
        preview: true,
        filler: true,
        highlight: true,
        exclusive: true,
      }
    );
  } catch {
    return {
      sponsor: true,
      selfpromo: true,
      interaction: true,
      intro: true,
      outro: true,
      preview: true,
      filler: true,
      highlight: true,
      exclusive: true,
    };
  }
}

export async function renderSegments(c, data) {
  try {
    const s = Array.isArray(data) ? data : data?.segments || [];
    const fl = !Array.isArray(data) ? data?.fullVideoLabel : null;
    const b = document.querySelector('#yt-ai-full-video-label');

    // Handle Full Video Label
    if (b) {
      if (fl) {
        b.textContent = LABEL_MAPPING[fl] || fl;
        b.style.display = 'inline-block';
        b.style.backgroundColor = COLOR_MAPPING[fl] || 'var(--glass-highlight)';
        b.style.color = '#fff';
        b.style.marginLeft = '8px';
        b.style.fontSize = '0.75em';
        b.style.padding = '4px 8px';
        b.style.borderRadius = 'var(--radius-sm)';
        b.style.border = '1px solid var(--glass-border)';
        b.style.backdropFilter = 'var(--backdrop-blur)';
      } else b.style.display = 'none';
    }

    if (!s?.length) {
      showPlaceholder(c, 'No segments detected.');
      return;
    }

    // Get user's segment filter preferences
    const filters = await getSegmentFilters();

    // Filter segments based on user preferences
    const filteredSegments = s.filter(x => {
      const filterKey = SEGMENT_FILTER_MAP[x.label];
      // If no mapping exists, show the segment (default to true)
      if (!filterKey) return true;
      // Check if this segment type is enabled
      return filters[filterKey] !== false;
    });

    if (!filteredSegments.length) {
      showPlaceholder(c, 'No segments match your filter settings.');
      return;
    }

    // Generate HTML with Liquid Glass structure
    const h = filteredSegments
      .map((x, i) => {
        const cl = COLOR_MAPPING[x.label] || 'var(--glass-border)';
        const ts = x.timestamps || [
          { type: 'start', time: x.start },
          { type: 'end', time: x.end },
        ];

        // Format timestamps
        const th = ts
          .map(
            t =>
              `<span class="yt-ai-timestamp" data-time="${t.time}" title="Jump to ${formatTime(t.time)}">${formatTime(t.time)}</span>`
          )
          .join(' <span style="opacity:0.3; margin:0 4px">/</span> ');

        // Stagger animation delay for scrollytelling effect
        const delay = i * 0.05;

        return `
          <div class="yt-ai-segment-item" style="border-left: 3px solid ${cl}; animation-delay: ${delay}s">
            <div class="yt-ai-segment-header">
              <div class="yt-ai-segment-label" style="background: ${cl}22; border: 1px solid ${cl}44; color: ${cl}">${LABEL_MAPPING[x.label] || x.label}</div>
              <div class="yt-ai-segment-time">${th}</div>
            </div>
            ${x.title ? `<div class="yt-ai-segment-title">${x.title}</div>` : ''}
            <div class="yt-ai-segment-desc">${x.description || x.text || ''}</div>
          </div>
        `;
      })
      .join('');

    c.innerHTML = `<div class="yt-ai-segments-list">${h}</div>`;

    // Attach Event Listeners
    $$('.yt-ai-timestamp', c).forEach(e => {
      e.style.cursor = 'pointer';
      e?.addEventListener('click', evt => {
        evt.stopPropagation();
        seekVideo(parseFloat(e.dataset.time));
      });

      // Add micro-interaction on hover
      e?.addEventListener('mouseenter', () => {
        e.style.textShadow = '0 0 8px var(--primary)';
      });
      e?.addEventListener('mouseleave', () => {
        e.style.textShadow = 'none';
      });
    });
  } catch (err) {
    console.error('Err:renderSegments', err);
  }
}
