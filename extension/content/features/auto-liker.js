const gu = p => chrome.runtime.getURL(p);

const { state } = await import(gu('content/core/state.js'));

export class AutoLiker {
  constructor() {
    this.video = null;
    this.likedVideos = new Set();
    this.checkInterval = null;
    this.isObserving = false;
  }
  init() {
    try {
      this.startObserving();
    } catch (err) {
      console.error('Err:init', err);
    }
  }
  startObserving() {
    try {
      if (this.isObserving) return;
      const o = new MutationObserver(() => {
        const v = (document).querySelector('video');
        if (v && v !== this.video) this.attachToVideo(v);
      });
      o.observe(document.body, { childList: true, subtree: true });
      this.isObserving = true;
      const v = (document).querySelector('video');
      if (v) this.attachToVideo(v);
    } catch (err) {
      console.error('Err:startObserving', err);
    }
  }
  attachToVideo(v) {
    try {
      if (this.video) (this.video)?.removeEventListener('timeupdate', this.handleTimeUpdate);
      this.video = v;
      (this.video)?.addEventListener('timeupdate', this.handleTimeUpdate.bind(this));
      const vid = state.currentVideoId || new URLSearchParams(location.search).get('v');
      if (vid && !this.likedVideos.has(vid)) console.log(`AL: New vid ${vid}`);
    } catch (err) {
      console.error('Err:attachToVideo', err);
    }
  }
  async handleTimeUpdate() {
    try {
      if (!state.settings.autoLike || !this.video) return;
      const vid = state.currentVideoId || new URLSearchParams(location.search).get('v');
      if (!vid || this.likedVideos.has(vid)) return;
      const d = this.video.duration;
      const c = this.video.currentTime;
      if (!d || d === 0) return;
      const p = (c / d) * 100;
      const t = state.settings.autoLikeThreshold || 50;
      if (p >= t) await this.attemptLike(vid);
    } catch (err) {
      console.error('Err:handleTimeUpdate', err);
    }
  }
  async attemptLike(vid) {
    try {
      if (this.likedVideos.has(vid)) return;
      const live = this.isLiveStream();
      if (live && !state.settings.autoLikeLive) {
        this.likedVideos.add(vid);
        return;
      }
      if (!state.settings.likeIfNotSubscribed) {
        const sub = await this.checkSubscriptionStatus();
        if (!sub) {
          this.likedVideos.add(vid);
          return;
        }
      }
      const s = await this.clickLikeButton();
      if (s) {
        this.likedVideos.add(vid);
      }
    } catch (err) {
      console.error('Err:attemptLike', err);
    }
  }
  isLiveStream() {
    try {
      const b = (document).querySelector('.ytp-live-badge');
      if (b && window.getComputedStyle(b).display !== 'none') {
        return true;
      }
      if (this.video && this.video.duration === Infinity) {
        return true;
      }
      return false;
    } catch (err) {
      console.error('Err:isLiveStream', err);
      return false;
    }
  }
  async checkSubscriptionStatus() {
    try {
      const s = [
        '#subscribe-button > ytd-subscribe-button-renderer',
        'ytd-reel-player-overlay-renderer #subscribe-button',
        '#subscribe-button',
      ];
      let b = null;
      for (const sel of s) {
        b = (document).querySelector(sel);
        if (b) break;
      }
      if (!b) {
        return false;
      }
      return (
        b.hasAttribute('subscribed') ||
        b.querySelector("button[aria-label^='Unsubscribe']") !== null
      );
    } catch (err) {
      console.error('Err:checkSubscriptionStatus', err);
      return false;
    }
  }
  async clickLikeButton() {
    try {
      const s = [
        'like-button-view-model button',
        '#menu .YtLikeButtonViewModelHost button',
        '#segmented-like-button button',
        '#like-button button',
        'ytd-toggle-button-renderer#like-button button',
      ];
      let lb = null;
      for (const sel of s) {
        const btns = (document).querySelectorAll(sel);
        for (const b of btns) {
          if (b.closest('#top-level-buttons-computed') || b.closest('#actions')) {
            lb = b;
            break;
          }
        }
        if (lb) break;
      }
      if (!lb) {
        return false;
      }
      const lkd =
        lb.getAttribute('aria-pressed') === 'true' || lb.classList.contains('style-default-active');
      if (lkd) {
        this.likedVideos.add(state.currentVideoId || new URLSearchParams(location.search).get('v'));
        return true;
      }
      lb.click();
      return true;
    } catch (err) {
      console.error('Err:clickLikeButton', err);
      return false;
    }
  }
}
export const autoLiker = new AutoLiker();
