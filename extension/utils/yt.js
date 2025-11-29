// Ultra-minimal YouTube utilities
export const log = (msg, ...args) => console.log(`[YT] ${msg}`, ...args);
export const err = (msg, e) => console.error(`[YT] ❌ ${msg}`, e?.message || e);
export const ok = (msg, ...args) => console.log(`[YT] ✅ ${msg}`, ...args);

const cache = new Map();
export const cached = (key, ttl = 300000) => ({
    get: () => {
        const item = cache.get(key);
        return item && Date.now() - item.time < ttl ? item.val : null;
    },
    set: (val) => cache.set(key, { val, time: Date.now() })
});
