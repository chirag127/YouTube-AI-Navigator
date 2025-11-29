export const st = setTimeout;
export const ct = clearTimeout;
export const si = setInterval;
export const ci = clearInterval;
export const delay = (f, d) => setTimeout(f, d);
export const clearDelay = i => clearTimeout(i);
export const interval = (f, d) => setInterval(f, d);
export const clearInt = i => clearInterval(i);
export const now = () => Date.now();
