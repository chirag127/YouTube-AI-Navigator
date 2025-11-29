// Console logging utilities
export const l = console.log.bind(console);
export const e = console.error.bind(console);
export const w = console.warn.bind(console);
export const i = console.info.bind(console);
export const dbg = console.debug.bind(console); // renamed from d to avoid conflict with document
export const trc = console.trace.bind(console); // renamed from tr to avoid conflict with string.trim
export const clr = console.clear.bind(console);
export const tm = console.time.bind(console);
export const tme = console.timeEnd.bind(console);
