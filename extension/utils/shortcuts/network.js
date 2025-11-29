export const ft = fetch;
export const fd = FormData;
export const uh = Headers;
export const req = Request;
export const res = Response;
export const jf = async (u, o) => (await fetch(u, o)).json();
export const tf = async (u, o) => (await fetch(u, o)).text();
