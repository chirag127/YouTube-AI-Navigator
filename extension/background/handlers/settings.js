import { sg as ssg } from '../../utils/shortcuts/storage.js';
export async function handleGetSettings(rsp) {
  const s = await ssg([
    'apiKey',
    'model',
    'summaryLength',
    'outputLanguage',
    'customPrompt',
    'enableSegments',
    'autoSkipSponsors',
    'autoSkipIntros',
    'saveHistory',
  ]);
  rsp({ success: true, data: s });
}
