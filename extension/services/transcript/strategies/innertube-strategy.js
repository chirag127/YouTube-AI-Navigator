// InnerTube Transcript Strategy - Priority 1
import { getVideoInfo } from '../../../api/youtube-innertube.js';
import { log, err, ok } from '../../../utils/yt.js';

export const strategy = {
    name: 'InnerTube API',
    priority: 0,

    async fetch(videoId, lang = 'en') {
        try {
            log(`[InnerTube] Fetching transcript: ${videoId} (${lang})`);

            const info = await getVideoInfo(videoId);

            if (!info.captions) {
                throw new Error('No captions available');
            }

            const transcriptInfo = await info.getTranscript();

            if (lang !== 'en' && transcriptInfo.languages?.includes(lang)) {
                const localized = await transcriptInfo.selectLanguage(lang);
                const localizedSegs = localized.transcript?.content?.body?.initial_segments ||
                    localized.transcript?.content?.initial_segments || [];
                return formatSegments(localizedSegs);
            }

            const segments = formatSegments(
                transcriptInfo.transcript?.content?.body?.initial_segments ||
                transcriptInfo.transcript?.content?.initial_segments || []
            );
            ok(`[InnerTube] ${segments.length} segments fetched`);
            return segments;

        } catch (e) {
            err('[InnerTube] Transcript fetch failed', e);
            throw e;
        }
    }
};

const formatSegments = (raw) => {
    if (!raw || !Array.isArray(raw)) return [];
    return raw.map(s => ({
        start: (s.start_ms || s.startMs || 0) / 1000,
        duration: ((s.end_ms || s.endMs || s.start_ms || s.startMs || 0) - (s.start_ms || s.startMs || 0)) / 1000,
        text: s.snippet?.text || s.text || ''
    })).filter(s => s.text);
};
