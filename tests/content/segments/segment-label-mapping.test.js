

describe('Segment Label Mapping Tests', () => {
  describe('Label Key Mapping (getLabelKey)', () => {
    it('should map all 13 SponsorBlock categories', () => {
      expect(getLabelKey('sponsor')).toBe('sponsor');
      expect(getLabelKey('selfpromo')).toBe('selfpromo');
      expect(getLabelKey('interaction')).toBe('interaction');
      expect(getLabelKey('intro')).toBe('intro');
      expect(getLabelKey('outro')).toBe('outro');
      expect(getLabelKey('preview')).toBe('preview');
      expect(getLabelKey('hook')).toBe('hook');
      expect(getLabelKey('music_offtopic')).toBe('music_offtopic');
      expect(getLabelKey('poi_highlight')).toBe('poi_highlight');
      expect(getLabelKey('filler')).toBe('filler');
      expect(getLabelKey('exclusive_access')).toBe('exclusive_access');
      expect(getLabelKey('chapter')).toBe('chapter');
      expect(getLabelKey('content')).toBe('content');
    });

    it('should map label variations to keys', () => {
      expect(getLabelKey('Sponsor')).toBe('sponsor');
      expect(getLabelKey('Self Promotion')).toBe('selfpromo');
      expect(getLabelKey('Self Promotion/Unpaid Promotion')).toBe('selfpromo');
      expect(getLabelKey('Unpaid/Self Promotion')).toBe('selfpromo');
      expect(getLabelKey('Interaction Reminder')).toBe('interaction');
      expect(getLabelKey('Intermission/Intro Animation')).toBe('intro');
      expect(getLabelKey('Intermission/Intro')).toBe('intro');
      expect(getLabelKey('Intro')).toBe('intro');
      expect(getLabelKey('Endcards/Credits')).toBe('outro');
      expect(getLabelKey('Outro')).toBe('outro');
      expect(getLabelKey('Preview/Recap')).toBe('preview');
      expect(getLabelKey('Preview')).toBe('preview');
      expect(getLabelKey('Tangents/Jokes')).toBe('filler');
      expect(getLabelKey('Filler/Tangent')).toBe('filler');
      expect(getLabelKey('Filler')).toBe('filler');
      expect(getLabelKey('Highlight')).toBe('poi_highlight');
      expect(getLabelKey('Exclusive Access')).toBe('exclusive_access');
      expect(getLabelKey('Off-Topic')).toBe('music_offtopic');
      expect(getLabelKey('Music: Non-Music Section')).toBe('music_offtopic');
      expect(getLabelKey('Music: Off-Topic')).toBe('music_offtopic');
      expect(getLabelKey('Hook/Greetings')).toBe('hook');
      expect(getLabelKey('Hook')).toBe('hook');
      expect(getLabelKey('Chapter')).toBe('chapter');
      expect(getLabelKey('Content')).toBe('content');
      expect(getLabelKey('Main Content')).toBe('content');
      expect(getLabelKey('Content (Main Video)')).toBe('content');
    });

    it('should handle null/undefined with default', () => {
      expect(getLabelKey(null)).toBe('content');
      expect(getLabelKey(undefined)).toBe('content');
      expect(getLabelKey('')).toBe('content');
    });

    it('should handle unknown labels with fallback', () => {
      expect(getLabelKey('Unknown Label')).toBe('unknown_label');
      expect(getLabelKey('New Category')).toBe('new_category');
    });
  });

  describe('Label Name Mapping (getLabelName)', () => {
    it('should return full names for all categories', () => {
      expect(getLabelName('sponsor')).toBe('Sponsor');
      expect(getLabelName('selfpromo')).toBe('Self Promotion');
      expect(getLabelName('interaction')).toBe('Interaction Reminder');
      expect(getLabelName('intro')).toBe('Intro');
      expect(getLabelName('outro')).toBe('Outro');
      expect(getLabelName('preview')).toBe('Preview');
      expect(getLabelName('hook')).toBe('Hook');
      expect(getLabelName('music_offtopic')).toBe('Music: Off-Topic');
      expect(getLabelName('poi_highlight')).toBe('Highlight');
      expect(getLabelName('filler')).toBe('Filler');
      expect(getLabelName('exclusive_access')).toBe('Exclusive Access');
      expect(getLabelName('chapter')).toBe('Chapter');
      expect(getLabelName('content')).toBe('Content');
    });

    it('should return input for unknown categories', () => {
      expect(getLabelName('unknown')).toBe('unknown');
    });
  });

  describe('Label Color Mapping (getLabelColor)', () => {
    it('should return colors for all categories', () => {
      expect(getLabelColor('sponsor')).toBe('#00d26a');
      expect(getLabelColor('selfpromo')).toBe('#ffff00');
      expect(getLabelColor('interaction')).toBe('#a020f0');
      expect(getLabelColor('intro')).toBe('#00ffff');
      expect(getLabelColor('outro')).toBe('#0000ff');
      expect(getLabelColor('preview')).toBe('#00bfff');
      expect(getLabelColor('hook')).toBe('#4169e1');
      expect(getLabelColor('music_offtopic')).toBe('#ff9900');
      expect(getLabelColor('poi_highlight')).toBe('#ff0055');
      expect(getLabelColor('filler')).toBe('#9400d3');
      expect(getLabelColor('exclusive_access')).toBe('#008b45');
      expect(getLabelColor('chapter')).toBe('#1e90ff');
      expect(getLabelColor('content')).toBe('#999999');
    });

    it('should return default color for unknown categories', () => {
      expect(getLabelColor('unknown')).toBe('#999999');
    });
  });

  describe('Consistency Checks', () => {
    it('should have matching keys in LABEL_MAPPING and COLOR_MAPPING', () => {
      const lmKeys = Object.keys(LABEL_MAPPING);
      const cmKeys = Object.keys(COLOR_MAPPING);
      expect(lmKeys.sort()).toEqual(cmKeys.sort());
    });

    it('should have all 13 categories in both maps', () => {
      expect(Object.keys(LABEL_MAPPING).length).toBe(13);
      expect(Object.keys(COLOR_MAPPING).length).toBe(13);
    });

    it('should have unique colors', () => {
      const colors = Object.values(COLOR_MAPPING);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(colors.length);
    });
  });
});
