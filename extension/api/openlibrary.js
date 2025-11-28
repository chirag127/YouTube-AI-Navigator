import { safeFetch, cl } from "../utils/shortcuts.js";

const BASE_URL = "https://openlibrary.org";

export class OpenLibraryAPI {
    async searchBook(query) {
        cl(`[OpenLibrary] Searching: ${query}`);
        const data = await safeFetch(
            `${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=1`
        );
        return data?.docs?.[0] || null;
    }

    async getWork(key) {
        if (!key) return null;
        return await safeFetch(`${BASE_URL}${key}.json`);
    }
}
