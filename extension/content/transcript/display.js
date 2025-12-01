const gu = p => chrome.runtime.getURL(p);

);
);
export function createTranscriptDisplay(s) {
  try {
    const c = (()=>{const e=document.createElement('div');e.className='ytai-transcript-display';return e;})();
    for (const seg of s) c.appendChild(createTranscriptLine(seg));

    return c;
  } catch (err) {
    console.error('Err:createTranscriptDisplay', err);
    return (()=>{const e=document.createElement('div');e.className='ytai-transcript-display';return e;})();
  }
}

function createTranscriptLine(s) {
  try {
    const line = (()=>{const e=document.createElement('div');e.className='ytai-transcript-line';return e;})();
    line.dataset.start = s.start;
    line.dataset.duration = s.duration;
    const ts = (()=>{const e=document.createElement('span');e.className='ytai-transcript-timestamp';return e;})();
    ts.textContent = formatTimestamp(s.start);
    const tx = (()=>{const e=document.createElement('span');e.className='ytai-transcript-text';return e;})();
    tx.textContent = s.text;
    line.appendChild(ts);
    line.appendChild(tx);

    return line;
  } catch (err) {
    console.error('Err:createTranscriptLine', err);
    return (()=>{const e=document.createElement('div');e.className='ytai-transcript-line';return e;})();
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
