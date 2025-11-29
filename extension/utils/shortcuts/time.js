export const now = () => Date.now();
export const delay = (f, d) => setTimeout(f, d);
export const clearDelay = (i) => clearTimeout(i);
export const interval = (f, d) => setInterval(f, d);
export const clearInterval = (i) => window.clearInterval(i);
