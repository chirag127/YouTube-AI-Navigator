import { lg, er } from '../../utils/shortcuts/log.js';

export async function initializeExtension() {
  const { url } = await import(chrome.runtime.getURL('utils/shortcuts/runtime.js'));
  lg('=== YouTube AI Master Initialization ===');
  try {
    lg('Step 1: Loading settings...');
    const { loadSettings } = await import(url('content/core/state.js'));
    await loadSettings();
    lg('Settings loaded ✓');

    lg('Step 2: Initializing observer...');
    const { initObserver } = await import(url('content/core/observer.js'));
    initObserver();
    lg('Observer initialized ✓');

    lg('Step 3: Initializing Auto-Liker...');
    try {
      const { autoLiker } = await import(url('content/features/auto-liker.js'));
      autoLiker.init();
      lg('Auto-Liker initialized ✓');
    } catch (e) {
      er('Auto-Liker initialization failed (non-critical)', e);
    }

    lg('=== Initialization Complete ✓ ===');
    return true;
  } catch (e) {
    er('Initialization failed', e);
    return false;
  }
}

export async function waitForPageReady() {
  const { url } = await import(chrome.runtime.getURL('utils/shortcuts/runtime.js'));
  const { d: dc, w: wn } = await import(url('utils/shortcuts/dom.js'));
  const { on } = await import(url('utils/shortcuts/dom.js'));
  return new Promise(r => {
    if (dc.readyState === 'complete') r();
    else on(wn, 'load', r);
  });
}
