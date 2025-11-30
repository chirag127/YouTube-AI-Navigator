import { vi } from 'vitest';

global.chrome = {
  runtime: {
    getURL: vi.fn(path => `/extension/${path}`),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    sendMessage: vi.fn(),
  },
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
    sync: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn(),
    create: vi.fn(),
  },
  windows: {
    create: vi.fn(),
  },
};

// Mock all shortcuts
vi.mock('../../../extension/utils/shortcuts/global.js', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    wn: global.chrome.windows,
    loc: { hostname: 'www.youtube.com', search: '?v=test123' },
    to: vi.fn(),
    co: vi.fn(),
    rAF: vi.fn(cb => cb()),
    pi: vi.fn(n => parseInt(n)),
    pf: vi.fn(n => parseFloat(n)),
    cf: vi.fn(() => false),
    al: vi.fn(),
    pm: vi.fn(() => null),
    en: vi.fn(s => encodeURIComponent(s)),
    de: vi.fn(s => decodeURIComponent(s)),
    si: vi.fn(),
    ci: vi.fn(),
    clt: vi.fn(),
    pI: vi.fn(n => parseInt(n)),
  };
});

vi.mock('../../../extension/utils/shortcuts/async.js', () => ({
  raf: vi.fn(cb => cb()),
}));

vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
  qs: vi.fn(),
  ce: vi.fn(),
  el: vi.fn(),
  ap: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
  e: vi.fn(),
  w: vi.fn(),
  l: vi.fn(),
  i: vi.fn(),
  db: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/core.js', () => ({
  isA: vi.fn(() => true),
  isO: vi.fn(obj => typeof obj === 'object' && obj !== null),
  isF: vi.fn(obj => typeof obj === 'function'),
  isS: vi.fn(obj => typeof obj === 'string'),
  isN: vi.fn(obj => typeof obj === 'number' && !isNaN(obj)),
  isB: vi.fn(obj => typeof obj === 'boolean'),
  isU: vi.fn(obj => obj == null),
  cl: vi.fn(obj => ({ ...obj })),
  ex: vi.fn((obj, key) => key in obj),
  ks: vi.fn(obj => Object.keys(obj)),
  vs: vi.fn(obj => Object.values(obj)),
  es: vi.fn(obj => Object.entries(obj)),
}));

vi.mock('../../../extension/utils/shortcuts/array.js', () => ({
  inc: vi.fn((arr, item) => arr.includes(item)),
  map: vi.fn((arr, fn) => arr.map(fn)),
  flt: vi.fn((arr, fn) => arr.filter(fn)),
  red: vi.fn((arr, fn, init) => arr.reduce(fn, init)),
  fnd: vi.fn((arr, fn) => arr.find(fn)),
  some: vi.fn((arr, fn) => arr.some(fn)),
  every: vi.fn((arr, fn) => arr.every(fn)),
  idx: vi.fn((arr, item) => arr.indexOf(item)),
  join: vi.fn((arr, sep) => arr.join(sep)),
  slc: vi.fn((arr, start, end) => arr.slice(start, end)),
  spl: vi.fn((str, sep) => str.split(sep)),
  psh: vi.fn((arr, ...items) => arr.push(...items)),
  pop: vi.fn(arr => arr.pop()),
  shf: vi.fn(arr => arr.shift()),
  uns: vi.fn((arr, ...items) => arr.unshift(...items)),
  rev: vi.fn(arr => [...arr].reverse()),
  srt: vi.fn((arr, fn) => [...arr].sort(fn)),
  len: vi.fn(arr => arr.length),
}));

vi.mock('../../../extension/utils/shortcuts/string.js', () => ({
  rp: vi.fn((str, regex, repl) => str.replace(regex, repl)),
  spl: vi.fn((str, sep) => str.split(sep)),
  slc: vi.fn((str, start, end) => str.slice(start, end)),
  idx: vi.fn((str, substr) => str.indexOf(substr)),
  inc: vi.fn((str, substr) => str.includes(substr)),
  stw: vi.fn(str => str.startsWith),
  enw: vi.fn(str => str.endsWith),
  upr: vi.fn(str => str.toUpperCase()),
  lwr: vi.fn(str => str.toLowerCase()),
  trm: vi.fn(str => str.trim()),
  len: vi.fn(str => str.length),
  sub: vi.fn((str, start, end) => str.substring(start, end)),
  chr: vi.fn(code => String.fromCharCode(code)),
  cca: vi.fn(str => str.charCodeAt(0)),
}));

vi.mock('../../../extension/utils/shortcuts/math.js', () => ({
  mn: vi.fn((a, b) => Math.min(a, b)),
  mx: vi.fn((a, b) => Math.max(a, b)),
  rnd: vi.fn(n => Math.round(n)),
  flr: vi.fn(n => Math.floor(n)),
  cel: vi.fn(n => Math.ceil(n)),
  abs: vi.fn(n => Math.abs(n)),
  sin: vi.fn(n => Math.sin(n)),
  cos: vi.fn(n => Math.cos(n)),
  tan: vi.fn(n => Math.tan(n)),
  sqrt: vi.fn(n => Math.sqrt(n)),
  pow: vi.fn((a, b) => Math.pow(a, b)),
  log: vi.fn(n => Math.log(n)),
  exp: vi.fn(n => Math.exp(n)),
  PI: Math.PI,
  E: Math.E,
}));

vi.mock('../../../extension/utils/shortcuts/network.js', () => ({
  ft: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/storage.js', () => ({
  slg: vi.fn(),
  ssg: vi.fn(),
  sls: vi.fn(),
  sss: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/tabs.js', () => ({
  qt: vi.fn(),
  ct: vi.fn(),
  ut: vi.fn(),
  rt: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/windows.js', () => ({
  cw: vi.fn(),
  gw: vi.fn(),
  uw: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/platform_api.js', () => ({
  pa: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/regex.js', () => ({
  mt: vi.fn((str, regex) => str.match(regex)),
  rpl: vi.fn((str, regex, repl) => str.replace(regex, repl)),
  tst: vi.fn((regex, str) => regex.test(str)),
  xec: vi.fn(regex => regex.exec),
}));

vi.mock('../../../extension/utils/shortcuts/runtime.js', () => ({
  sm: vi.fn(),
  oam: vi.fn(),
  ram: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/segments.js', () => ({
  lk: vi.fn(),
  ln: vi.fn(),
  lgc: vi.fn(),
  LM: vi.fn(),
  CM: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/time.js', () => ({
  now: vi.fn(() => Date.now()),
  dly: vi.fn(ms => new Promise(resolve => setTimeout(resolve, ms))),
}));

vi.mock('../../../extension/utils/shortcuts/url.js', () => ({
  url: vi.fn(path => `chrome-extension://mock-id/${path}`),
}));

vi.mock('../../../extension/utils/shortcuts/chrome.js', () => ({
  cr: global.chrome.runtime,
  cs: global.chrome.storage,
  ct: global.chrome.tabs,
  cw: global.chrome.windows,
}));

global.window = {
  ...global.window,
  top: global.window,
  location: {
    hostname: 'www.youtube.com',
    search: '?v=test123',
  },
  scrollTo: vi.fn(),
};

const body = global.document.createElement('body');
const head = global.document.createElement('head');

global.document.body = body;
global.document.documentElement.appendChild(head);
global.document.documentElement.appendChild(body);

console.log('Setup: document.body exists:', !!global.document.body);
