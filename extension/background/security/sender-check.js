import { cr } from '../../utils/shortcuts/index.js';

export const verifySender = s => {
  if (!s || !s.id) return false;
  if (s.id !== cr.id) return false;

  if (s.tab && !s.tab.url?.includes('youtube.com')) return false;
  return true;
};

export const isFromContentScript = s => s?.tab?.id && s?.url?.includes('youtube.com');
export const isFromExtensionPage = s => s?.url?.startsWith(`chrome-extension://${cr.id}`);
