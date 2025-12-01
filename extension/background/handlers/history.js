
import { nw as now } from '../../utils/shortcuts/core.js';

export async function handleSaveToHistory(req, rsp) {
  try {
    const { videoId, title, summary, timestamp } = req.data || req;
    const res = await slg('summaryHistory');
    const h = res.summaryHistory || [];
    h.unshift({ videoId, title, summary, timestamp: timestamp || now() });
    await sls({ summaryHistory: h.slice(0, 100) });
    rsp({ success: true });
  } catch (x) {
    console.error('SaveHistory:', x);
    rsp({ success: false, error: x.message });
  }
}
