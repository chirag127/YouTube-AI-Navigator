const BASE_URL = 'https://api.themoviedb.org/3';

export class TmdbAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async searchMovie(query) {
    if (!this.apiKey) return null;
    try {
      const response = await fetch(
        `${BASE_URL}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      return data?.results?.[0] || null;
    } catch (x) {
      import('../utils/shortcuts/log.js').then(({ e }) => e('[TMDB] searchMovie fail:', x.message));
      return null;
    }
  }

  async searchTV(query) {
    if (!this.apiKey) return null;
    try {
      const response = await fetch(
        `${BASE_URL}/search/tv?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      return data?.results?.[0] || null;
    } catch (x) {
      import('../utils/shortcuts/log.js').then(({ e }) => e('[TMDB] searchTV fail:', x.message));
      return null;
    }
  }

  async getDetails(id, type = 'movie') {
    if (!this.apiKey || !id) return null;
    try {
      const response = await fetch(
        `${BASE_URL}/${type}/${id}?api_key=${this.apiKey}&append_to_response=credits,similar`
      );
      return await response.json();
    } catch (x) {
      import('../utils/shortcuts/log.js').then(({ e }) => e('[TMDB] getDetails fail:', x.message));
      return null;
    }
  }
}
