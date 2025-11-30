const gu = p => chrome.runtime.getURL(p);

const { e, w, l } = await import(gu('utils/shortcuts/log.js'));
const { to } = await import(gu('utils/shortcuts/global.js'));
export async function retry(fn, max = 3, d = 1000) {
  l(`[Retry] Starting with max ${max} attempts, delay ${d}ms`);
  try {
    for (let i = 1; i <= max; i++) {
      try {
        const result = await fn();
        if (i > 1) l(`[Retry] Success on attempt ${i}`);
        return result;
      } catch (err) {
        if (i === max) {
          e(`[Retry:Fail] All ${max} attempts failed:`, err.message);
          throw err;
        }
        const delay = d * i;
        w(`[Retry] Attempt ${i} failed, retrying in ${delay}ms:`, err.message);
        await sleep(delay);
      }
    }
  } catch (err) {
    e('[Retry:Fail] Final error:', err);
    throw err;
  }
}
export function sleep(ms) {
  try {
    return new Promise(r => to(r, ms));
  } catch (err) {
    e('Err:sleep', err);
    return Promise.resolve();
  }
}
