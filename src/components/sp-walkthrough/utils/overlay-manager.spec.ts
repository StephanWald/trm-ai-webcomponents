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
});
