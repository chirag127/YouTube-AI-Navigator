// Initialization sequence with proper error handling

import { log, logError } from './debug.js';

/**
 * Initialize extension with retry logic
 */
export async function initializeExtension() {
    log('=== YouTube AI Master Initialization ===');

    try {
        // Step 1: Load settings
        log('Step 1: Loading settings...');
        const { loadSettings } = await import(chrome.runtime.getURL('content/core/state.js'));
        await loadSettings();
        log('Settings loaded ✓');

        // Step 2: Initialize observer
        log('Step 2: Initializing observer...');
        const { initObserver } = await import(chrome.runtime.getURL('content/core/observer.js'));
        initObserver();
        log('Observer initialized ✓');

        // Step 3: Initialize transcript service
        log('Step 3: Initializing transcript service...');
        try {
            const { initTranscriptLoader } = await import(chrome.runtime.getURL('content/transcript-loader.js'));
            initTranscriptLoader();
            log('Transcript service initialized ✓');
        } catch (error) {
            logError('Transcript service initialization failed (non-critical)', error);
            log('Continuing without transcript loader...');
        }

        log('=== Initialization Complete ✓ ===');
        return true;

    } catch (error) {
        logError('Initialization failed', error);
        return false;
    }
}

/**
 * Check if page is ready
 */
export function waitForPageReady() {
    return new Promise((resolve) => {
        if (document.readyState === 'complete') {
            resolve();
        } else {
            window.addEventListener('load', resolve);
        }
    });
}
