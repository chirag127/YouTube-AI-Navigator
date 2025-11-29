(async () => {
  try {
    const { url } = await import(chrome.runtime.getURL('utils/shortcuts/runtime.js'));
    const { ce, ap } = await import(chrome.runtime.getURL('utils/shortcuts/dom.js'));
    const { l } = await import(chrome.runtime.getURL('utils/shortcuts/logging.js'));
    const { dc } = await import(chrome.runtime.getURL('utils/shortcuts/global.js'));

    const s = ce('script');
    s.src = url('content/transcript/xhr-interceptor.js');
    s.type = 'module';
    ap(dc.head || dc.documentElement, s);
    s.onload = function () {
      this.remove();
    };
    l('[YAM]Interceptor');
  } catch (x) {
    console.error('[YAM]Inject:', x);
  }
})();
