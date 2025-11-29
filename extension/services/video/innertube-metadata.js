// InnerTube Metadata Fetcher
import { getVideoInfo } from '../../api/youtube-innertube.js';
import { log, err, ok } from '../../utils/yt.js';

export const fetchMetadata = async (videoId) => {
    try {
        log(`[Metadata] Fetching: ${videoId}`);

        const info = await getVideoInfo(videoId);
        const { basic_info, primary_info, secondary_info } = info;

        const metadata = {
            videoId,
            title: basic_info.title,
            description: basic_info.short_description,
            channel: basic_info.channel.name,
            channelId: basic_info.channel_id,
            duration: basic_info.duration,
            viewCount: basic_info.view_count,
            publishDate: primary_info?.published?.text || null,
            likes: primary_info?.menu?.top_level_buttons?.[0]?.like_button?.like_count || null,
            category: basic_info.category,
            keywords: basic_info.keywords || [],
            captionsAvailable: !!info.captions
        };

        ok(`[Metadata] Fetched: ${metadata.title}`);
        return metadata;

    } catch (e) {
        err('[Metadata] Fetch failed', e);
        throw e;
    }
};
