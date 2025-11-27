import { GeminiAPI } from './api.js'
import { ModelManager } from './models.js'
import { prompts } from './prompts.js'
export class GeminiService {
    constructor(k) { this.api = new GeminiAPI(k); this.models = new ModelManager(k, 'https://generativelanguage.googleapis.com/v1beta') }
    async fetchAvailableModels() { return this.models.fetch() }
    async generateSummary(t, p = 'Summarize the following video transcript.', m = null, o = {}) { const fp = prompts.summary(t, o); return this.generateContent(fp, m) }
    async chatWithVideo(q, c, m = null) { return this.generateContent(prompts.chat(q, c), m) }
    async analyzeCommentSentiment(c, m = null) { if (!c || !c.length) return 'No comments available to analyze.'; return this.generateContent(prompts.comments(c), m) }
    async generateFAQ(t, m = null) { return this.generateContent(prompts.faq(t), m) }
    async extractSegments(t, m = null) { try { const r = await this.generateContent(prompts.segments(t), m), c = r.replace(/```json/g, '').replace(/```/g, '').trim(); return JSON.parse(c) } catch (e) { return [] } }
    async generateComprehensiveAnalysis(t, o = {}) { try { const r = await this.generateContent(prompts.comprehensive(t, o)), c = r.replace(/```json/g, '').replace(/```/g, '').trim(); return JSON.parse(c) } catch (e) { const s = await this.generateSummary(t, undefined, null, o), f = await this.generateFAQ(t); return { summary: s, faq: f, insights: 'Insights generation failed.' } } }
    async generateContent(p, m = null) { let mt = []; if (m) mt = [m]; else { if (this.models.models.length === 0) { try { await this.models.fetch() } catch (e) { mt = ['gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-1.5-pro'] } } if (this.models.models.length > 0) mt = this.models.getList(); else if (mt.length === 0) mt = ['gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-1.5-pro'] } let le = null; for (const n of mt) { try { return await this.api.call(p, n) } catch (e) { le = e; await new Promise(r => setTimeout(r, 1000)) } } throw le || new Error('All models failed') }
}
