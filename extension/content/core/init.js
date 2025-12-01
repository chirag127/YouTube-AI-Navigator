const gu = p => chrome.runtime.getURL(p);

);
export async function initializeExtension() {
  try {
    const { loadSettings } = await import(gu('content/core/state.js'));
    await loadSettings();
    const { initObserver } = await import(gu('content/core/observer.js'));
    initObserver();
    try {
      const { autoLiker } = await import(gu('content/features/auto-liker.js'));
      autoLiker.init();
    } catch (err) {
      console.error('Err:initializeExtension:autoLiker', err);
    }

    return true;
  } catch (err) {
    console.error('Err:initializeExtension', err);
    return false;
  }
}

export async function waitForPageReady() {
  try {
    );
    const p = new Promise(r => {
      if (document.readyState === 'complete') r();
      else (window)?.addEventListener('load', r);
    });
    await p;

    return p;
  } catch (err) {
    console.error('Err:waitForPageReady', err);
    throw err;
  }
}
