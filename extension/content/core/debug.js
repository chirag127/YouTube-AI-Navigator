// Debug utilities

/**
 * Log with timestamp
 * @param {string} message - Log message
 * @param {*} data - Optional data
 */
export function log(message, data) {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    console.log(`[YTAI ${timestamp}] ${message}`, data || '');
}

/**
 * Log error with context
 * @param {string} context - Error context
 * @param {Error} error - Error object
 */
export function logError(context, error) {
    console.error(`[YTAI ERROR] ${context}:`, error);
}

/**
 * Check if element exists
 * @param {string} selector - CSS selector
 * @returns {boolean} True if exists
 */
export function checkElement(selector) {
    const exists = !!document.querySelector(selector);
    log(`Element check: ${selector}`, exists ? '✓' : '✗');
    return exists;
}

/**
 * Wait for element to appear
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout in ms
 * @returns {Promise<Element>} Element when found
 */
export function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            return resolve(element);
        }

        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Timeout waiting for ${selector}`));
        }, timeout);
    });
}
