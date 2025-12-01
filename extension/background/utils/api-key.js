export async function getApiKey() {
  try {
    const result = await chrome.storage.local.get('GAK');

    return result.GAK || null;
  } catch (err) {
    console.error('Err:GetApiKey', err);
    return null;
  }
}
