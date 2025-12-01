const gu = p => chrome.runtime.getURL(p);

);
);
);
export class ScrollManager {
  constructor() {
    try {
      this.originalScrollPosition = 0;
      this.isScrolling = false;
    } catch (err) {
      console.error('Err:ScrollManager', err);
    }
  }
  savePosition() {
    try {
      this.originalScrollPosition = window.scrollY;
    } catch (err) {
      console.error('Err:savePosition', err);
    }
  }
  restorePosition() {
    try {
      window.scrollTo({ top: this.originalScrollPosition, behavior: 'smooth' });
    } catch (err) {
      console.error('Err:restorePosition', err);
    }
  }
  scrollToTop(i = false) {
    try {
      window.scrollTo({ top: 0, behavior: i ? 'auto' : 'smooth' });
    } catch (err) {
      console.error('Err:scrollToTop', err);
    }
  }
  scrollToTopInstant() {
    try {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch (err) {
      console.error('Err:scrollToTopInstant', err);
    }
  }
  async scrollToComments() {
    if (this.isScrolling) return false;
    this.isScrolling = true;
    try {
      this.savePosition();
      const cs = $('ytd-comments#comments');
      if (cs) {
        cs.scrollIntoView({ behavior: 'smooth', block: 'start' });
        await this.waitForScroll(1200);
        window.scrollBy(0, 200);
        await this.waitForScroll(600);
      } else {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
        await this.waitForScroll(1500);
      }
      const loaded = await this.waitForCommentsToLoad();
      this.isScrolling = false;
      return loaded;
    } catch (x) {
      console.error('[SM] Err scroll:', x);
      this.isScrolling = false;
      return false;
    }
  }
  async waitForCommentsToLoad() {
    const max = 8000,
      int = 300;
    let el = 0;
    while (el < max) {
      const ce = $$('ytd-comment-thread-renderer');
      if (ce.length > 0) {
        let loaded = false;
        for (let i = 0; i < Math.min(ce.length, 5); i++) {
          const c = ce[i];
          const a = c.querySelector('#author-text')?.textContent?.trim();
          const t = c.querySelector('#content-text')?.textContent?.trim();
          if (a && t) {
            loaded = true;
            break;
          }
        }
        if (loaded) return true;
      }
      await this.waitForScroll(int);
      el += int;
    }
    console.warn('[SM] Timeout waiting for comments');
    return false;
  }
  async scrollToElement(sel, opt = {}) {
    try {
      const el = $(sel);
      if (!el) return false;
      el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest', ...opt });
      await this.waitForScroll(1000);
      return true;
    } catch (err) {
      console.error('Err:scrollToElement', err);
      return false;
    }
  }
  waitForScroll(ms) {
    try {
      return new Promise(r => setTimeout(r, ms));
    } catch (err) {
      console.error('Err:waitForScroll', err);
      return Promise.resolve();
    }
  }
  isInViewport(el) {
    try {
      const r = el.getBoundingClientRect();
      return (
        r.top >= 0 &&
        r.left >= 0 &&
        r.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        r.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    } catch (err) {
      console.error('Err:isInViewport', err);
      return false;
    }
  }
  ensureVisible(el) {
    try {
      if (!this.isInViewport(el)) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      console.error('Err:ensureVisible', err);
    }
  }
}
let sm = null;
export function getScrollManager() {
  try {
    if (!sm) sm = new ScrollManager();
    return sm;
  } catch (err) {
    console.error('Err:getScrollManager', err);
    return null;
  }
}
export const scrollToComments = () => getScrollManager().scrollToComments();
export const scrollToTop = (i = false) => getScrollManager().scrollToTop(i);
export const scrollToTopInstant = () => getScrollManager().scrollToTopInstant();
export const saveScrollPosition = () => getScrollManager().savePosition();
export const restoreScrollPosition = () => getScrollManager().restorePosition();
