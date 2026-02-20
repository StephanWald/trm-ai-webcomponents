import { isYouTubeUrl, extractVideoId, YouTubePlayerWrapper } from './youtube-wrapper';

describe('YouTube Helper Functions', () => {
  describe('isYouTubeUrl', () => {
    it('returns true for standard youtube.com/watch URL', () => {
      expect(isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    });

    it('returns true for youtu.be short URL', () => {
      expect(isYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
    });

    it('returns true for youtube.com/embed URL', () => {
      expect(isYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(true);
    });

    it('returns true for youtube.com/watch with additional parameters', () => {
      expect(isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s')).toBe(true);
    });

    it('returns true for HTTP URLs', () => {
      expect(isYouTubeUrl('http://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    });

    it('returns false for non-YouTube URLs', () => {
      expect(isYouTubeUrl('https://vimeo.com/123456')).toBe(false);
      expect(isYouTubeUrl('https://example.com/video.mp4')).toBe(false);
      expect(isYouTubeUrl('https://www.google.com')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isYouTubeUrl('')).toBe(false);
    });

    it('returns false for invalid URL format', () => {
      expect(isYouTubeUrl('not a url')).toBe(false);
    });
  });

  describe('extractVideoId', () => {
    it('extracts video ID from youtube.com/watch URL', () => {
      const id = extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(id).toBe('dQw4w9WgXcQ');
    });

    it('extracts video ID from youtu.be short URL', () => {
      const id = extractVideoId('https://youtu.be/dQw4w9WgXcQ');
      expect(id).toBe('dQw4w9WgXcQ');
    });

    it('extracts video ID from youtube.com/embed URL', () => {
      const id = extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ');
      expect(id).toBe('dQw4w9WgXcQ');
    });

    it('extracts video ID with additional query parameters', () => {
      const id = extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s&list=xyz');
      expect(id).toBe('dQw4w9WgXcQ');
    });

    it('extracts video ID from youtu.be with query params', () => {
      const id = extractVideoId('https://youtu.be/dQw4w9WgXcQ?t=10');
      expect(id).toBe('dQw4w9WgXcQ');
    });

    it('extracts video ID from embed with query params', () => {
      const id = extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1');
      expect(id).toBe('dQw4w9WgXcQ');
    });

    it('returns null for non-YouTube URL', () => {
      const id = extractVideoId('https://vimeo.com/123456');
      expect(id).toBeNull();
    });

    it('returns null for malformed YouTube URL', () => {
      const id = extractVideoId('https://www.youtube.com/notvalid');
      expect(id).toBeNull();
    });

    it('returns null for empty string', () => {
      const id = extractVideoId('');
      expect(id).toBeNull();
    });

    it('handles YouTube URLs without protocol', () => {
      const id = extractVideoId('www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(id).toBe('dQw4w9WgXcQ');
    });

    it('handles youtu.be URLs without protocol', () => {
      const id = extractVideoId('youtu.be/dQw4w9WgXcQ');
      expect(id).toBe('dQw4w9WgXcQ');
    });
  });
});

describe('YouTubePlayerWrapper', () => {
  let containerElement: HTMLElement;
  let mockPlayer: any;
  let capturedEvents: { onReady?: () => void; onStateChange?: (event: any) => void };

  // Helper: create a fresh mock YT.Player constructor
  function setupMockYT() {
    capturedEvents = {};
    mockPlayer = {
      playVideo: jest.fn(),
      pauseVideo: jest.fn(),
      getCurrentTime: jest.fn().mockReturnValue(42),
      getDuration: jest.fn().mockReturnValue(120),
      seekTo: jest.fn(),
      setVolume: jest.fn(),
      isMuted: jest.fn().mockReturnValue(false),
      mute: jest.fn(),
      unMute: jest.fn(),
      destroy: jest.fn(),
    };

    const MockPlayerConstructor = jest.fn().mockImplementation((_container: any, config: any) => {
      if (config?.events) {
        capturedEvents = config.events;
      }
      return mockPlayer;
    });

    (window as any).YT = {
      Player: MockPlayerConstructor,
      PlayerState: {
        PLAYING: 1,
        PAUSED: 2,
        ENDED: 0,
        BUFFERING: 3,
        CUED: 5,
      },
    };
  }

  let intervalCallback: (() => void) | null = null;
  let intervalId = 100;
  let clearIntervalCalled: number | null = null;

  beforeEach(() => {
    containerElement = document.createElement('div');
    document.body.appendChild(containerElement);
    setupMockYT();

    intervalCallback = null;
    intervalId = 100;
    clearIntervalCalled = null;

    // Mock window.setInterval and window.clearInterval to control time tracking
    jest.spyOn(window, 'setInterval').mockImplementation((fn: any) => {
      intervalCallback = fn;
      return intervalId as any;
    });
    jest.spyOn(window, 'clearInterval').mockImplementation((id: any) => {
      clearIntervalCalled = id;
      intervalCallback = null;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (window as any).YT;
    delete (window as any).onYouTubeIframeAPIReady;
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    it('creates player immediately when YT is already loaded', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      expect((window as any).YT.Player).toHaveBeenCalledWith(
        containerElement,
        expect.objectContaining({ videoId: 'dQw4w9WgXcQ' })
      );
      wrapper.destroy();
    });

    it('loads YouTube IFrame API script when YT is not loaded', () => {
      delete (window as any).YT;

      const appendChildSpy = jest.spyOn(document.head, 'appendChild');

      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      expect(appendChildSpy).toHaveBeenCalledWith(
        expect.objectContaining({ src: 'https://www.youtube.com/iframe_api' })
      );

      appendChildSpy.mockRestore();
      wrapper.destroy();
    });

    it('sets up onYouTubeIframeAPIReady callback when YT not loaded', () => {
      delete (window as any).YT;

      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      expect(typeof (window as any).onYouTubeIframeAPIReady).toBe('function');
      wrapper.destroy();
    });

    it('creates player when onYouTubeIframeAPIReady is called', () => {
      delete (window as any).YT;

      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      // Simulate API loading
      setupMockYT();
      (window as any).onYouTubeIframeAPIReady();

      expect((window as any).YT.Player).toHaveBeenCalled();
      wrapper.destroy();
    });
  });

  describe('play and pause', () => {
    it('calls playVideo after player is ready', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      // Trigger ready event
      capturedEvents.onReady?.();
      wrapper.play();

      expect(mockPlayer.playVideo).toHaveBeenCalled();
      wrapper.destroy();
    });

    it('calls pauseVideo after player is ready', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      capturedEvents.onReady?.();
      wrapper.pause();

      expect(mockPlayer.pauseVideo).toHaveBeenCalled();
      wrapper.destroy();
    });

    it('queues play command before player is ready', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      // Call play before ready
      wrapper.play();
      expect(mockPlayer.playVideo).not.toHaveBeenCalled();

      // Now trigger ready - queued command should execute
      capturedEvents.onReady?.();
      expect(mockPlayer.playVideo).toHaveBeenCalled();

      wrapper.destroy();
    });

    it('queues pause command before player is ready', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      wrapper.pause();
      expect(mockPlayer.pauseVideo).not.toHaveBeenCalled();

      capturedEvents.onReady?.();
      expect(mockPlayer.pauseVideo).toHaveBeenCalled();

      wrapper.destroy();
    });
  });

  describe('getCurrentTime and getDuration', () => {
    it('returns player currentTime when ready', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      capturedEvents.onReady?.();
      expect(wrapper.getCurrentTime()).toBe(42);

      wrapper.destroy();
    });

    it('returns 0 when player is not ready', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      // Not ready yet
      expect(wrapper.getCurrentTime()).toBe(0);

      wrapper.destroy();
    });

    it('returns player duration when ready', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      capturedEvents.onReady?.();
      expect(wrapper.getDuration()).toBe(120);

      wrapper.destroy();
    });

    it('returns 0 duration when not ready', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      expect(wrapper.getDuration()).toBe(0);

      wrapper.destroy();
    });
  });

  describe('seekTo and setVolume', () => {
    it('calls player.seekTo with correct arguments when ready', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      capturedEvents.onReady?.();
      wrapper.seekTo(30);

      expect(mockPlayer.seekTo).toHaveBeenCalledWith(30, true);
      wrapper.destroy();
    });

    it('queues seekTo command before ready', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      wrapper.seekTo(30);
      expect(mockPlayer.seekTo).not.toHaveBeenCalled();

      capturedEvents.onReady?.();
      expect(mockPlayer.seekTo).toHaveBeenCalledWith(30, true);

      wrapper.destroy();
    });

    it('converts 0-1 volume scale to 0-100 when calling setVolume', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      capturedEvents.onReady?.();
      wrapper.setVolume(0.5);

      expect(mockPlayer.setVolume).toHaveBeenCalledWith(50);
      wrapper.destroy();
    });

    it('queues setVolume command before ready', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      wrapper.setVolume(0.8);
      expect(mockPlayer.setVolume).not.toHaveBeenCalled();

      capturedEvents.onReady?.();
      expect(mockPlayer.setVolume).toHaveBeenCalledWith(80);

      wrapper.destroy();
    });
  });

  describe('isMuted and setMuted', () => {
    it('returns player.isMuted() when ready', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      capturedEvents.onReady?.();
      expect(wrapper.isMuted()).toBe(false);

      wrapper.destroy();
    });

    it('returns false when not ready', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      expect(wrapper.isMuted()).toBe(false);

      wrapper.destroy();
    });

    it('calls player.mute() when setMuted(true)', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      capturedEvents.onReady?.();
      wrapper.setMuted(true);

      expect(mockPlayer.mute).toHaveBeenCalled();
      wrapper.destroy();
    });

    it('calls player.unMute() when setMuted(false)', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      capturedEvents.onReady?.();
      wrapper.setMuted(false);

      expect(mockPlayer.unMute).toHaveBeenCalled();
      wrapper.destroy();
    });

    it('queues setMuted before ready', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      wrapper.setMuted(true);
      expect(mockPlayer.mute).not.toHaveBeenCalled();

      capturedEvents.onReady?.();
      expect(mockPlayer.mute).toHaveBeenCalled();

      wrapper.destroy();
    });
  });

  describe('event listeners (on/off)', () => {
    it('registers callback and calls it when event is emitted', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');
      const callback = jest.fn();

      wrapper.on('play', callback);
      capturedEvents.onReady?.();

      // Trigger PLAYING state change
      capturedEvents.onStateChange?.({ data: (window as any).YT.PlayerState.PLAYING });

      expect(callback).toHaveBeenCalled();
      wrapper.destroy();
    });

    it('stops calling callback after off() is called', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');
      const callback = jest.fn();

      wrapper.on('play', callback);
      wrapper.off('play', callback);

      capturedEvents.onReady?.();
      capturedEvents.onStateChange?.({ data: (window as any).YT.PlayerState.PLAYING });

      expect(callback).not.toHaveBeenCalled();
      wrapper.destroy();
    });

    it('emits ready event when player is ready', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');
      const readyCallback = jest.fn();

      wrapper.on('ready', readyCallback);
      capturedEvents.onReady?.();

      expect(readyCallback).toHaveBeenCalled();
      wrapper.destroy();
    });

    it('handles off() when event has no registered listeners', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');
      const callback = jest.fn();

      // Calling off for an event that was never registered should not throw
      expect(() => wrapper.off('nonexistent', callback)).not.toThrow();
      wrapper.destroy();
    });

    it('handles multiple listeners for the same event', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      wrapper.on('pause', callback1);
      wrapper.on('pause', callback2);
      capturedEvents.onReady?.();
      capturedEvents.onStateChange?.({ data: (window as any).YT.PlayerState.PAUSED });

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      wrapper.destroy();
    });
  });

  describe('state change handling', () => {
    it('emits play event on PLAYING state', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');
      const playCallback = jest.fn();

      wrapper.on('play', playCallback);
      capturedEvents.onReady?.();
      capturedEvents.onStateChange?.({ data: (window as any).YT.PlayerState.PLAYING });

      expect(playCallback).toHaveBeenCalled();
      wrapper.destroy();
    });

    it('emits pause event on PAUSED state', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');
      const pauseCallback = jest.fn();

      wrapper.on('pause', pauseCallback);
      capturedEvents.onReady?.();
      capturedEvents.onStateChange?.({ data: (window as any).YT.PlayerState.PAUSED });

      expect(pauseCallback).toHaveBeenCalled();
      wrapper.destroy();
    });

    it('emits ended event on ENDED state', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');
      const endedCallback = jest.fn();

      wrapper.on('ended', endedCallback);
      capturedEvents.onReady?.();
      capturedEvents.onStateChange?.({ data: (window as any).YT.PlayerState.ENDED });

      expect(endedCallback).toHaveBeenCalled();
      wrapper.destroy();
    });

    it('does not throw for unhandled state changes', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      capturedEvents.onReady?.();
      // BUFFERING or CUED states are not handled - should not throw
      expect(() => capturedEvents.onStateChange?.({ data: 3 })).not.toThrow();

      wrapper.destroy();
    });
  });

  describe('time tracking', () => {
    it('starts interval on PLAYING state', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');
      const timeupdateCallback = jest.fn();

      wrapper.on('timeupdate', timeupdateCallback);
      capturedEvents.onReady?.();
      capturedEvents.onStateChange?.({ data: (window as any).YT.PlayerState.PLAYING });

      // Verify interval was set up
      expect(window.setInterval).toHaveBeenCalledWith(expect.any(Function), 250);

      // Manually trigger interval callbacks (simulating 2 ticks)
      intervalCallback?.();
      intervalCallback?.();

      expect(timeupdateCallback).toHaveBeenCalledTimes(2);
      wrapper.destroy();
    });

    it('stops interval on PAUSED state', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');
      const timeupdateCallback = jest.fn();

      wrapper.on('timeupdate', timeupdateCallback);
      capturedEvents.onReady?.();
      capturedEvents.onStateChange?.({ data: (window as any).YT.PlayerState.PLAYING });

      // Fire one tick
      intervalCallback?.();
      expect(timeupdateCallback).toHaveBeenCalledTimes(1);

      // Pause - should clear the interval
      capturedEvents.onStateChange?.({ data: (window as any).YT.PlayerState.PAUSED });

      expect(clearIntervalCalled).toBe(intervalId);

      // Interval callback should now be null (no more ticks)
      expect(intervalCallback).toBeNull();

      wrapper.destroy();
    });

    it('stops interval on ENDED state', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');
      const timeupdateCallback = jest.fn();

      wrapper.on('timeupdate', timeupdateCallback);
      capturedEvents.onReady?.();
      capturedEvents.onStateChange?.({ data: (window as any).YT.PlayerState.PLAYING });

      // Fire a tick
      intervalCallback?.();

      // End - should clear the interval
      capturedEvents.onStateChange?.({ data: (window as any).YT.PlayerState.ENDED });
      expect(clearIntervalCalled).toBe(intervalId);

      expect(timeupdateCallback).toHaveBeenCalledTimes(1);
      wrapper.destroy();
    });

    it('clears previous interval when starting new time tracking', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      capturedEvents.onReady?.();

      // Start playing - creates first interval
      capturedEvents.onStateChange?.({ data: (window as any).YT.PlayerState.PLAYING });
      expect(window.setInterval).toHaveBeenCalledTimes(1);

      // Start playing again - should clear old interval and create new one
      capturedEvents.onStateChange?.({ data: (window as any).YT.PlayerState.PLAYING });
      expect(clearIntervalCalled).toBe(intervalId);
      expect(window.setInterval).toHaveBeenCalledTimes(2);

      wrapper.destroy();
    });
  });

  describe('destroy', () => {
    it('calls player.destroy()', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      capturedEvents.onReady?.();
      wrapper.destroy();

      expect(mockPlayer.destroy).toHaveBeenCalled();
    });

    it('clears time tracking interval on destroy', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');
      const timeupdateCallback = jest.fn();

      wrapper.on('timeupdate', timeupdateCallback);
      capturedEvents.onReady?.();
      capturedEvents.onStateChange?.({ data: (window as any).YT.PlayerState.PLAYING });

      wrapper.destroy();

      // Interval should have been cleared
      expect(clearIntervalCalled).toBe(intervalId);
    });

    it('clears listeners on destroy', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');
      const callback = jest.fn();

      wrapper.on('play', callback);
      capturedEvents.onReady?.();
      wrapper.destroy();

      // Emit after destroy - listeners cleared
      capturedEvents.onStateChange?.({ data: (window as any).YT.PlayerState.PLAYING });

      // Callback should not be called since listeners are cleared
      expect(callback).not.toHaveBeenCalled();
    });

    it('clears command queue on destroy', () => {
      const wrapper = new YouTubePlayerWrapper(containerElement, 'dQw4w9WgXcQ');

      // Queue commands before ready
      wrapper.play();
      wrapper.pause();
      wrapper.destroy();

      // After destroy, triggering ready should not process queued commands
      capturedEvents.onReady?.();
      expect(mockPlayer.playVideo).not.toHaveBeenCalled();
      expect(mockPlayer.pauseVideo).not.toHaveBeenCalled();
    });
  });
});
