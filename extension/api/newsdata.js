import { safeFetch, cl } from "../utils/shortcuts.js";

const BASE_URL = "https://newsdata.io/api/1";

export class NewsDataAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async searchNews(query, language = "en") {
        if (!this.apiKey) return null;
        cl(`[NewsData] Searching: ${query}`);
        // Free tier is limited, so we fetch minimal data
        const data = await safeFetch(
            `${BASE_URL}/news?apikey=${this.apiKey}&q=${encodeURIComponent(
                query
            )}&language=${language}`
        );
        return data?.results || [];
    }
}
