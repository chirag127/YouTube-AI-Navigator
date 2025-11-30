export const isa = Array.isArray;
export const af = Array.from;
export const aof = Array.of;
export const am = (a, f) => a.map(f);
export const afl = (a, f) => a.filter(f);
export const ard = (a, f, i) => a.reduce(f, i);
export const afe = (a, f) => a.forEach(f);
export const afn = (a, f) => a.find(f);
export const afi = (a, f) => a.findIndex(f);
export const asm = (a, f) => a.some(f);
export const aev = (a, f) => a.every(f);
export const ainc = (a, v) => a.includes(v);
export const asl = (a, b, e) => a.slice(b, e);
export const asp = (a, b, e) => a.splice(b, e);
export const ajn = (a, s) => a.join(s);
export const acn = (a, ...v) => a.concat(...v);
export const arv = a => a.reverse();
export const ast = (a, f) => a.sort(f);
export const aflt = (a, d) => a.flat(d);
export const afm = (a, f) => a.flatMap(f);

export const aia = (a, v) => a?.indexOf(v);
export const aus = a => [...new Set(a)];
export const aic = (a, v) => a?.includes(v);




