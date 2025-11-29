export const ft = fetch;
export const Rq = Request;
export const Rs = Response;
export const Hd = Headers;
export const fd = FormData;
export const usp = URLSearchParams;

export const sf = fetch;
export const tf = fetch;
export const jf = async (...args) => {
    const r = await fetch(...args);
    return r.json();
};
