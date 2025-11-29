import { getHistory } from '../../services/storage/comprehensive-history.js';
import { slg, sls, slr, l, e, now } from '../../utils/shortcuts/index.js';

const CV = 1;
const CE = 24 * 60 * 60 * 1000;

async function getCached(vid, type) {
  const k = `video_${vid}_${type}`;
  const r = await slg(k);
  if (r[k]) {
    const c = r[k];
    if (c.version === CV && now() - c.timestamp < CE) {
      l(`[VideoData] Cache hit: ${k}`);
      return c.data;
    }
    await slr(k);
  }
  return null;
}

async function setCache(vid, type, data) {
  const k = `video_${vid}_${type}`;
  await sls({ [k]: { version: CV, timestamp: now(), data } });
  l(`[VideoData] Cached: ${k}`);
}

export async function handleSaveHistory(req) {
  const { data } = req;
  const h = getHistory();
  await h.save(data.videoId, data);
  return { success: true };
}

export async function handleGetVideoData(req) {
  const { videoId, dataType, options = {} } = req;
  const c = await getCached(videoId, dataType);
  if (c) return { success: true, data: c, fromCache: true };
  let r;
  try {
    switch (dataType) {
      case 'metadata':
        r = await handleGetVideoInfo({ videoId });
        if (r.success) {
          await setCache(videoId, dataType, r.metadata);
          return { success: true, data: r.metadata, fromCache: false };
        }
        break;
      case 'transcript':
        r = await handleGetTranscript({ videoId, lang: options.lang || 'en' });
        if (r.success) {
          await setCache(videoId, dataType, r.segments);
          return { success: true, data: r.segments, fromCache: false };
        }
        break;
      case 'comments':
        r = await handleGetComments({ videoId, limit: options.limit || 20 });
        if (r.success) {
          await setCache(videoId, dataType, r.comments);
          return { success: true, data: r.comments, fromCache: false };
        }
        break;
      default:
        return { success: false, error: 'Invalid data type' };
    }
    return r;
  } catch (x) {
    e(`[VideoData] Error fetching ${dataType}:`, x);
    return { success: false, error: x.message };
  }
}
