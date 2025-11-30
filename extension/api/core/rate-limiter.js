import { to } from '../../utils/shortcuts/global.js';
import { nw } from '../../utils/shortcuts/core.js';
import { np } from '../../utils/shortcuts/async.js';
import { w, l } from '../../utils/shortcuts/log.js';

export class RateLimiter {
  constructor(config = {}) {
    this.maxRequests = config.maxRequests ?? 15;
    this.windowMs = config.windowMs ?? 60000;
    this.queue = [];
    this.timestamps = [];
  }

  async acquire() {
    l(`[RateLimiter] Request queued, current queue: ${this.queue.length}`);
    return np(resolve => {
      this.queue.push(resolve);
      this._processQueue();
    });
  }

  _processQueue() {
    if (this.queue.length === 0) return;

    const now = nw();

    this.timestamps = this.timestamps.filter(ts => now - ts < this.windowMs);

    if (this.timestamps.length < this.maxRequests) {
      this.timestamps.push(now);
      const resolve = this.queue.shift();
      resolve();
      l(`[RateLimiter] Request processed, ${this.queue.length} remaining in queue`);

      if (this.queue.length > 0) {
        to(() => this._processQueue(), 0);
      }
    } else {
      const oldestTimestamp = this.timestamps[0];
      const waitTime = this.windowMs - (now - oldestTimestamp) + 100;
      w(`[RateLimiter] Rate limit reached, waiting ${waitTime}ms, queue: ${this.queue.length}`);

      to(() => this._processQueue(), waitTime);
    }
  }

  getStats() {
    const now = nw();
    const activeRequests = this.timestamps.filter(ts => now - ts < this.windowMs).length;

    return {
      activeRequests,
      maxRequests: this.maxRequests,
      queueLength: this.queue.length,
      available: this.maxRequests - activeRequests,
    };
  }
}
