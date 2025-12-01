vi.mock('../../../extension/content/core/state.js', () => ({
  state: {
    currentVideoId: '123',
    settings: {
      autoLike: true,
      autoLikeThreshold: 50,
      autoLikeLive: true,
      likeIfNotSubscribed: true,
    },
  },
}));

vi.mock('../../../extension/utils/shortcuts/dom.js', () => ({
  ae: vi.fn(),
  re: vi.fn(),
  qs: vi.fn(),
  qsa: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
  l: vi.fn(),
  e: vi.fn(),
}));

import { AutoLiker } from '../../../extension/content/features/auto-liker.js';

describe('AutoLiker', () => {
  let liker;

  beforeEach(() => {
    vi.clearAllMocks();
    liker = new AutoLiker();
  });

  it('should initialize', () => {
    expect(liker.video).toBe(null);
    expect(liker.likedVideos).toBeInstanceOf(Set);
  });

  describe('init', () => {
    it('should start observing', () => {
      const startObservingSpy = vi.spyOn(liker, 'startObserving');

      liker.init();

      expect(startObservingSpy).toHaveBeenCalled();
    });
  });

  describe('startObserving', () => {
    it('should observe mutations', async () => {
      const qs = vi.mocked(await import('../../../extension/utils/shortcuts/dom.js')).qs;
      document.querySelector.mockReturnValue(null);

      liker.startObserving();

      expect(liker.isObserving).toBe(true);
    });
  });

  describe('handleTimeUpdate', () => {
    it('should attempt like when threshold reached', async () => {
      liker.video = { duration: 100, currentTime: 60 };
      const attemptLikeSpy = vi.spyOn(liker, 'attemptLike').mockResolvedValue();

      await liker.handleTimeUpdate();

      expect(attemptLikeSpy).toHaveBeenCalledWith('123');
    });

    it('should not attempt if not enabled', async () => {
      const state = vi.mocked(await import('../../../extension/content/core/state.js')).state;
      state.settings.autoLike = false;
      liker.video = { duration: 100, currentTime: 60 };
      const attemptLikeSpy = vi.spyOn(liker, 'attemptLike');

      await liker.handleTimeUpdate();

      expect(attemptLikeSpy).not.toHaveBeenCalled();
    });
  });

  describe('attemptLike', () => {
    it('should click like button', async () => {
      const clickLikeButtonSpy = vi.spyOn(liker, 'clickLikeButton').mockResolvedValue(true);

      await liker.attemptLike('123');

      expect(clickLikeButtonSpy).toHaveBeenCalled();
      expect(liker.likedVideos.has('123')).toBe(true);
    });
  });

  describe('isLiveStream', () => {
    it('should detect live stream', async () => {
      const qs = vi.mocked(await import('../../../extension/utils/shortcuts/dom.js')).qs;
      document.querySelector.mockReturnValue({ style: { display: 'block' } });
      Object.defineProperty(window, 'getComputedStyle', {
        value: vi.fn(() => ({ display: 'block' })),
      });

      const result = liker.isLiveStream();

      expect(result).toBe(true);
    });
  });

  describe('checkSubscriptionStatus', () => {
    it('should check subscription', async () => {
      const qs = vi.mocked(await import('../../../extension/utils/shortcuts/dom.js')).qs;
      document.querySelector.mockReturnValue({ hasAttribute: vi.fn(() => true) });

      const result = await liker.checkSubscriptionStatus();

      expect(result).toBe(true);
    });
  });

  describe('clickLikeButton', () => {
    it('should click like button', async () => {
      const qsa = vi.mocked(await import('../../../extension/utils/shortcuts/dom.js')).qsa;
      qsa.mockReturnValue([
        { closest: vi.fn(() => true), click: vi.fn(), getAttribute: vi.fn(() => 'false') },
      ]);

      const result = await liker.clickLikeButton();

      expect(result).toBe(true);
    });
  });
});
