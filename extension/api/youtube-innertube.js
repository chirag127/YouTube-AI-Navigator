// YouTube.js InnerTube API Wrapper - Primary Strategy
import { Innertube } from '../lib/youtubei.js';
import { log, err, ok, cached } from '../utils/yt.js';

let instance = null;

export const getClient = async () => {
    if (instance) return instance;

    const c = cached('innertube-client', 3600000);
    const existing = c.get();
    if (existing) {
        instance = existing;
        return instance;
    }

    try {
        log('Initializing InnerTube client...');
        instance = await Innertube.create();
        c.set(instance);
        ok('InnerTube client ready');
        return instance;
    } catch (e) {
        err('Failed to create InnerTube client', e);
        throw e;
    }
};

export const getVideoInfo = async (videoId) => {
    const client = await getClient();
    return await client.getInfo(videoId);
};

export const getComments = async (videoId) => {
    const client = await getClient();
    return await client.getComments(videoId);
};
