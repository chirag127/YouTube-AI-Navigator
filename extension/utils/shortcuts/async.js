// Promise utilities
export const pr = Promise.resolve.bind(Promise);
export const pj = Promise.reject.bind(Promise);
export const pa = Promise.all.bind(Promise);
export const prc = Promise.race.bind(Promise); // renamed from ra to avoid confusion
export const np = f => new Promise(f);
export const pto = (p, t) => // renamed from to to avoid conflict with core.js
  new Promise((r, j) => {
    setTimeout(() => j(new Error('TO')), t);
    p.then(r).catch(j);
  });
