import { initializeServices as is, getServices as gs } from '../services.js';
import { getApiKey as gk } from '../utils/api-key.js';
import { geniusLyricsAPI as gl } from '../../api/genius-lyrics.js';
import { sponsorBlockAPI as sb } from '../../api/sponsorblock.js';
import { ContextManager as CM } from '../../services/context-manager.js';






import { np, pc } from '../../utils/shortcuts/async.js';
let ka = null;
const ska = () => {
  if (!ka) ka = setInterval(() => cr.getPlatformInfo(() => {}), 2e4);
};
const stka = () => {
  if (ka) {
    clearInterval(ka);
    ka = null;
  }
};
export async function handleAnalyzeVideo(q, r) {
  const { transcript: t, metadata: m, comments: c = [], options: o = {}, useCache: uc = true } = q;
  const v = m?.videoId;
  ska();
  try {
    const k = await gk();
    if (!k) {
      r({ success: false, error: 'API Key NA' });
      return;
    }
    await is(k);
    const { gemini: g, segmentClassification: sc, storage: s } = gs();
    if (uc && v) {
      const d = await s.getVideoData(v);
      if (d?.summary && d?.segments && d.segments.length > 0) {
        r({
          success: true,
          fromCache: true,
          data: {
            summary: d.summary,
            faq: d.faq,
            insights: d.insights,
            segments: d.segments,
            timestamps: d.timestamps,
          },
        });
        return;
      }
    }
    let ly = null;
    const st4 = await chrome.storage.sync.get('config');
    const glEn = st4?.config?.externalApis?.geniusLyrics?.enabled ?? true;
    const im =
      m?.category === 'Music' ||
      lwc(m?.title || '').includes('official video') ||
      lwc(m?.title || '').includes('lyrics');
    if (glEn && (im || !t?.length)) {
      try {
        ly = await gl.getLyrics(m.title, m.author);
      } catch (x) {
        console.warn('[AV]Lyrics:', x.message);
      }
    }
    let sb2 = [];
    const st3 = await chrome.storage.sync.get('config');
    const sbEn = st3?.config?.externalApis?.sponsorBlock?.enabled ?? true;
    if (v && sbEn) {
      try {
        sb2 = await sb.fetchSegments(v);
      } catch (x) {
        console.warn('[AV]SB:', x.message);
      }
    }
    let ec = {};
    try {
      if (!ss) throw new Error('Sync NA');
      const st = await chrome.storage.sync.get('config');
      if (!st?.config) console.warn('[AV]No cfg');
      if (!m) throw new Error('No meta');
      const cm = new CM(st.config?.externalApis || {});
      const fp = cm.fetchContext(m);
      const tp = np((_, j) => setTimeout(() => j(new Error('TO')), 1e4));
      ec = await pc([fp, tp]);
    } catch (x) {
      console.error('[AV]Ctx:', x.message);
    }
    if ((!t || !t.length) && !ly && (!c || !c.length)) throw new Error('No content');
    const ac = {
      transcript: t || [],
      lyrics: ly,
      comments: c || [],
      metadata: m,
      sponsorBlockSegments: sb2,
      externalContext: ec,
    };
    const st2 = await chrome.storage.sync.get(['summaryLength');
    const an = await g.generateComprehensiveAnalysis(ac, {
      summaryLength: o.summaryLength || st2.summaryLength || 'medium',
      language: o.language || 'en',
      maxInsights: o.maxInsights || st2.maxInsights || 8,
      maxFAQ: o.maxFAQ || st2.maxFAQ || 5,
      includeTimestamps: o.includeTimestamps !== false && st2.includeTimestamps !== false,
    });
    let sg2 = [],
      fv = null;
    if (o.generateSegments !== false) {
      const sr = await sc.classifyTranscript({
        transcript: t || [],
        metadata: m,
        lyrics: ly,
        comments: c,
      });
      sg2 = sr.segments;
      fv = sr.fullVideoLabel;
    }
    if (v && s) {
      try {
        await s.saveVideoData(v, {
          metadata: m,
          transcript: t,
          summary: an.summary,
          faq: an.faq || '',
          insights: an.insights || '',
          segments: sg2,
          timestamps: an.timestamps,
        });
      } catch (x) {
        console.warn('[AV]Save:', x.message);
      }
    }
    r({
      success: true,
      fromCache: false,
      data: {
        summary: an.summary,
        faq: an.faq,
        insights: an.insights,
        segments: sg2,
        fullVideoLabel: fv,
        timestamps: an.timestamps,
      },
    });
  } catch (x) {
    console.error('Err:AV', x);
    r({ success: false, error: x.message });
  } finally {
    stka();
  }
}
