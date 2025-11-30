import { l } from '../../../utils/shortcuts/log.js';
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
  const result = patterns.some(p => p.test(text));
  return result;
};




