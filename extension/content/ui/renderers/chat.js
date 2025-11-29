import { parseMarkdown } from '../../../lib/marked-loader.js';
import { id as ge, ce, $ } from '../../utils/shortcuts/dom.js';

export function renderChat(c) {
  if (!$('.yt-ai-chat-messages', c)) {
    c.innerHTML = `<div class="yt-ai-chat-messages" id="yt-ai-chat-messages"><div class="yt-ai-chat-msg ai">👋 Hi! Ask me anything about this video.</div></div>`;
  }
}
export async function addChatMessage(r, t) {
  const m = ge('yt-ai-chat-messages');
  if (!m) return;
  const d = ce('div');
  d.className = `yt-ai-chat-msg ${r}`;
  d.innerHTML = r === 'ai' ? await parseMarkdown(t) : t;
  m.appendChild(d);
  m.scrollTop = m.scrollHeight;
  return d;
}
