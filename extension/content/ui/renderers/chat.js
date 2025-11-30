import { gu } from '../../../utils/shortcuts/runtime.js';

const { e } = await import(gu('utils/shortcuts/log.js'));
const { parseMarkdown } = await import(gu('lib/marked-loader.js'));
const { ce, qs: $ } = await import(gu('utils/shortcuts/dom.js'));

function parseTime(t) {
  const p = t.split(':').map(Number);
  if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
  if (p.length === 2) return p[0] * 60 + p[1];
  return 0;
}

export function renderChat(c) {
  try {
    if (!$('.yt-ai-chat-messages', c)) {
      // Create chat container with glass styling
      const chatContainer = ce('div');
      chatContainer.className = 'yt-ai-chat-messages';
      chatContainer.id = 'yt-ai-chat-messages';
      chatContainer.style.display = 'flex';
      chatContainer.style.flexDirection = 'column';
      chatContainer.style.gap = '12px';
      chatContainer.style.padding = '16px';
      chatContainer.style.overflowY = 'auto';
      chatContainer.style.height = '100%';
      chatContainer.style.scrollBehavior = 'smooth';

      // Initial Welcome Message
      chatContainer.innerHTML = `
        <div class="yt-ai-chat-msg ai" style="animation: slideUpFade 0.4s var(--ease-fluid)">
          <div class="yt-ai-msg-content">👋 Hi! Ask me anything about this video.</div>
        </div>
      `;

      c.appendChild(chatContainer);

      // Event Delegation for Timestamps
      chatContainer.addEventListener('click', e => {
        if (e.target.classList.contains('timestamp-btn')) {
          const t = e.target.dataset.time;
          const s = parseTime(t);
          const v = $('video');
          if (v) {
            v.currentTime = s;
            v.play();
          }
        }
      });
    }
  } catch (err) {
    e('Err:renderChat', err);
  }
}

export async function addChatMessage(r, t) {
  try {
    const m = $('#yt-ai-chat-messages');
    if (!m) return;

    const d = ce('div');
    d.className = `yt-ai-chat-msg ${r}`;

    // Apply specific styles based on role (AI vs User)
    // These classes should be defined in styles.css, but we can add inline styles for immediate effect if needed
    // or rely on the new design system classes.
    // For now, we assume styles.css handles .yt-ai-chat-msg, .yt-ai-chat-msg.ai, .yt-ai-chat-msg.user

    // Animation
    d.style.animation = 'slideUpFade 0.4s var(--ease-fluid) backwards';

    const content = r === 'ai' ? await parseMarkdown(t) : t;

    d.innerHTML = `
      <div class="yt-ai-msg-content">${content}</div>
    `;

    m.appendChild(d);
    m.scrollTop = m.scrollHeight;
    return d;
  } catch (err) {
    e('Err:addChatMessage', err);
    return null;
  }
}
