const BASE_URL = 'https://api.semanticscholar.org/graph/v1';

export class SemanticScholarAPI {
  async searchPaper(query) {
    try {
      const response = await fetch(
        `${BASE_URL}/paper/search?query=${encodeURIComponent(query)}&limit=1&fields=title,authors,year,abstract`
      );
      const data = await response.json();
      return data?.data?.[0] || null;
    } catch (x) {
      import('../utils/shortcuts/log.js').then(({ e }) =>
        e('[SemanticScholar] searchPaper fail:', x.message)
      );
      return null;
    }
  }
}
