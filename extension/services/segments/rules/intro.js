import { l } from '../../../utils/shortcuts/log.js';
export const type = 'intro';
export const description = 'Narrated trailers, intros, outros without info';

export const detect = (text, context) => {
  const { start, duration } = context.segment || {};

  if (start < 30 && duration < 20) {
    const patterns = [/welcome/i, /hey.*guys/i, /what's up/i, /today.*going to/i];
    const result = patterns.some(p => p.test(text));
    return result;
  }

  const totalDuration = context.metadata?.duration || 0;
  if (totalDuration - start < 30) {
    const patterns = [/thanks.*watching/i, /see you.*next/i, /catch you/i];
    const result = patterns.some(p => p.test(text));
    return result;
  }
  return false;
};




