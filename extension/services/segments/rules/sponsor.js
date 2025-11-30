import { l } from '../../../utils/shortcuts/log.js';
export const type = 'sponsor';
export const description = 'Paid promotion of product/service not directly related to creator';

export const detect = text => {
  const keywords = ['sponsor', 'brought to you by', 'thanks to', 'partnered with', 'affiliate'];
  const score = keywords.reduce((s, k) => s + (text.toLowerCase().includes(k) ? 1 : 0), 0);
  const result = score > 0;
  return result;
};

export const validate = (segment, allSegments) => {
  const totalDuration = allSegments.reduce((sum, s) => sum + (s.end - s.start), 0);
  const segmentDuration = segment.end - segment.start;
  if (segmentDuration / totalDuration > 0.8) {
    return false;
  }
  return true;
};




