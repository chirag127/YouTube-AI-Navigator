export const tab = o => chrome.tabs.create(o);
export const tq = (q, c) => chrome.tabs.query(q, c);
export const tm = (i, m, c) => chrome.tabs.sendMessage(i, m, c);
export const tu = (i, p) => chrome.tabs.update(i, p);
export const trm = (i, c) => chrome.tabs.remove(i, c);
export const tg = (i, c) => chrome.tabs.get(i, c);
export const tc = (o, c) => chrome.tabs.create(o, c);
