import { msg } from '../../../utils/shortcuts.js';

export const name = 'Invidious API';
export const priority = 2;

export const extract = async (vid, lang = 'en') => {
  const r = await msg({ action: 'FETCH_INVIDIOUS_TRANSCRIPT', videoId: vid, lang });
  if (!r.success) throw new Error(r.error || 'Invidious failed');
  return r.data;
};
