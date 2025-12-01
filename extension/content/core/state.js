export const state = {
  currentVideoId: null,
  isAnalyzing: false,
  analysisData: null,
  currentTranscript: [],
  settings: {
    autoAnalyze: true,
    autoSkipSponsors: false,
    autoSkipIntros: false,
    autoLike: false,
    autoLikeThreshold: 50,
    autoLikeLive: false,
    likeIfNotSubscribed: false,
  },
};
export function resetState() {
  try {
    state.isAnalyzing = false;
    state.analysisData = null;
    state.currentTranscript = [];
  } catch (err) {
    console.error('Err:resetState', err);
  }
}
export async function loadSettings() {
  try {
    const r = await chrome.storage.local.get([
      'autoAnalyze',
      'autoSkipSponsors',
      'autoSkipIntros',
      'autoLike',
      'autoLikeThreshold',
      'autoLikeLive',
      'likeIfNotSubscribed',
    ]);
    Object.assign(state.settings, r);

    return state.settings;
  } catch (err) {
    console.error('Err:loadSettings', err);
    return state.settings;
  }
}
