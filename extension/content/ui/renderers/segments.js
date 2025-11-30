import { gu } from '../../../utils/shortcuts/runtime.js';
import { isa } from '../../../utils/shortcuts/array.js';

const { e } = await import(gu('utils/shortcuts/log.js'));
const { showPlaceholder } = await import(gu('content/ui/components/loading.js'));

const { seekVideo } = await import(gu('content/utils/dom.js'));
const { formatTime } = await import(gu('content/utils/time.js'));
const { qs, ae, qsa: $ } = await import(gu('utils/shortcuts/dom.js'));
const { CM: colors, LM } = await import(gu('utils/shortcuts/segments.js'));
const { sg } = await import(gu('utils/shortcuts/storage.js'));

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
    const r = await sg('config');
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
    const s = isa(data) ? data : data?.segments || [];
    const fl = !isa(data) ? data?.fullVideoLabel : null;
    const b = qs('#yt-ai-full-video-label');

    // Handle Full Video Label
    if (b) {
      if (fl) {
        b.textContent = LM[fl] || fl;
        b.style.display = 'inline-block';
        b.style.backgroundColor = colors[fl] || 'var(--glass-highlight)';
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
        const cl = colors[x.label] || 'var(--glass-border)';
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
              <div class="yt-ai-segment-label" style="background: ${cl}22; border: 1px solid ${cl}44; color: ${cl}">${LM[x.label] || x.label}</div>
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
    $('.yt-ai-timestamp', c).forEach(e => {
      e.style.cursor = 'pointer';
      ae(e, 'click', evt => {
        evt.stopPropagation();
        seekVideo(parseFloat(e.dataset.time));
      });

      // Add micro-interaction on hover
      ae(e, 'mouseenter', () => {
        e.style.textShadow = '0 0 8px var(--primary)';
      });
      ae(e, 'mouseleave', () => {
        e.style.textShadow = 'none';
      });
    });

  } catch (err) {
    e('Err:renderSegments', err);
  }
}
