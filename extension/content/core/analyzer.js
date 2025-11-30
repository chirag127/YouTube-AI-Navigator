const gu = p => chrome.runtime.getURL(p);

const { startAnalysis } = await import(gu('content/features/analysis/index.js'));
export { startAnalysis };




