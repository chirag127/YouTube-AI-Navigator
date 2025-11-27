/**
 * Dynamically load marked.js from CDN
 * This ensures we don't bundle the library directly
 */

const MARKED_CDN_URL = 'https://cdn.jsdelivr.net/npm/marked@17.0.1/marked.min.js';

let markedLoaded = false;
let markedLoadPromise = null;

/**
 * Load marked library from CDN
 * @returns {Promise<object>} The marked library
 */
export async function loadMarked() {
    // Return cached promise if already loading
    if (markedLoadPromise) {
        return markedLoadPromise;
    }

    // Return immediately if already loaded
    if (markedLoaded && window.marked) {
        return window.marked;
    }

    // Create new load promise
    markedLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = MARKED_CDN_URL;
        script.async = true;

        script.onload = () => {
            markedLoaded = true;
            if (window.marked) {
                resolve(window.marked);
            } else {
                reject(new Error('marked library loaded but not found on window'));
            }
        };

        script.onerror = () => {
            markedLoadPromise = null;
            reject(new Error('Failed to load marked library from CDN'));
        };

        document.head.appendChild(script);
    });

    return markedLoadPromise;
}

/**
 * Parse markdown to HTML
 * @param {string} markdown - Markdown text to parse
 * @returns {Promise<string>} Parsed HTML
 */
export async function parseMarkdown(markdown) {
    const marked = await loadMarked();
    return marked.parse(markdown);
}
