import { sl } from '../../utils/shortcuts/storage.js';
import { nw as nt } from '../../utils/shortcuts/core.js';

export async function saveTranscript(v, m, t, s) {
  if (!v) throw new Error('Video ID required');
  const d = { videoId: v, metadata: m, transcript: t, summary: s, timestamp: nt() };
  await sl({ [`video_${v}`]: d });
  return d;
}
export async function getTranscript(v) {
  if (!v) throw new Error('Video ID required');
  const r = await sl(`video_${v}`);
  return r[`video_${v}`] || null;
}
export async function deleteTranscript(v) {
  if (!v) return;
  await sl(`video_${v}`, null);
}




