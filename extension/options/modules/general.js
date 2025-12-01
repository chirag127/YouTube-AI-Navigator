


export class GeneralSettings {
  constructor(s, a) {
    this.s = s;
    this.a = a;
    this.dragSrc = null;
  }
  init() {
    const c = this.s.get();
    this.set('outputLanguage', c.ai?.outputLanguage || 'en');
    this.chk('autoAnalyze', c.automation?.autoAnalyze ?? true);
    this.chk('autoSummarize', c.automation?.autoSummarize ?? true);
    this.chk('autoExtractKeyPoints', c.automation?.autoExtractKeyPoints ?? true);
    this.chk('autoDetectLanguage', c.automation?.autoDetectLanguage ?? true);
    this.chk('autoLoadTranscript', c.automation?.autoLoadTranscript ?? true);
    this.chk('saveHistory', c.advanced?.saveHistory ?? true);
    this.chk('autoLike', c.automation?.autoLike ?? false);
    this.chk('autoThumbsUp', c.automation?.autoThumbsUp ?? false);
    this.chk('autoNext', c.automation?.autoNext ?? false);
    this.chk('autoLoop', c.automation?.autoLoop ?? false);
    this.renderStrategies(
      c.transcript?.strategyOrder || ['dom-automation', 'genius', 'speech-to-text']
    );
    this.a.attachToAll({
      outputLanguage: { path: 'ai.outputLanguage' },
      autoAnalyze: { path: 'automation.autoAnalyze' },
      autoSummarize: { path: 'automation.autoSummarize' },
      autoExtractKeyPoints: { path: 'automation.autoExtractKeyPoints' },
      autoDetectLanguage: { path: 'automation.autoDetectLanguage' },
      autoLoadTranscript: { path: 'automation.autoLoadTranscript' },
      autoLike: { path: 'automation.autoLike' },
      autoThumbsUp: { path: 'automation.autoThumbsUp' },
      autoNext: { path: 'automation.autoNext' },
      autoLoop: { path: 'automation.autoLoop' },
      autoExpandDescription: { path: 'ui.autoExpandDescription' },
      showTimestamp: { path: 'ui.showTimestamp' },
      smoothScroll: { path: 'ui.smoothScroll' },
      keyboardShortcuts: { path: 'ui.keyboardShortcuts' },
      theme: { path: 'ui.theme' },
      saveHistory: { path: 'advanced.saveHistory' },
    });
    const ch = (document).querySelector('#clearHistory');
    if (ch)
      (ch)?.addEventListener('click', async () => {
        if (confirm('Clear all history? This cannot be undone.')) {
          await slr('comprehensive_history');
          this.a.notifications?.success('History cleared');
        }
      });
  }
  set(id, v) {
    const el = (document).querySelector(`#${id}`);
    if (el) el.value = v;
  }
  chk(id, v) {
    const el = (document).querySelector(`#${id}`);
    if (el) el.checked = v;
  }
  renderStrategies(order) {
    const list = (document).querySelector('#strategyList');
    if (!list) return;
    list.innerHTML = '';
    const names = {
      'dom-automation': 'DOM Automation',
      genius: 'Genius Lyrics',
      'speech-to-text': 'Speech to Text',
    };
    order.forEach(key => {
      if (!names[key]) return;
      const li = document.createElement('li');
      li.className = 'sortable-item';
      li.draggable = true;
      li.dataset.key = key;
      li.innerHTML = `<span class="drag-handle">☰</span> <span>${names[key]}</span>`;
      this.addDnD(li);
      list.appendChild(li);
    });
  }
  addDnD(el) {
    (el)?.addEventListener('dragstart', e => {
      this.dragSrc = el;
      (el)?.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    (el)?.addEventListener('dragend', () => {
      this.dragSrc = null;
      (el)?.classList.remove('dragging');
      this.saveOrder();
    });
    (el)?.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      return false;
    });
    (el)?.addEventListener('dragenter', () => {
      if (this.dragSrc !== el) (el)?.classList.add('over');
    });
    (el)?.addEventListener('dragleave', () => {
      (el)?.classList.remove('over');
    });
    (el)?.addEventListener('drop', e => {
      e.stopPropagation();
      if (this.dragSrc !== el) {
        const list = (document).querySelector('#strategyList');
        const items = [...$$('.sortable-item', list)];
        const srcIdx = items.indexOf(this.dragSrc);
        const tgtIdx = items.indexOf(el);
        if (srcIdx < tgtIdx) el.after(this.dragSrc);
        else el.before(this.dragSrc);
      }
      return false;
    });
  }
  async saveOrder() {
    const list = (document).querySelector('#strategyList');
    const order = [...$$('.sortable-item', list)].map(el => el.dataset.key);
    await this.s.update('transcript.strategyOrder', order);
  }
}
