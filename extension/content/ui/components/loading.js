const gu = p => chrome.runtime.getURL(p);

);
export function showLoading(c, m) {
  try {
    if (!c) return;
    c.innerHTML = `<div class="yt-ai-loading"><div class="yt-ai-spinner"></div><div class="yt-ai-loading-text">${m}</div></div>`;
  } catch (err) {
    console.error('Err:showLoading', err);
  }
}
export function showError(c, m) {
  try {
    if (!c) return;
    c.innerHTML = `<div class="yt-ai-error"><div class="yt-ai-error-icon">❌</div><div class="yt-ai-error-msg">${m}</div><button class="yt-ai-btn" onclick="document.getElementById('yt-ai-refresh-btn')?.click()">Try Again</button></div>`;
  } catch (err) {
    console.error('Err:showError', err);
  }
}
export function showPlaceholder(c, m) {
  try {
    if (!c) return;
    c.innerHTML = `<div class="yt-ai-placeholder">${m}</div>`;
  } catch (err) {
    console.error('Err:showPlaceholder', err);
  }
}
