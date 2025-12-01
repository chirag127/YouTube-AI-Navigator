const gu = p => chrome.runtime.getURL(p);

);
);
export async function retry(fn, max = 3, d = 1000) {
  console.log(`[Retry] Starting with max ${max} attempts, delay ${d}ms`);
  try {
    for (let i = 1; i <= max; i++) {
      try {
        const result = await fn();
        if (i > 1) console.log(`[Retry] Success on attempt ${i}`);
        return result;
      } catch (err) {
        if (i === max) {
          console.error(`[Retry:Fail] All ${max} attempts failed:`, err.message);
          throw err;
        }
        const delay = d * i;
        console.warn(`[Retry] Attempt ${i} failed, retrying in ${delay}ms:`, err.message);
        await sleep(delay);
      }
    }
  } catch (err) {
    console.error('[Retry:Fail] Final error:', err);
    throw err;
  }
}
export function sleep(ms) {
  try {
    return new Promise(r => setTimeout(r, ms));
  } catch (err) {
    console.error('Err:sleep', err);
    return Promise.resolve();
  }
}
