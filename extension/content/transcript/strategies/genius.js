const gu = p => chrome.runtime.getURL(p);

);
);
);
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
      console.error('Genius: No title found');
      return null;
    }

    const r = await chrome.runtime.sendMessage({ type: 'GET_LYRICS', title, artist: channel });
    if (r?.result?.lyrics) {
      return [{ start: 0, duration: 0, text: r.result.lyrics }];
    }
    throw new Error('Genius failed or not music');
  } catch (err) {
    console.error('Err:extract', err);
    throw err;
  }
};
