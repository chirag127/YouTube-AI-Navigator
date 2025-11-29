import * as xhrIntercept from './strategies/xhr-intercept.js';
import * as invidious from './strategies/invidious.js';
import * as youtubeDirect from './strategies/youtube-direct.js';
import * as backgroundProxy from './strategies/background-proxy.js';
import * as domParser from './strategies/dom-parser.js';
import { l, w, e } from '../../utils/shortcuts.js';

const strategies = [xhrIntercept, invidious, youtubeDirect, backgroundProxy, domParser].sort(
  (a, b) => a.priority - b.priority
);

export const extractTranscript = async (vid, lang = 'en') => {
  l(`[Transcript] Starting extraction for ${vid}, lang: ${lang}`);
  let err = null;
  for (const s of strategies) {
    try {
      l(`[Transcript] Trying: ${s.name}`);
      const r = await s.extract(vid, lang);
      if (r && r.length > 0) {
        l(`[Transcript] ✅ ${s.name} succeeded: ${r.length} segments`);
        return { success: true, data: r, method: s.name };
      }
    } catch (x) {
      err = x;
      w(`[Transcript] ${s.name} failed:`, x.message);
    }
  }
  e('[Transcript] All methods failed');
  return { success: false, error: err?.message || 'All extraction methods failed' };
};

export const getAvailableStrategies = () =>
  strategies.map(s => ({
    name: s.name,
    priority: s.priority,
  }));
