const { findSecondaryColumn, isWidgetProperlyVisible } = await import(
  chrome.runtime.getURL('content/utils/dom.js')
);
const { initTabs } = await import(chrome.runtime.getURL('content/ui/tabs.js'));
const { attachEventListeners } = await import(chrome.runtime.getURL('content/handlers/events.js'));
const { createWidgetHTML } = await import(
  chrome.runtime.getURL('content/ui/components/widget/structure.js')
);

function $(selector, context = document) {
  return context.querySelector(selector);
}

function log(...args) {
  console.log('[Widget]', ...args);
}

async function waitForElement(selector, timeout = 5000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector);
    if (element) return element;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Element ${selector} not found within ${timeout}ms`);
}

function setTextContent(element, text) {
  if (element) element.textContent = text;
}

function setInnerHTML(element, html) {
  if (element) element.innerHTML = html;
}

function addEventListener(element, event, handler) {
  if (element) element.addEventListener(event, handler);
}

function createMutationObserver(callback) {
  return new MutationObserver(callback);
}

function arrayFrom(arrayLike) {
  return Array.from(arrayLike);
}

let widgetContainer = null,
  resizeObserver = null,
  containerObserver = null,
  positionCheckInterval = null,
  lastKnownContainer = null,
  widgetConfig = null,
  isResizing = false,
  startY = 0,
  startHeight = 0;

function updateWidgetHeight() {
  try {
    if (!widgetContainer) return;
    const viewportHeight = window.innerHeight;
    const rect = widgetContainer.getBoundingClientRect();
    const safetyMargin = widgetConfig.viewportMargin || 20;
    let availableHeight = viewportHeight - Math.max(0, rect.top) - safetyMargin;
    availableHeight = Math.max(availableHeight, 200);
    if (widgetConfig.dynamicHeight !== false) {
      widgetContainer.style.maxHeight = `${availableHeight}px`;
    } else {
      widgetContainer.style.maxHeight = `${widgetConfig.maxHeight || 1200}px`;
    }
    const p = $('#movie_player') || $('.html5-video-player');
    if (p) {
      p.setAttribute('data-widget-initialized', 'true');
    }
    const header = $('.yt-ai-header', widgetContainer);
    const tabs = $('.yt-ai-tabs', widgetContainer);
    const chatInput = $('.yt-ai-chat-input', widgetContainer);
    if (header && tabs && chatInput) {
      const contentArea = $('#yt-ai-content-area', widgetContainer);
      if (contentArea) {
        const currentHeight = widgetContainer.offsetHeight;
        if (widgetConfig.dynamicHeight !== false && currentHeight > availableHeight) {
          widgetContainer.style.height = `${availableHeight}px`;
        }
      }
    }
  } catch (err) {
    console.error('Err:updateWidgetHeight', err);
  }
}

function ensureWidgetAtTop(c) {
  try {
    if (!widgetContainer) return;
    if (!c) {
      c = widgetContainer.parentElement;
      if (!c) {
        reattachWidget();
        return;
      }
    }
    lastKnownContainer = c;
    if (c.firstChild !== widgetContainer) {
      c.insertBefore(widgetContainer, c.firstChild);
    }
    if (!widgetContainer.style.order || widgetContainer.style.order !== '-9999')
      widgetContainer.style.order = '-9999';
  } catch (err) {
    console.error('Err:ensureWidgetAtTop', err);
  }
}

function reattachWidget() {
  try {
    if (!widgetContainer) return;
    const sc = findSecondaryColumn();
    if (sc) {
      sc.insertBefore(widgetContainer, sc.firstChild);
      lastKnownContainer = sc;
      setupObservers(sc);
    } else
      console.error('Err:reattachWidget', 'Cannot reattach widget: secondary column not found');
  } catch (err) {
    console.error('Err:reattachWidget', err);
  }
}

function startPositionMonitoring() {
  try {
    if (positionCheckInterval) clearInterval(positionCheckInterval);
    positionCheckInterval = setInterval(() => {
      if (!widgetContainer) {
        clearInterval(positionCheckInterval);
        return;
      }
      if (!document.contains(widgetContainer)) {
        reattachWidget();
        return;
      }
      const p = widgetContainer.parentElement;
      if (p && p.firstChild !== widgetContainer) ensureWidgetAtTop(p);
    }, 500);
  } catch (err) {
    console.error('Err:startPositionMonitoring', err);
  }
}

export async function injectWidget() {
  try {
    const cfg = await loadWidgetConfig();
    widgetConfig = cfg;
    const ex = document.getElementById('yt-ai-master-widget');
    if (ex) {
      if (isWidgetProperlyVisible(ex)) {
        widgetContainer = ex;
        const c = ex.parentElement;
        lastKnownContainer = c;
        ensureWidgetAtTop(c);
        applyWidgetConfig();
        setupObservers(c);
        startPositionMonitoring();
        log('Widget already properly visible, reusing existing');
        return;
      }
      log('Widget exists but not properly visible, removing and re-injecting');
      ex.remove();
    }
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (containerObserver) {
      containerObserver.disconnect();
      containerObserver = null;
    }
    let sc = findSecondaryColumn(),
      att = 0;
    while (!sc && att < 20) {
      try {
        sc = await waitForElement(
          '#secondary-inner, #secondary, #related, ytd-watch-next-secondary-results-renderer, ytd-watch-flexy #secondary',
          500
        );
        if (sc) break;
      } catch (err) {
        void err;
      }
      att++;
      await new Promise(r => setTimeout(r, 200));
    }
    if (!sc) {
      sc = $('#columns');
      if (!sc) {
        console.error('Target container not found. Widget injection aborted.');
        return;
      }
      log('Using fallback #columns container');
    }
    widgetContainer = document.createElement('div');
    widgetContainer.id = 'yt-ai-master-widget';
    widgetContainer.style.order = '-9999';
    setInnerHTML(widgetContainer, createWidgetHTML(cfg));
    sc.insertBefore(widgetContainer, sc.firstChild);
    lastKnownContainer = sc;
    await applyDefaultWidgetState();
    applyWidgetConfig();
    setupWidgetLogic(widgetContainer);
    setupObservers(sc);
    startPositionMonitoring();
  } catch (err) {
    console.error('Err:injectWidget', err);
  }
}

async function loadWidgetConfig() {
  try {
    const r = await chrome.storage.sync.get('config');
    const defaults = {
      height: 500,
      minHeight: 200,
      maxHeight: 1200,
      width: 400,
      minWidth: 300,
      maxWidth: 800,
      resizable: true,
      resizableWidth: false,
      position: 'right',
      tabs: { summary: true, segments: true, chat: true, comments: true },
      defaultCollapsed: false,
      rememberState: true,
      segmentFilters: {
        sponsor: true,
        selfpromo: true,
        interaction: true,
        intro: true,
        outro: true,
        preview: true,
        filler: true,
        highlight: true,
        exclusive: true,
      },
    };

    if (!r.config?.widget) return defaults;
    return {
      ...defaults,
      ...r.config.widget,
      tabs: { ...defaults.tabs, ...r.config.widget.tabs },
      segmentFilters: { ...defaults.segmentFilters, ...r.config.widget.segmentFilters },
    };
  } catch (err) {
    console.error('Err:loadWidgetConfig', err);
    return {
      height: 500,
      minHeight: 200,
      maxHeight: 1200,
      width: 400,
      minWidth: 300,
      maxWidth: 800,
      resizable: true,
      resizableWidth: false,
      position: 'right',
      tabs: { summary: true, segments: true, chat: true, comments: true },
      defaultCollapsed: false,
      rememberState: true,
      segmentFilters: {
        sponsor: true,
        selfpromo: true,
        interaction: true,
        intro: true,
        outro: true,
        preview: true,
        filler: true,
        highlight: true,
        exclusive: true,
      },
    };
  }
}

async function applyWidgetConfig() {
  try {
    if (!widgetContainer || !widgetConfig) return;
    const ca = $('#yt-ai-content-area', widgetContainer);
    if (ca) ca.style.height = `${widgetConfig.height}px`;
    if (widgetConfig.width && widgetConfig.resizableWidth) {
      widgetContainer.style.width = `${widgetConfig.width}px`;
      widgetContainer.style.maxWidth = `${widgetConfig.maxWidth}px`;
      widgetContainer.style.minWidth = `${widgetConfig.minWidth}px`;
    }

    if (widgetConfig.opacity !== undefined) {
      const opacity = widgetConfig.opacity / 100;
      widgetContainer.style.setProperty('--yt-ai-bg-glass', `rgba(15, 15, 15, ${opacity})`);
    }

    if (widgetConfig.borderRadius !== undefined) {
      widgetContainer.style.setProperty('--yt-ai-radius', `${widgetConfig.borderRadius}px`);
    }

    if (widgetConfig.accentColor) {
      widgetContainer.style.setProperty('--yt-ai-accent', widgetConfig.accentColor);
    }

    const r = await chrome.storage.sync.get('config');
    const ui = r.config?.ui || {};
    if (ui.fontFamily) {
      const font =
        ui.fontFamily === 'System'
          ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
          : `"${ui.fontFamily}", sans-serif`;
      widgetContainer.style.setProperty('--yt-ai-font', font);
    }

    if (widgetConfig.blur !== undefined) {
      widgetContainer.style.setProperty('--yt-ai-backdrop', `blur(${widgetConfig.blur}px)`);
      widgetContainer.style.backdropFilter = `blur(${widgetConfig.blur}px)`;
      widgetContainer.style.webkitBackdropFilter = `blur(${widgetConfig.blur}px)`;
    }

    const r2 = await chrome.storage.sync.get('config');
    const theme = r2.config?.ui?.theme || 'liquid-glass';
    widgetContainer.setAttribute('data-theme', theme);

    if (widgetConfig.scale !== undefined) {
      const scale = widgetConfig.scale / 100;
      widgetContainer.style.fontSize = `${14 * scale}px`;
    }

    const rh = $('#yt-ai-resize-handle', widgetContainer);
    if (rh) rh.style.display = widgetConfig.resizable ? 'flex' : 'none';
    const rwh = $('#yt-ai-resize-handle-width', widgetContainer);
    if (rwh) rwh.style.display = widgetConfig.resizableWidth ? 'flex' : 'none';
  } catch (err) {
    console.error('Err:applyWidgetConfig', err);
  }
}

async function saveWidgetHeight(h) {
  try {
    const r = await chrome.storage.sync.get('config');
    const cfg = r.config || {};
    cfg.widget = cfg.widget || {};
    cfg.widget.height = h;
    await chrome.storage.sync.set({ config: cfg });
  } catch (err) {
    console.error('Err:saveWidgetHeight', err);
  }
}

function setupResizeHandle(c) {
  try {
    const rh = $('#yt-ai-resize-handle', c);
    if (!rh || !widgetConfig?.resizable) return;
    rh?.addEventListener('mousedown', ev => {
      ev.preventDefault();
      isResizing = true;
      startY = ev.clientY;
      const ca = $('#yt-ai-content-area', c);
      startHeight = ca ? ca.offsetHeight : widgetConfig.height;
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    });
    document?.addEventListener('mousemove', ev => {
      if (!isResizing) return;
      ev.preventDefault();
      const dy = ev.clientY - startY;
      let nh = startHeight + dy;
      nh = Math.max(widgetConfig.minHeight, Math.min(widgetConfig.maxHeight, nh));
      const ca = $('#yt-ai-content-area', c);
      if (ca) ca.style.height = `${nh}px`;
    });
    document?.addEventListener('mouseup', async () => {
      if (!isResizing) return;
      isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      const ca = $('#yt-ai-content-area', c);
      if (ca) await saveWidgetHeight(ca.offsetHeight);
    });
  } catch (err) {
    console.error('Err:setupResizeHandle', err);
  }
}

let isResizingWidth = false;
let startX = 0;
let startWidth = 0;

function setupWidthResizeHandle(c) {
  try {
    const rwh = $('#yt-ai-resize-handle-width', c);
    if (!rwh || !widgetConfig?.resizableWidth) return;
    rwh?.addEventListener('mousedown', ev => {
      ev.preventDefault();
      isResizingWidth = true;
      startX = ev.clientX;
      startWidth = c.offsetWidth;
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    });
    document?.addEventListener('mousemove', ev => {
      if (!isResizingWidth) return;
      ev.preventDefault();
      const dx = widgetConfig.position === 'right' ? startX - ev.clientX : ev.clientX - startX;
      let nw = startWidth + dx;
      nw = Math.max(widgetConfig.minWidth, Math.min(widgetConfig.maxWidth, nw));
      c.style.width = `${nw}px`;
    });
    document?.addEventListener('mouseup', async () => {
      if (!isResizingWidth) return;
      isResizingWidth = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      await saveWidgetWidth(c.offsetWidth);
    });
  } catch (err) {
    console.error('Err:setupWidthResizeHandle', err);
  }
}

async function saveWidgetWidth(w) {
  try {
    const r = await chrome.storage.sync.get('config');
    const cfg = r.config || {};
    cfg.widget = cfg.widget || {};
    cfg.widget.width = w;
    await chrome.storage.sync.set({ config: cfg });
  } catch (err) {
    console.error('Err:saveWidgetWidth', err);
  }
}

function setupDragHandler(c) {
  try {
    const header = $('.yt-ai-header', c);
    if (!header) return;

    header.style.cursor = 'grab';

    let isDragging = false;
    let startX,
      startY,
      initialTransformX = 0,
      initialTransformY = 0;

    header?.addEventListener('mousedown', e => {
      // Ignore if clicking buttons/inputs
      if (
        e.target.closest('button') ||
        e.target.closest('input') ||
        e.target.closest('.yt-ai-icon-btn')
      )
        return;

      e.preventDefault();
      isDragging = true;
      header.style.cursor = 'grabbing';
      startX = e.clientX;
      startY = e.clientY;

      // Parse current transform
      const style = window.getComputedStyle(c);
      // eslint-disable-next-line no-undef
      const matrix = new WebKitCSSMatrix(style.transform);
      initialTransformX = matrix.m41;
      initialTransformY = matrix.m42;

      document.body.style.userSelect = 'none';
    });

    document?.addEventListener('mousemove', e => {
      if (!isDragging) return;
      e.preventDefault();
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      c.style.transform = `translate(${initialTransformX + dx}px, ${initialTransformY + dy}px)`;
    });

    document?.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      header.style.cursor = 'grab';
      document.body.style.userSelect = '';
    });
  } catch (err) {
    console.error('Err:setupDragHandler', err);
  }
}

function setupWidgetLogic(c) {
  try {
    const cb = $('#yt-ai-close-btn', c);
    if (cb) {
      cb?.addEventListener('click', () => {
        const ic = c.classList.contains('yt-ai-collapsed');
        if (ic) {
          c.classList.remove('yt-ai-collapsed');
          setTextContent(cb, '❌');
          cb.title = 'Collapse';
          saveWidgetState(false);
        } else {
          c.classList.add('yt-ai-collapsed');
          setTextContent(cb, '⬇️');
          cb.title = 'Expand';
          saveWidgetState(true);
        }
      });
    }
    setupResizeHandle(c);
    setupWidthResizeHandle(c);
    setupDragHandler(c);
    initTabs(c);
    attachEventListeners(c);
  } catch (err) {
    console.error('Err:setupWidgetLogic', err);
  }
}

async function applyDefaultWidgetState() {
  try {
    if (!widgetContainer || !widgetConfig) return;
    const cb = $('#yt-ai-close-btn', widgetContainer);
    if (!cb) return;
    if (widgetConfig.rememberState) {
      const savedState = await getSavedWidgetState();
      if (savedState !== null) {
        if (savedState) {
          widgetContainer.classList.add('yt-ai-collapsed');
          setTextContent(cb, '⬇️');
          cb.title = 'Expand';
        }
        return;
      }
    }
    if (widgetConfig.defaultCollapsed) {
      widgetContainer.classList.add('yt-ai-collapsed');
      setTextContent(cb, '⬇️');
      cb.title = 'Expand';
    }
  } catch (err) {
    console.error('Err:applyDefaultWidgetState', err);
  }
}

async function saveWidgetState(isCollapsed) {
  try {
    if (!widgetConfig?.rememberState) return;
    await chrome.storage.sync.set({ widgetCollapsedState: isCollapsed });
  } catch (err) {
    console.error('Err:saveWidgetState', err);
  }
}

async function getSavedWidgetState() {
  try {
    const r = await chrome.storage.sync.get('widgetCollapsedState');
    return r.widgetCollapsedState ?? null;
  } catch {
    return null;
  }
}

function setupObservers(c) {
  try {
    updateWidgetHeight();
    const p = $('#movie_player') || $('.html5-video-player');
    if (resizeObserver) resizeObserver.disconnect();
    if (p) {
      resizeObserver = new ResizeObserver(() => updateWidgetHeight());
      resizeObserver.observe(p);
    }
    addEventListener(window, 'resize', updateWidgetHeight);

    if (containerObserver) containerObserver.disconnect();
    containerObserver = createMutationObserver(m => {
      for (const mu of m) {
        if (mu.type === 'childList') {
          if (arrayFrom(mu.removedNodes).includes(widgetContainer)) {
            setTimeout(() => reattachWidget(), 100);
            return;
          }
          if (
            c.firstChild !== widgetContainer &&
            !arrayFrom(mu.addedNodes).includes(widgetContainer)
          )
            ensureWidgetAtTop(c);
        }
      }
    });
    containerObserver.observe(c, { childList: true, subtree: false });
    const bo = createMutationObserver(() => {
      if (!document.contains(widgetContainer)) {
        reattachWidget();
      } else if (widgetContainer.parentElement !== lastKnownContainer) {
        const np = widgetContainer.parentElement;
        if (np) {
          lastKnownContainer = np;
          setupObservers(np);
        }
      }
    });
    bo.observe(document.body, { childList: true, subtree: true });
  } catch (err) {
    console.error('Err:setupObservers', err);
  }
}

export function getWidget() {
  try {
    return widgetContainer;
  } catch (err) {
    console.error('Err:getWidget', err);
    return null;
  }
}
