


const BASE_URL = 'https://api.datamuse.com';

export class DatamuseAPI {
  async getRelatedWords(word) {
    try {
      const data = await safeFetch(`${BASE_URL}/words?ml=${encodeURIComponent(word)}&max=5`);
      return data || [];
    } catch (x) {
      import('../utils/shortcuts/log.js').then(({ e }) =>
        e('[Datamuse] getRelatedWords fail:', x.message)
      );
      return [];
    }
  }
}
