import { l, e, w, d } from '../utils/shortcuts/logging.js';
import { $, $$ } from '../utils/shortcuts/dom.js';
import { jp } from '../utils/shortcuts/core.js';
import { uc } from '../utils/shortcuts/string.js';
import { to as st } from '../utils/shortcuts/global.js';
class YTE {
  constructor() {
    this.of = w.fetch.bind(w);
    this.ls = new Map();
    this.iu = new Set();
    this.ii();
    this.inl();
    w.addEventListener('message', e => {
      if (e.source !== w) return;
      if (e.data.type === 'YT_GET_DATA') this.e('data_response', this.gid());
    });
    w._ytExtractor = this;
    l('[YTE] Init');
  }

  ii() {
    w.fetch = async (...a) => {
      const [r, c] = a;
      const u = r ? r.toString() : '';
      if (this.iu.has(u)) return this.of(r, c);
      const res = await this.of(r, c);
      this.pr(u, res).catch(err => e('[YTE] Err:', err));
      return res;
    };
  }

  async pr(u, r) {
    if (u.includes('/youtubei/v1/player')) {
      try {
        this.e('metadata', await r.clone().json());
      } catch (e) {}
    } else if (u.includes('/youtubei/v1/next')) {
      try {
        this.e('comments', await r.clone().json());
      } catch (e) {}
    } else if (u.includes('/api/timedtext') || u.includes('/youtubei/v1/get_transcript')) {
      this.htu(u);
    } else if (u.includes('/youtubei/v1/live_chat/get_live_chat')) {
      try {
        this.e('live_chat', await r.clone().json());
      } catch (e) {}
    } else if (u.includes('/youtubei/v1/reel/')) {
      try {
        this.e('shorts_data', await r.clone().json());
      } catch (e) {}
    }
  }

  async htu(u) {
    if (this.iu.has(u)) return;
    l('[YTE] Cap tr:', u);
    this.iu.add(u);
    try {
      const r = await this.of(u);
      if (!r.ok) {
        e('[YTE] Fail:', r.status);
        this.iu.delete(u);
        return;
      }
      const d = await r.json();
      l('[YTE] Got tr');
      this.e('transcript', d);
      st(() => this.iu.delete(u), 1e4);
    } catch (err) {
      e('[YTE] Err:', err);
      this.iu.delete(u);
    }
  }

  inl() {
    d.addEventListener('yt-navigate-finish', e => {
      const vid = e.detail?.response?.playerResponse?.videoDetails?.videoId;
      l('[YTE] Nav:', vid);
      this.e('navigation', { videoId: vid, detail: e.detail });
    });
  }

  gid() {
    let pr = w.ytInitialPlayerResponse;
    if (!pr) {
      try {
        const a = $('ytd-app');
        pr = a?.data?.playerResponse || a?.__data?.playerResponse;
      } catch (e) {}
    }
    if (!pr) {
      try {
        for (const s of document.querySelectorAll('script')) {
          const m = (s.textContent || '').match(/ytInitialPlayerResponse\s*=\s*({.+?});/s);
          if (m) {
            pr = jp(m[1]);
            break;
          }
        }
      } catch (e) {}
    }
    if (!pr && w.ytplayer?.config?.args?.player_response) {
      try {
        pr = jp(w.ytplayer.config.args.player_response);
      } catch (e) {}
    }
    return {
      playerResponse: pr,
      initialData: w.ytInitialData,
      cfg: w.ytcfg?.data_,
    };
  }

  on(e, c) {
    if (!this.ls.has(e)) this.ls.set(e, []);
    this.ls.get(e)?.push(c);
  }

  e(ev, d) {
    this.ls.get(ev)?.forEach(c => c(d));
    w.postMessage({ type: `YT_${uc(ev)}`, payload: d }, '*');
  }

  em() {
    const pr = w.ytInitialPlayerResponse;
    if (!pr) return null;
    const d = pr.videoDetails,
      m = pr.microformat?.playerMicroformatRenderer;
    return {
      title: d?.title,
      videoId: d?.videoId,
      author: d?.author,
      viewCount: d?.viewCount,
      lengthSeconds: d?.lengthSeconds,
      description: d?.shortDescription,
      isLive: d?.isLiveContent,
      keywords: d?.keywords || [],
      channelId: d?.channelId,
      uploadDate: m?.uploadDate || '',
    };
  }

  esm() {
    const as = document.querySelector('ytd-reel-video-renderer[is-active]');
    if (!as) return null;
    const t = as.querySelector('.ytd-reel-player-header-renderer-title')?.textContent;
    const c = as.querySelector('.ytd-channel-name')?.textContent;
    return { title: t?.trim(), channel: c?.trim() };
  }
}
new YTE();
