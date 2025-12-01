export function createTranscriptDisplay(s) {
  try {
    const c = document.createElement('div');
    c.className = 'ytai-transcript-display';
    for (const seg of s) c.appendChild(createTranscriptLine(seg));

    return c;
  } catch (err) {
    console.error('Err:createTranscriptDisplay', err);
    const fallback = document.createElement('div');
    fallback.className = 'ytai-transcript-display';
    return fallback;
  }
}

function createTranscriptLine(s) {
  try {
    const line = document.createElement('div');
    line.className = 'ytai-transcript-line';
    line.dataset.start = s.start;
    line.dataset.duration = s.duration;
    const ts = document.createElement('span');
    ts.className = 'ytai-transcript-timestamp';
    ts.textContent = formatTimestamp(s.start);
    const tx = document.createElement('span');
    tx.className = 'ytai-transcript-text';
    tx.textContent = s.text;
    line.appendChild(ts);
    line.appendChild(tx);

    return line;
  } catch (err) {
    console.error('Err:createTranscriptLine', err);
    const fallback = document.createElement('div');
    fallback.className = 'ytai-transcript-line';
    return fallback;
  }
}

function formatTimestamp(s) {
  try {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const result = `${m}:${sec.toString().padStart(2, '0')}`;

    return result;
  } catch (err) {
    console.error('Err:formatTimestamp', err);
    return '0:00';
  }
}
