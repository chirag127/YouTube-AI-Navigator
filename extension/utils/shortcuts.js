/**
 * shortcuts.js
 * Ultra-concise utilities for logging and common operations.
 * "5-Star Quality" - Minimal tokens, maximum utility.
 */

// Logging with prefixes
export const cl = (msg, ...args) => console.log(`[Log] ${msg}`, ...args);
export const cw = (msg, ...args) => console.warn(`[Warn] ${msg}`, ...args);
export const ce = (msg, ...args) => console.error(`[Err] ${msg}`, ...args);

// DOM Selection
export const qs = (sel, parent = document) => parent.querySelector(sel);
export const qsa = (sel, parent = document) => [
    ...parent.querySelectorAll(sel),
];
export const ge = (id) => document.getElementById(id);

// JSON helpers
export const jstr = (obj) => JSON.stringify(obj, null, 2);
export const jpar = (str) => JSON.parse(str);

// Async helpers
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Safe Fetch wrapper with timeout
export async function safeFetch(url, options = {}, timeout = 5000) {
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (e) {
        cw(`Fetch failed for ${url}:`, e.message);
        return null;
    }
}
