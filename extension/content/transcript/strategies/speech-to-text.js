export const name = 'Speech to Text';
export const priority = 30;

export const extract = async (vid, lang = 'en') => {
  try {
    const u = await getAudioUrl();
    if (!u) throw new Error('No audio URL found');
    const r = await chrome.runtime.sendMessage({ action: 'TRANSCRIBE_AUDIO', audioUrl: u, lang });
    if (r?.success && r.segments) {
      return r.segments;
    }
    throw new Error(r?.error || 'STT failed');
  } catch (err) {
    console.error('Err:extract', err);
    throw err;
  }
};

const getAudioUrl = async (retries = 3, delay = 1000) => {
  try {
    for (let i = 0; i < retries; i++) {
      try {
        const pr = window.ytInitialPlayerResponse;
        if (!pr?.streamingData?.adaptiveFormats) {
          if (i < retries - 1) {
            await new Promise(r => setTimeout(r, delay));
            continue;
          }
          return null;
        }
        const f = pr.streamingData.adaptiveFormats;
        let af = f.find(x => x.mimeType.includes('audio/mp4'));
        if (!af) af = f.find(x => x.mimeType.includes('audio/webm'));
        if (!af) af = f.find(x => x.mimeType.includes('audio'));
        return af?.url || null;
      } catch (err) {
        if (i < retries - 1) await new Promise(r => setTimeout(r, delay));
      }
    }
    return null;
  } catch (err) {
    console.error('Err:getAudioUrl', err);
    return null;
  }
};
