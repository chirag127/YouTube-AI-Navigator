// Service Worker specific utilities
export const swself = self; // renamed from sw to avoid conflict with string.startsWith
export const swl = (e, f) => self.addEventListener(e, f);
export const sws = () => self.skipWaiting();
export const swc = () => self.clients.claim();
