export const U = URL;
export const USP = URLSearchParams;
export const uo = u => new URL(u);
export const usp = s => new URLSearchParams(s);
export const urev = u => URL.revokeObjectURL(u);
export const uobj = o => URL.createObjectURL(o);
