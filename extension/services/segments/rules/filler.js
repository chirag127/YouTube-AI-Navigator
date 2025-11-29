export const type = 'filler';
export const description = 'Non-essential off-topic content, jokes, fake sponsors';

export const detect = text => {
  const patterns = [/by the way/i, /speaking of/i, /random.*but/i, /off topic/i, /quick.*story/i];
  return patterns.some(p => p.test(text));
};
