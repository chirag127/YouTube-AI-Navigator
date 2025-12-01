
export async function handleGetMetadata(req, rsp) {
  try {
    const { videoId } = req;
    console.warn('[Background] GET_METADATA called - this should be handled by content script');
    rsp({
      success: true,
      data: { title: 'YouTube Video', author: 'Unknown Channel', viewCount: 'Unknown', videoId },
    });
  } catch (x) {
    console.error('GetMetadata:', x);
    rsp({ success: false, error: x.message });
  }
}
