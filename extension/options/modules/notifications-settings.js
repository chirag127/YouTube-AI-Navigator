

export class NotificationsSettings {
  constructor(s, a) {
    this.s = s;
    this.a = a;
  }
  init() {
    const n = this.s.get().notifications || {};
    this.chk('section-notificationsEnabled', n.enabled ?? true);
    this.set('section-notificationPosition', n.position || 'top-right');
    this.set('section-notificationDuration', n.duration || 3000);
    this.chk('section-notificationSound', n.sound ?? false);
    this.chk('notifyOnSave', n.showOnSave ?? true);
    this.chk('notifyOnError', n.showOnError ?? true);
    this.chk('notifyOnProgress', n.showProgress ?? true);
    this.chk('notifyOnComplete', n.showOnComplete ?? true);
    this.chk('notifyOnSegmentSkip', n.showOnSegmentSkip ?? true);
    this.a.attachToAll({
      'section-notificationsEnabled': { path: 'notifications.enabled' },
      'section-notificationPosition': { path: 'notifications.position' },
      'section-notificationDuration': { path: 'notifications.duration', transform: v => parseInt(v) },
      'section-notificationSound': { path: 'notifications.sound' },
      notifyOnSave: { path: 'notifications.showOnSave' },
      notifyOnError: { path: 'notifications.showOnError' },
      notifyOnProgress: { path: 'notifications.showProgress' },
      notifyOnComplete: { path: 'notifications.showOnComplete' },
      notifyOnSegmentSkip: { path: 'notifications.showOnSegmentSkip' },
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
