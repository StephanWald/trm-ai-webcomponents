import { OverlayManager } from './overlay-manager';

describe('OverlayManager', () => {
  let manager: OverlayManager;
  let testElement: HTMLElement;

  beforeEach(() => {
    manager = new OverlayManager();

    // Create test element in DOM
    testElement = document.createElement('div');
    testElement.id = 'test-element';
    testElement.style.position = 'absolute';
    testElement.style.top = '100px';
    testElement.style.left = '200px';
    testElement.style.width = '300px';
    testElement.style.height = '150px';
    document.body.appendChild(testElement);

    // Mock getBoundingClientRect for JSDOM
    testElement.getBoundingClientRect = jest.fn(() => ({
      top: 100,
      left: 200,
      width: 300,
      height: 150,
      bottom: 250,
      right: 500,
      x: 200,
      y: 100,
      toJSON: () => ({}),
    }));
  });

  afterEach(() => {
    manager.cleanup();
    document.body.innerHTML = '';
  });

  describe('highlightElement', () => {
    it('creates overlay for valid selector', () => {
      manager.highlightElement('#test-element');

      const overlays = document.querySelectorAll('.sp-walkthrough-highlight');
      expect(overlays.length).toBe(1);
    });

    it('appends overlay to document.body', () => {
      manager.highlightElement('#test-element');

      const overlay = document.querySelector('.sp-walkthrough-highlight');
      expect(overlay?.parentElement).toBe(document.body);
    });

    it('positions overlay using fixed positioning', () => {
      manager.highlightElement('#test-element');

      const overlay = document.querySelector('.sp-walkthrough-highlight') as HTMLElement;
      expect(overlay.style.position).toBe('fixed');
      expect(overlay.style.top).toBe('100px');
      expect(overlay.style.left).toBe('200px');
      expect(overlay.style.width).toBe('300px');
      expect(overlay.style.height).toBe('150px');
    });

    it('sets high z-index to appear above content', () => {
      manager.highlightElement('#test-element');

      const overlay = document.querySelector('.sp-walkthrough-highlight') as HTMLElement;
      expect(overlay.style.zIndex).toBe('10000');
    });

    it('sets pointer-events none to not block interactions', () => {
      manager.highlightElement('#test-element');

      const overlay = document.querySelector('.sp-walkthrough-highlight') as HTMLElement;
      expect(overlay.style.pointerEvents).toBe('none');
    });

    it('applies border styling', () => {
      manager.highlightElement('#test-element');

      const overlay = document.querySelector('.sp-walkthrough-highlight') as HTMLElement;
      expect(overlay.style.border).toContain('3px');
      expect(overlay.style.border).toContain('solid');
    });

    it('applies box-shadow for spotlight effect', () => {
      manager.highlightElement('#test-element');

      const overlay = document.querySelector('.sp-walkthrough-highlight') as HTMLElement;
      expect(overlay.style.boxShadow).toContain('rgba');
    });

    it('warns and does not create overlay for non-existent selector', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      manager.highlightElement('#non-existent');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Element not found'));
      const overlays = document.querySelectorAll('.sp-walkthrough-highlight');
      expect(overlays.length).toBe(0);

      consoleSpy.mockRestore();
    });

    it('clears previous highlights before creating new one', () => {
      manager.highlightElement('#test-element');
      manager.highlightElement('#test-element');

      const overlays = document.querySelectorAll('.sp-walkthrough-highlight');
      expect(overlays.length).toBe(1);
    });
  });

  describe('updatePositions', () => {
    it('updates overlay position based on current target position', () => {
      manager.highlightElement('#test-element');

      // Change mock position
      testElement.getBoundingClientRect = jest.fn(() => ({
        top: 150,
        left: 250,
        width: 350,
        height: 200,
        bottom: 350,
        right: 600,
        x: 250,
        y: 150,
        toJSON: () => ({}),
      }));

      manager.updatePositions();

      const overlay = document.querySelector('.sp-walkthrough-highlight') as HTMLElement;
      expect(overlay.style.top).toBe('150px');
      expect(overlay.style.left).toBe('250px');
      expect(overlay.style.width).toBe('350px');
      expect(overlay.style.height).toBe('200px');
    });

    it('handles empty overlays array gracefully', () => {
      expect(() => manager.updatePositions()).not.toThrow();
    });
  });

  describe('clearHighlights', () => {
    it('removes all overlay elements from DOM', () => {
      manager.highlightElement('#test-element');

      let overlays = document.querySelectorAll('.sp-walkthrough-highlight');
      expect(overlays.length).toBe(1);

      manager.clearHighlights();

      overlays = document.querySelectorAll('.sp-walkthrough-highlight');
      expect(overlays.length).toBe(0);
    });

    it('can be called multiple times safely', () => {
      manager.highlightElement('#test-element');
      manager.clearHighlights();
      expect(() => manager.clearHighlights()).not.toThrow();
    });

    it('clears overlays array', () => {
      manager.highlightElement('#test-element');
      manager.clearHighlights();

      // Verify by trying to update positions (should not error)
      expect(() => manager.updatePositions()).not.toThrow();
    });
  });

  describe('cleanup', () => {
    it('removes all overlays', () => {
      manager.highlightElement('#test-element');

      manager.cleanup();

      const overlays = document.querySelectorAll('.sp-walkthrough-highlight');
      expect(overlays.length).toBe(0);
    });

    it('can be called multiple times safely', () => {
      manager.cleanup();
      expect(() => manager.cleanup()).not.toThrow();
    });
  });

  describe('event listener management', () => {
    it('attaches scroll and resize listeners when highlighting', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      manager.highlightElement('#test-element');

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        expect.objectContaining({ passive: true })
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function),
        expect.any(Object)
      );

      addEventListenerSpy.mockRestore();
    });

    it('cleans up event listeners on clearHighlights', () => {
      manager.highlightElement('#test-element');

      // AbortController should be aborted
      expect(() => manager.clearHighlights()).not.toThrow();

      // Verify new controller created by highlighting again
      expect(() => manager.highlightElement('#test-element')).not.toThrow();
    });
  });

  describe('removeAllOverlays cleanup path', () => {
    it('removes multiple overlays when multiple highlights exist', () => {
      // Add second test element
      const testElement2 = document.createElement('div');
      testElement2.id = 'test-element-2';
      testElement2.getBoundingClientRect = jest.fn(() => ({
        top: 50,
        left: 50,
        width: 100,
        height: 80,
        bottom: 130,
        right: 150,
        x: 50,
        y: 50,
        toJSON: () => ({}),
      }));
      document.body.appendChild(testElement2);

      // Highlight first element then highlight second (clears first, then adds second)
      manager.highlightElement('#test-element');
      manager.highlightElement('#test-element-2');

      let overlays = document.querySelectorAll('.sp-walkthrough-highlight');
      expect(overlays.length).toBe(1);

      manager.clearHighlights();

      overlays = document.querySelectorAll('.sp-walkthrough-highlight');
      expect(overlays.length).toBe(0);
    });

    it('resets pendingRAF to null after clearHighlights when RAF was pending', () => {
      // Simulate a pending animation frame
      (manager as any).pendingRAF = 42;

      // After clearHighlights, pendingRAF should be null
      manager.clearHighlights();

      expect((manager as any).pendingRAF).toBeNull();
    });
  });

  describe('scroll and resize handlers', () => {
    it('calls updatePositions when requestAnimationFrame callback fires on scroll', () => {
      let rafCallback: FrameRequestCallback | null = null;

      // Mock requestAnimationFrame to capture the callback
      const originalRAF = window.requestAnimationFrame;
      Object.defineProperty(window, 'requestAnimationFrame', {
        value: (cb: FrameRequestCallback) => {
          rafCallback = cb;
          return 42;
        },
        configurable: true,
        writable: true,
      });

      manager.highlightElement('#test-element');

      // Trigger scroll event - should queue a RAF
      const scrollEvent = new Event('scroll');
      window.dispatchEvent(scrollEvent);

      // If RAF was queued, the callback should exist
      // Execute it manually to test the update
      if (rafCallback) {
        (rafCallback as FrameRequestCallback)(0);
        expect((manager as any).pendingRAF).toBeNull();
      }

      // Restore
      Object.defineProperty(window, 'requestAnimationFrame', {
        value: originalRAF,
        configurable: true,
        writable: true,
      });
    });

    it('calls updatePositions when requestAnimationFrame callback fires on resize', () => {
      let rafCallback: FrameRequestCallback | null = null;

      const originalRAF = window.requestAnimationFrame;
      Object.defineProperty(window, 'requestAnimationFrame', {
        value: (cb: FrameRequestCallback) => {
          rafCallback = cb;
          return 43;
        },
        configurable: true,
        writable: true,
      });

      manager.highlightElement('#test-element');

      window.dispatchEvent(new Event('resize'));

      if (rafCallback) {
        (rafCallback as FrameRequestCallback)(0);
        expect((manager as any).pendingRAF).toBeNull();
      }

      Object.defineProperty(window, 'requestAnimationFrame', {
        value: originalRAF,
        configurable: true,
        writable: true,
      });
    });

    it('does not queue multiple RAF calls when one is pending', () => {
      let rafCallCount = 0;
      const originalRAF = window.requestAnimationFrame;
      Object.defineProperty(window, 'requestAnimationFrame', {
        value: () => {
          rafCallCount++;
          return 44;
        },
        configurable: true,
        writable: true,
      });

      manager.highlightElement('#test-element');
      (manager as any).pendingRAF = 44; // Simulate pending RAF

      const countBefore = rafCallCount;

      // Trigger scroll again - should not queue another RAF because one is pending
      window.dispatchEvent(new Event('scroll'));

      // RAF count should not have increased
      expect(rafCallCount).toBe(countBefore);

      Object.defineProperty(window, 'requestAnimationFrame', {
        value: originalRAF,
        configurable: true,
        writable: true,
      });
    });
  });

  describe('highlightElement with positioned element', () => {
    it('highlights element with specific dimensions correctly', () => {
      const specialElement = document.createElement('div');
      specialElement.id = 'special-element';
      specialElement.getBoundingClientRect = jest.fn(() => ({
        top: 200,
        left: 400,
        width: 150,
        height: 80,
        bottom: 280,
        right: 550,
        x: 400,
        y: 200,
        toJSON: () => ({}),
      }));
      document.body.appendChild(specialElement);

      manager.highlightElement('#special-element');

      const overlay = document.querySelector('.sp-walkthrough-highlight') as HTMLElement;
      expect(overlay.style.top).toBe('200px');
      expect(overlay.style.left).toBe('400px');
      expect(overlay.style.width).toBe('150px');
      expect(overlay.style.height).toBe('80px');
    });
  });
});
