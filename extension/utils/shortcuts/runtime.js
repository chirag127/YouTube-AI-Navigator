export const msg = (m, c) => chrome.runtime.sendMessage(m, c);
export const listen = (l) => chrome.runtime.onMessage.addListener(l);
export const rurl = (p) => chrome.runtime.getURL(p);
export const rt = chrome.runtime;
export const rg = () => chrome.runtime.getManifest();
