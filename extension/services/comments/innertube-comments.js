// InnerTube Comments Fetcher
import { getComments } from '../../api/youtube-innertube.js';
import { log, err, ok } from '../../utils/yt.js';

export const fetchComments = async (videoId, limit = 20) => {
    try {
        log(`[Comments] Fetching: ${videoId} (limit: ${limit})`);

        const comments = await getComments(videoId);
        const items = [];

        for await (const comment of comments) {
            if (items.length >= limit) break;

            items.push({
                author: comment.author.name,
                text: comment.content.text,
                likes: comment.vote_count,
                published: comment.published.text,
                isCreator: comment.author.is_creator,
                replyCount: comment.reply_count
            });
        }

        ok(`[Comments] Fetched ${items.length} comments`);
        return items;

    } catch (e) {
        err('[Comments] Fetch failed', e);
        throw e;
    }
};
