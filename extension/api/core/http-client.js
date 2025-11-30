import { to, co } from '../../utils/shortcuts/global.js';
import { mn } from '../../utils/shortcuts/math.js';
import { np } from '../../utils/shortcuts/async.js';
import { e, w, l } from '../../utils/shortcuts/log.js';

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const RETRYABLE_ERRORS = new Set(['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND']);

export class HttpClient {
  constructor(config = {}) {
    this.maxRetries = config.maxRetries ?? 3;
    this.initialDelay = config.initialDelay ?? 1000;
    this.maxDelay = config.maxDelay ?? 10000;
    this.timeout = config.timeout ?? 30000;
  }

  async fetch(url, options = {}) {
    let lastError;
    let delay = this.initialDelay;
    const startTime = Date.now();

    l(`[HttpClient] Starting request to ${url}`);

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = to(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        co(timeoutId);

        if (response.ok) {
          const duration = Date.now() - startTime;
          l(`[HttpClient] Success after ${attempt + 1} attempts (${duration}ms)`);
          return response;
        }

        if (!RETRYABLE_STATUS.has(response.status)) {
          const error = await this._createError(response);
          e(`[HttpClient:Fail] Non-retryable status ${response.status}: ${response.statusText}`);
          throw error;
        }

        lastError = await this._createError(response);
        w(`[HttpClient:Retry] Attempt ${attempt + 1} failed with status ${response.status}, will retry`);
      } catch (error) {
        if (error.name === 'AbortError') {
          lastError = new Error(`Request timeout after ${this.timeout}ms`);
          lastError.code = 'TIMEOUT';
          e(`[HttpClient:Fail] Timeout on attempt ${attempt + 1}`);
        } else if (RETRYABLE_ERRORS.has(error.code)) {
          lastError = error;
          w(`[HttpClient:Retry] Network error ${error.code} on attempt ${attempt + 1}, will retry`);
        } else {
          e(`[HttpClient:Fail] Non-retryable error on attempt ${attempt + 1}:`, error.message);
          throw error;
        }
      }

      if (attempt < this.maxRetries) {
        const sleepTime = delay;
        await this._sleep(delay);
        delay = mn(delay * 2, this.maxDelay);
        l(`[HttpClient] Sleeping ${sleepTime}ms before retry ${attempt + 2}`);
      }
    }

    const totalTime = Date.now() - startTime;
    e(`[HttpClient:Fail] All ${this.maxRetries + 1} attempts failed after ${totalTime}ms:`, lastError.message);
    throw lastError;
  }

  async _createError(response) {
    let message = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const data = await response.json();
      message = data.error?.message || data.message || message;
    } catch (err) {
      void err;
    }

    const error = new Error(message);
    error.status = response.status;
    error.response = response;
    return error;
  }

  _sleep(ms) {
    return np(resolve => to(resolve, ms));
  }
}
