



const BASE_URL = 'https://openlibrary.org';

export class OpenLibraryAPI {
  async searchBook(query) {
    const cfg = await chrome.storage.sync.get('integrations');
    if (cfg.integrations?.openlibrary?.enabled === false) return null;

    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data?.docs?.[0] || null;
  }

  async getWork(key) {
    if (!key) return null;
    return await safeFetch(`${BASE_URL}${key}.json`);
  }
}
