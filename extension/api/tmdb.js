import { safeFetch, cl } from "../utils/shortcuts.js";

const BASE_URL = "https://api.themoviedb.org/3";

export class TmdbAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async searchMovie(query) {
        if (!this.apiKey) return null;
        cl(`[TMDB] Searching: ${query}`);
        const data = await safeFetch(
            `${BASE_URL}/search/movie?api_key=${
                this.apiKey
            }&query=${encodeURIComponent(query)}`
        );
        return data?.results?.[0] || null;
    }

    async searchTV(query) {
        if (!this.apiKey) return null;
        cl(`[TMDB] Searching TV: ${query}`);
        const data = await safeFetch(
            `${BASE_URL}/search/tv?api_key=${
                this.apiKey
            }&query=${encodeURIComponent(query)}`
        );
        return data?.results?.[0] || null;
    }

    async getDetails(id, type = "movie") {
        if (!this.apiKey || !id) return null;
        return await safeFetch(
            `${BASE_URL}/${type}/${id}?api_key=${this.apiKey}&append_to_response=credits,similar`
        );
    }
}
