const gu = p => chrome.runtime.getURL(p);

const { qs as $, qsa as $$ } = await import(gu('utils/shortcuts/dom.js'));
const { l, w, e } = await import(gu('utils/shortcuts/log.js'));
const { to } = await import(gu('utils/shortcuts/global.js'));
export class ScrollManager {
  constructor() {
    this.originalScrollPosition = 0;
    this.isScrolling = false;
  }
  savePosition() {
    this.originalScrollPosition = window.scrollY;
    l('[SM] Saved pos:', this.originalScrollPosition);
  }
  restorePosition() {
    l('[SM] Restoring pos:', this.originalScrollPosition);
    window.scrollTo({ top: this.originalScrollPosition, behavior: 'smooth' });
  }
  scrollToTop(i = false) {
    l('[SM] Scroll top', i ? '(inst)' : '(smth)');
    window.scrollTo({ top: 0, behavior: i ? 'auto' : 'smooth' });
  }
  scrollToTopInstant() {
    l('[SM] Inst scroll top');
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }
  async scrollToComments() {
    if (this.isScrolling) {
      w('[SM] Skip');
      return false;
    }
    this.isScrolling = true;
    l('[SM] Scroll comments...');
    try {
      this.savePosition();
      const cs = $('ytd-comments#comments');
      if (!cs) {
        w('[SM] No comments sec');
        this.isScrolling = false;
        return false;
      }
      cs.scrollIntoView({ behavior: 'smooth', block: 'start' });
      await this.waitForScroll(1000);
      window.scrollBy({ top: -100, behavior: 'smooth' });
      await this.waitForScroll(500);
      l('[SM] ✅ Scrolled');
      await this.waitForCommentsToLoad();
      this.isScrolling = false;
      return true;
    } catch (x) {
      e('[SM] Err scroll:', x);
      this.isScrolling = false;
      return false;
    }
  }
  async waitForCommentsToLoad() {
    l('[SM] Wait comments...');
    const max = 5000,
      int = 200;
    let el = 0;
    while (el < max) {
      const ce = $$('ytd-comment-thread-renderer');
      if (ce.length > 0) {
        l(`[SM] ✅ Loaded: ${ce.length}`);
        return true;
      }
      await this.waitForScroll(int);
      el += int;
    }
    w('[SM] Timeout');
    return false;
  }
  async scrollToElement(sel, opt = {}) {
    const el = $(sel);
    if (!el) {
      w(`[SM] Not found: ${sel}`);
      return false;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest', ...opt });
    await this.waitForScroll(1000);
    return true;
  }
  waitForScroll(ms) {
    return new Promise(r => to(r, ms));
  }
  isInViewport(el) {
    const r = el.getBoundingClientRect();
    return (
      r.top >= 0 &&
      r.left >= 0 &&
      r.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      r.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  ensureVisible(el) {
    if (!this.isInViewport(el)) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
let sm = null;
export function getScrollManager() {
  if (!sm) sm = new ScrollManager();
  return sm;
}
export const scrollToComments = () => getScrollManager().scrollToComments();
export const scrollToTop = (i = false) => getScrollManager().scrollToTop(i);
export const scrollToTopInstant = () => getScrollManager().scrollToTopInstant();
export const saveScrollPosition = () => getScrollManager().savePosition();
export const restoreScrollPosition = () => getScrollManager().restorePosition();
