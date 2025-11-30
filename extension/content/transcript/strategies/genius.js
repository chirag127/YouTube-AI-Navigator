const gu = p => chrome.runtime.getURL(p);

const { qs: $ } = await import(gu('utils/shortcuts/dom.js'));
const { e } = await import(gu('utils/shortcuts/log.js'));
const { msg } = await import(gu('utils/shortcuts/runtime.js'));
export const name = 'Genius Lyrics';
export const priority = 20;

export const extract = async () => {
  try {
    // Try multiple selectors for title
    let title =
      $('h1.ytd-watch-metadata')?.textContent?.trim() ||
      $('h1.ytd-video-primary-info-renderer')?.textContent?.trim() ||
      $('#title h1')?.textContent?.trim();

    // Fallback to document title
    if (!title && document.title) {
      title = document.title.replace(' - YouTube', '').trim();
    }

    // Try multiple selectors for channel/artist
    const channel =
      $('.ytd-channel-name a')?.textContent?.trim() ||
      $('#owner-name a')?.textContent?.trim() ||
      '';

    if (!title) {
      e('Genius: No title found');
      return null;
    }

    const r = await msg({ type: 'GET_LYRICS', title, artist: channel });
    if (r?.result?.lyrics) {
      return [{ start: 0, duration: 0, text: r.result.lyrics }];
    }
    throw new Error('Genius failed or not music');
  } catch (err) {
    e('Err:extract', err);
    throw err;
  }
};
