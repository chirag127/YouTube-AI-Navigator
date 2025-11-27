import { saveTranscript, getTranscript, deleteTranscript } from './transcript.js'
import { getHistory, updateHistory, deleteFromHistory, searchHistory } from './history.js'
export class StorageService {
    constructor() { this.storage = chrome.storage.local }
    async saveTranscript(v, m, t, s) { const d = await saveTranscript(v, m, t, s); await updateHistory(v, m); return d }
    async getTranscript(v) { return getTranscript(v) }
    async getHistory() { return getHistory() }
    async searchHistory(q) { return searchHistory(q) }
    async deleteVideo(v) { await deleteTranscript(v); await deleteFromHistory(v) }
}
