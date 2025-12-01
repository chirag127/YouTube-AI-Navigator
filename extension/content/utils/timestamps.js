const gu = p => chrome.runtime.getURL(p);

);
const { seekVideo } = await import(gu('content/utils/dom.js'));
);
);
);
export function makeTimestampsClickable(c) {
  try {
    const p = /(\[|[(])?(\d{1,2}):(\d{2})(\]|[)])?/g,
      w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT),
      nodes = [];
    let node;
    while ((node = w.nextNode())) if (p.test((node)?.textContent)) nodes.push(node);
    fc(nodes, t => {
      const text = (t)?.textContent,
        f = document.createDocumentFragment();
      let last = 0;
      text.replace(p, (m, p1, mins, secs, p4, o) => {
        if (o > last) (f)?.appendChild(tx(sbs(text, last, o)));
        const s = parseInt(mins) * 60 + parseInt(secs));
      if (last < text.length) (f)?.appendChild(tx(sbs(text, last)));
      t.parentNode.replaceChild(f, t);
    });
  } catch (err) {
    console.error('Err:makeTimestampsClickable', err);
  }
}
