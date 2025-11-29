export const type = 'interaction';
export const description = 'Explicit reminders to like, subscribe, or interact';

export const detect = text => {
  const patterns = [
    /like.*subscribe/i,
    /subscribe.*bell/i,
    /hit.*like/i,
    /smash.*like/i,
    /leave.*comment/i,
  ];
  return patterns.some(p => p.test(text));
};
