


export async function handleGetVideoInfo({ videoId }) {
  try {
    const u = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const r = await fetch(u);
    if (!r.ok) throw new Error('Failed to fetch oEmbed');
    const d = await r.json();
    return {
      success: true,
      metadata: {
        title: d.title,
        author: d.author_name,
        videoId,
        viewCount: 'Unknown', // oEmbed doesn't provide view count
        lengthSeconds: 0, // oEmbed doesn't provide length
      },
    };
  } catch (x) {
    console.error('[VideoInfo] Error:', x);
    return { success: false, error: x.message };
  }
}
