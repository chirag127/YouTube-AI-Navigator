import { safeFetch, cl } from "../utils/shortcuts.js";

const BASE_URL = "https://www.wikidata.org/w/api.php";

export class WikidataAPI {
    async searchEntity(query) {
        cl(`[Wikidata] Searching: ${query}`);
        const url = `${BASE_URL}?action=wbsearchentities&search=${encodeURIComponent(
            query
        )}&language=en&format=json&origin=*`;
        const data = await safeFetch(url);
        return data?.search?.[0] || null;
    }

    async getEntityDetails(id) {
        if (!id) return null;
        const url = `${BASE_URL}?action=wbgetentities&ids=${id}&format=json&origin=*`;
        const data = await safeFetch(url);
        return data?.entities?.[id] || null;
    }
}
