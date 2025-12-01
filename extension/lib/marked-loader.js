

export async function parseMarkdown(m) {
  if (!m) return '';

  let h = m;
  h = h.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  h = h.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  h = h.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/__(.+?)__/g, '<strong>$1</strong>');
  h = h.replace(/\*(.+?)\*/g, '<em>$1</em>');
  h = h.replace(/_(.+?)_/g, '<em>$1</em>');
  h = h.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
  h = h.replace(/\[([^\]]+)\]\(([^)]+)\, undefined)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  h = h.replace(/\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g, '<button class="timestamp-btn" data-time="$1">$1</button>');
  h = h.replace(/^\* (.+)$/gim, '<li>$1</li>');
  h = h.replace(/^- (.+)$/gim, '<li>$1</li>');
  h = h.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  h = h.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');
  h = h.replace(/\n\n/g, '</p><p>');
  h = h.replace(/\n/g, '<br>');
  if (!sws(h, '<')) h = `<p>${h}</p>`;
  return h;
}
export async function loadMarked() {
  return { parse: md => parseMarkdown(md) };
}
