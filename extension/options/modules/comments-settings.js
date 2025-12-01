

export class CommentsSettings {
  constructor(s, a) {
    this.s = s;
    this.a = a;
  }
  init() {
    const c = this.s.get().comments || {};
    this.chk('commentsEnabled', c.enabled ?? true);
    this.set('commentsLimit', c.limit || 20);
    this.set('commentsMaxReplies', c.maxReplies || 3);
    this.chk('includeReplies', c.includeReplies ?? true);
    this.set('commentsSortBy', c.sortBy || 'top');
    this.chk('commentsAutoSummarize', c.autoSummarize ?? true);
    this.chk('analyzeSentiment', c.analyzeSentiment ?? true);
    this.chk('filterSpam', c.filterSpam ?? true);
    this.chk('showAuthorBadges', c.showAuthorBadges ?? true);
    this.chk('highlightPinned', c.highlightPinned ?? true);
    this.a.attachToAll({
      commentsEnabled: { path: 'comments.enabled' },
      commentsLimit: { path: 'comments.limit', transform: v => parseInt(v) },
      commentsMaxReplies: { path: 'comments.maxReplies', transform: v => parseInt(v) },
      includeReplies: { path: 'comments.includeReplies' },
      commentsSortBy: { path: 'comments.sortBy' },
      commentsAutoSummarize: { path: 'comments.autoSummarize' },
      analyzeSentiment: { path: 'comments.analyzeSentiment' },
      filterSpam: { path: 'comments.filterSpam' },
      showAuthorBadges: { path: 'comments.showAuthorBadges' },
      highlightPinned: { path: 'comments.highlightPinned' },
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
}
