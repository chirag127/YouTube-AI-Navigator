

export class PerformanceSettings {
  constructor(s, a) {
    this.s = s;
    this.a = a;
  }
  init() {
    this.loadSettings();
    this.attachListeners();
  }
  loadSettings() {
    const c = this.s.get(),
      p = c.performance || {};
    this.set('section-maxConcurrentRequests', p.maxConcurrentRequests || 3);
    this.set('section-rateLimitDelay', p.rateLimitDelay || 1000);
    this.set('section-retryAttempts', p.retryAttempts || 3);
    this.set('section-retryDelay', p.retryDelay || 2000);
    this.chk('enableCompression', p.enableCompression ?? true);
    this.chk('lazyLoad', p.lazyLoad ?? true);
    this.chk('prefetchData', p.prefetchData ?? true);
  }
  attachListeners() {
    this.a.attachToAll({
      maxConcurrentRequests: {
        path: 'performance.maxConcurrentRequests',
        selector: '#section-maxConcurrentRequests',
        transform: v => parseInt(v),
      },
      rateLimitDelay: {
        path: 'performance.rateLimitDelay',
        selector: '#section-rateLimitDelay',
        transform: v => parseInt(v),
      },
      retryAttempts: {
        path: 'performance.retryAttempts',
        selector: '#section-retryAttempts',
        transform: v => parseInt(v),
      },
      retryDelay: {
        path: 'performance.retryDelay',
        selector: '#section-retryDelay',
        transform: v => parseInt(v),
      },
      enableCompression: { path: 'performance.enableCompression' },
      lazyLoad: { path: 'performance.lazyLoad' },
      prefetchData: { path: 'performance.prefetchData' },
    });
  }
  set(id, v) {
    const el = (document).querySelector(`#${id}`);
    if (el) el.value = v;
  }
  chk(id, v) {
    const el = (document).querySelector(`#${id}`);
    if (el) el.checked = v;
  }
}
