export async function analyzeVideo(t, m, c = [], o = { length: 'Medium' }) {
  try {
    const result = await chrome.runtime.sendMessage({
      action: 'ANALYZE_VIDEO',
      transcript: t,
      metadata: m,
      comments: c,
      options: o,
    });
    return result;
  } catch (err) {
    console.error('Err:analyzeVideo', err);
    throw err;
  }
}
