// Sponsor Segment Classification Rule
export const type = 'sponsor';
export const description = 'Paid promotion of product/service not directly related to creator';

export const detect = (text, _context) => {
  const keywords = ['sponsor', 'brought to you by', 'thanks to', 'partnered with', 'affiliate'];
  const score = keywords.reduce((s, k) => s + (text.toLowerCase().includes(k) ? 1 : 0), 0);
  return score > 0;
};

export const validate = (segment, allSegments) => {
  // If entire video is about product, don't classify as sponsor
  const totalDuration = allSegments.reduce((sum, s) => sum + (s.end - s.start), 0);
  const segmentDuration = segment.end - segment.start;
  if (segmentDuration / totalDuration > 0.8) return false;
  return true;
};
