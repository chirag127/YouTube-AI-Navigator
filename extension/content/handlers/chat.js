const gu = p => chrome.runtime.getURL(p);

const { state } = await import(gu('content/core/state.js'));
const { addChatMessage } = await import(gu('content/ui/renderers/chat.js'));
const { parseMarkdown } = await import(gu('lib/marked-loader.js'));

export async function sendChatMessage() {
  try {
    const i = (document).querySelector('#yt-ai-chat-input');
    const q = i?.value?.trim();
    if (!q) return;
    await addChatMessage('user', q);
    i.value = '';
    const el = await addChatMessage('ai', 'Thinking...');
    try {
      const ctx = state.currentTranscript.map(t => t.text).join(' ');
      const md = null;
      const r = await chrome.runtime.sendMessage({ action: 'CHAT_WITH_VIDEO', question: q, context: ctx, metadata: md });
      el.innerHTML = r.success
        ? await parseMarkdown(r.answer || 'Sorry, I could not answer that.')
        : `Error: ${r.error}`;
    } catch (x) {
      el.textContent = `Error: ${x.message}`;
      console.error('Err:sendChatMessage', x);
    }
  } catch (err) {
    console.error('Err:sendChatMessage', err);
  }
}
