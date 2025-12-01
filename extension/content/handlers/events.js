const gu = p => chrome.runtime.getURL(p);

const { sendChatMessage } = await import(gu('content/handlers/chat.js'));

export function attachEventListeners(w) {
  try {
    const c = w.querySelector('#yt-ai-chat-send');
    if (c)
      c?.addEventListener('click', () => {
        sendChatMessage();
      });
    const i = w.querySelector('#yt-ai-chat-input');
    if (i)
      i?.addEventListener('keypress', e => {
        if (e.key === 'Enter') sendChatMessage();
      });
  } catch (err) {
    console.error('Err:attachEventListeners', err);
  }
}
