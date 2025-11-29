export const type = 'selfpromo';
export const description = 'Promoting own merchandise or monetized platforms';

export const detect = text => {
  const keywords = ['merch', 'patreon', 'buy my', 'check out my', 'my course', 'my book'];
  return keywords.some(k => text.toLowerCase().includes(k));
};
