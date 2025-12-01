import { DatamuseAPI } from '../../extension/api/datamuse.js';

vi.mock('../../extension/utils/shortcuts/global.js', () => ({
  encodeURIComponent: vi.fn(word => encodeURIComponent(word)),
}));

vi.mock('../../extension/utils/shortcuts/network.js', () => ({
  sf: vi.fn(),
}));

vi.mock('../../extension/utils/shortcuts/log.js', () => ({
  e: vi.fn(),
}));

describe('DatamuseAPI', () => {
  let api;

  beforeEach(() => {
    api = new DatamuseAPI();
    vi.clearAllMocks();
  });

  describe('getRelatedWords', () => {
    it('should return related words on success', async () => {

      sf.mockResolvedValue([{ word: 'test' }]);

      const result = await api.getRelatedWords('test');

      expect(sf).toHaveBeenCalledWith('https://api.datamuse.com/words?ml=test&max=5');
      expect(result).toEqual([{ word: 'test' }]);
    });

    it('should return empty array on network failure', async () => {

      sf.mockRejectedValue(new Error('Network error'));

      const result = await api.getRelatedWords('test');

      expect(result).toEqual([]);
    });

    it('should return empty array when safeFetch returns null', async () => {

      sf.mockResolvedValue(null);

      const result = await api.getRelatedWords('test');

      expect(result).toEqual([]);
    });

    it('should encode the word parameter', async () => {


      sf.mockResolvedValue([]);

      await api.getRelatedWords('test word');

      expect(encodeURIComponent).toHaveBeenCalledWith('test word');
    });
  });
});
