import { sg } from '../../utils/shortcuts/storage.js';
import { l } from '../../utils/shortcuts/logging.js';
import { cw } from '../../utils/shortcuts/chrome.js';
import { to as st } from '../../utils/shortcuts/global.js';
import { pr, np } from '../../utils/shortcuts/async.js';
import { strategy as s1 } from './strategies/dom-automation-strategy.js';
import { strategy as s3 } from './strategies/speech-to-text-strategy.js';
import { strategy as s4 } from './strategies/genius-strategy.js';

const S = [s1, s2, s4, s3].sort((a, b) => a.priority - b.priority);

export async function fetchTranscript(v, lg = 'en', to = 30000) {
  let le;
  const s = await sg(['transcriptMethod', 'transcriptLanguage']),
    pm = s.transcriptMethod || 'auto',
    pl = s.transcriptLanguage || lg;
  l(`[Fetcher] Settings - Method: ${pm}, Language: ${pl}`);
  let tryS = [...S];
  if (pm !== 'auto') {
    const ps = tryS.find(
      x =>
        (pm === 'dom-automation' && x.name === 'DOM Automation') ||
        (pm === 'invidious' && x.name === 'Invidious API') ||
        (pm === 'genius' && x.name === 'Genius Lyrics')
    );
    if (ps) {
      tryS = tryS.filter(x => x !== ps);
      tryS.unshift(ps);
    }
  }
  for (const stg of tryS) {
    try {
      l(`[Fetcher] Trying ${stg.name}...`);
      const r = await pr([stg.fetch(v, pl), np((_, r) => st(() => r(new Error('Timeout')), to))]);
      if (r?.length) {
        l(`[Fetcher] ✅ ${stg.name} succeeded: ${r.length} segments`);
        return r;
      }
    } catch (e) {
      le = e;
      cw(`[Fetcher] ${stg.name} failed:`, e.message);
    }
  }
  throw new Error(le?.message || 'All transcript fetch strategies failed');
}
