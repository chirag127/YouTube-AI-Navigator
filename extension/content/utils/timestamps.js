const gu = p => chrome.runtime.getURL(p);

const { seekVideo } = await import(gu('content/utils/dom.js'));

export function makeTimestampsClickable(c) {
  try {
    const p = /(\[|[(])?(\d{1,2}):(\d{2})(\]|[)])?/g;
    const w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = w.nextNode())) if (p.test(node?.textContent)) nodes.push(node);

    nodes.forEach(t => {
      const text = t?.textContent;
      const f = document.createDocumentFragment();
      let last = 0;
      text.replace(p, (m, p1, mins, secs, p4, o) => {
        if (o > last) f?.appendChild(document.createTextNode(text.substring(last, o)));
        const s = parseInt(mins) * 60 + parseInt(secs);
        const btn = document.createElement('button');
        btn.className = 'timestamp-btn';
        btn.textContent = m;
        btn.dataset.time = s;
        btn.addEventListener('click', () => seekVideo(s));
        f.appendChild(btn);
        last = o + m.length;
      });
      if (last < text.length) f?.appendChild(document.createTextNode(text.substring(last)));
      t.parentNode.replaceChild(f, t);
    });
  } catch (err) {
    console.error('Err:makeTimestampsClickable', err);
  }
}
