import { l } from '../../../utils/shortcuts/log.js';
export const type = 'selfpromo';
export const description = 'Promoting own merchandise or monetized platforms';

export const detect = text => {
  const keywords = ['merch', 'patreon', 'buy my', 'check out my', 'my course', 'my book'];
  const result = keywords.some(k => text.toLowerCase().includes(k));
  return result;
};




