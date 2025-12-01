

export async function handleGetSettings(rsp) {
  try {
    const s = await chrome.storage.sync.get('config');
    rsp({ success: true, data: s.config || {} });
  } catch (x) {
    console.error('GetSettings:', x);
    rsp({ success: false, error: x.message });
  }
}
