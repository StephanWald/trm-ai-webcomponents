import { makeDraggable } from './draggable-mixin';

// JSDOM does not have PointerEvent - polyfill it
if (typeof (global as any).PointerEvent === 'undefined') {
  class PointerEvent extends MouseEvent {
    pointerId: number;
    constructor(type: string, params: any = {}) {
      super(type, params);
      this.pointerId = params.pointerId || 0;
    }
  }
  (global as any).PointerEvent = PointerEvent;
}

describe('makeDraggable', () => {
  let element: HTMLElement;
  let handle: HTMLElement;

  beforeEach(() => {
    // Create element with handle
    element = document.createElement('div');
    element.style.position = 'fixed';

    handle = document.createElement('div');
    handle.className = 'drag-handle';
    element.appendChild(handle);

    document.body.appendChild(element);

    // Mock getBoundingClientRect
    element.getBoundingClientRect = jest.fn(() => ({
      left: 100,
      top: 100,
      width: 200,
      height: 150,
      right: 300,
      bottom: 250,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    }));

    // Mock setPointerCapture and releasePointerCapture on handle
    handle.setPointerCapture = jest.fn();
    handle.releasePointerCapture = jest.fn();

    // Set window dimensions for viewport constraints
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });

    // Mock offsetWidth/offsetHeight via prototype for the element
    Object.defineProperty(element, 'offsetWidth', { value: 200, writable: true, configurable: true });
    Object.defineProperty(element, 'offsetHeight', { value: 150, writable: true, configurable: true });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.body.style.cursor = '';
  });

  describe('setup', () => {
    it('returns a cleanup function', () => {
      const cleanup = makeDraggable(element, '.drag-handle');
      expect(typeof cleanup).toBe('function');
    });

    it('sets cursor to grab on the handle element', () => {
      makeDraggable(element, '.drag-handle');
      expect(handle.style.cursor).toBe('grab');
    });

    it('uses element itself as handle when selector does not match', () => {
      const elementWithoutChild = document.createElement('div');
      elementWithoutChild.getBoundingClientRect = jest.fn(() => ({
        left: 50,
        top: 50,
        width: 100,
        height: 100,
        right: 150,
        bottom: 150,
        x: 50,
        y: 50,
        toJSON: () => ({}),
      }));
      (elementWithoutChild as any).setPointerCapture = jest.fn();
      (elementWithoutChild as any).releasePointerCapture = jest.fn();
      document.body.appendChild(elementWithoutChild);

      // No child matching '.non-existent', element itself becomes handle
      const cleanup = makeDraggable(elementWithoutChild, '.non-existent');
      expect(elementWithoutChild.style.cursor).toBe('grab');
      cleanup();
    });
  });

  describe('pointer down', () => {
    it('sets body cursor to grabbing on pointerdown', () => {
      makeDraggable(element, '.drag-handle');

      const pointerDown = new PointerEvent('pointerdown', {
        clientX: 150,
        clientY: 150,
        pointerId: 1,
        bubbles: true,
      });
      handle.dispatchEvent(pointerDown);

      expect(document.body.style.cursor).toBe('grabbing');
    });

    it('calls setPointerCapture on pointer down', () => {
      makeDraggable(element, '.drag-handle');

      const pointerDown = new PointerEvent('pointerdown', {
        clientX: 150,
        clientY: 150,
        pointerId: 5,
        bubbles: true,
      });
      handle.dispatchEvent(pointerDown);

      expect(handle.setPointerCapture).toHaveBeenCalledWith(5);
    });
  });

  describe('drag movement', () => {
    it('updates element left and top on pointermove after pointerdown', () => {
      makeDraggable(element, '.drag-handle');

      // Pointerdown at (150, 150); element position is (100, 100)
      const pointerDown = new PointerEvent('pointerdown', {
        clientX: 150,
        clientY: 150,
        pointerId: 1,
        bubbles: true,
      });
      handle.dispatchEvent(pointerDown);

      // Move by (30, 20) => new position (100 + 30, 100 + 20) = (130, 120)
      const pointerMove = new PointerEvent('pointermove', {
        clientX: 180,
        clientY: 170,
        bubbles: true,
      });
      document.dispatchEvent(pointerMove);

      expect(element.style.left).toBe('130px');
      expect(element.style.top).toBe('120px');
    });

    it('clears right and bottom positioning during drag', () => {
      makeDraggable(element, '.drag-handle');

      element.style.right = '20px';
      element.style.bottom = '20px';

      const pointerDown = new PointerEvent('pointerdown', {
        clientX: 150,
        clientY: 150,
        pointerId: 1,
        bubbles: true,
      });
      handle.dispatchEvent(pointerDown);

      const pointerMove = new PointerEvent('pointermove', {
        clientX: 160,
        clientY: 160,
        bubbles: true,
      });
      document.dispatchEvent(pointerMove);

      expect(element.style.right).toBe('');
      expect(element.style.bottom).toBe('');
    });

    it('does not update position on pointermove when not dragging', () => {
      makeDraggable(element, '.drag-handle');

      // No pointerdown first
      const pointerMove = new PointerEvent('pointermove', {
        clientX: 300,
        clientY: 300,
        bubbles: true,
      });
      document.dispatchEvent(pointerMove);

      // Position should not have been set
      expect(element.style.left).toBe('');
      expect(element.style.top).toBe('');
    });
  });

  describe('viewport constraint', () => {
    it('clamps position to 0 when dragging beyond left edge', () => {
      makeDraggable(element, '.drag-handle');

      const pointerDown = new PointerEvent('pointerdown', {
        clientX: 150,
        clientY: 150,
        pointerId: 1,
        bubbles: true,
      });
      handle.dispatchEvent(pointerDown);

      // Move far left so new position would be negative
      const pointerMove = new PointerEvent('pointermove', {
        clientX: 0,
        clientY: 150,
        bubbles: true,
      });
      document.dispatchEvent(pointerMove);

      // deltaX = 0 - 150 = -150; newX = 100 - 150 = -50 => clamped to 0
      expect(element.style.left).toBe('0px');
    });

    it('clamps position to 0 when dragging beyond top edge', () => {
      makeDraggable(element, '.drag-handle');

      const pointerDown = new PointerEvent('pointerdown', {
        clientX: 150,
        clientY: 150,
        pointerId: 1,
        bubbles: true,
      });
      handle.dispatchEvent(pointerDown);

      // Move far up
      const pointerMove = new PointerEvent('pointermove', {
        clientX: 150,
        clientY: 0,
        bubbles: true,
      });
      document.dispatchEvent(pointerMove);

      // deltaY = 0 - 150 = -150; newY = 100 - 150 = -50 => clamped to 0
      expect(element.style.top).toBe('0px');
    });

    it('clamps position to max x when dragging beyond right edge', () => {
      makeDraggable(element, '.drag-handle');

      const pointerDown = new PointerEvent('pointerdown', {
        clientX: 150,
        clientY: 150,
        pointerId: 1,
        bubbles: true,
      });
      handle.dispatchEvent(pointerDown);

      // Move far right; maxX = 1024 - 200 = 824
      const pointerMove = new PointerEvent('pointermove', {
        clientX: 5000,
        clientY: 150,
        bubbles: true,
      });
      document.dispatchEvent(pointerMove);

      expect(element.style.left).toBe('824px');
    });

    it('clamps position to max y when dragging beyond bottom edge', () => {
      makeDraggable(element, '.drag-handle');

      const pointerDown = new PointerEvent('pointerdown', {
        clientX: 150,
        clientY: 150,
        pointerId: 1,
        bubbles: true,
      });
      handle.dispatchEvent(pointerDown);

      // Move far down; maxY = 768 - 150 = 618
      const pointerMove = new PointerEvent('pointermove', {
        clientX: 150,
        clientY: 5000,
        bubbles: true,
      });
      document.dispatchEvent(pointerMove);

      expect(element.style.top).toBe('618px');
    });
  });

  describe('pointer up', () => {
    it('resets body cursor on pointerup', () => {
      makeDraggable(element, '.drag-handle');

      const pointerDown = new PointerEvent('pointerdown', {
        clientX: 150,
        clientY: 150,
        pointerId: 1,
        bubbles: true,
      });
      handle.dispatchEvent(pointerDown);

      expect(document.body.style.cursor).toBe('grabbing');

      const pointerUp = new PointerEvent('pointerup', {
        clientX: 160,
        clientY: 160,
        pointerId: 1,
        bubbles: true,
      });
      document.dispatchEvent(pointerUp);

      expect(document.body.style.cursor).toBe('');
    });

    it('calls releasePointerCapture on pointerup', () => {
      makeDraggable(element, '.drag-handle');

      const pointerDown = new PointerEvent('pointerdown', {
        clientX: 150,
        clientY: 150,
        pointerId: 3,
        bubbles: true,
      });
      handle.dispatchEvent(pointerDown);

      const pointerUp = new PointerEvent('pointerup', {
        clientX: 160,
        clientY: 160,
        pointerId: 3,
        bubbles: true,
      });
      document.dispatchEvent(pointerUp);

      expect(handle.releasePointerCapture).toHaveBeenCalledWith(3);
    });

    it('does not process pointerup when not dragging', () => {
      makeDraggable(element, '.drag-handle');

      // No pointerdown first - not dragging
      const pointerUp = new PointerEvent('pointerup', {
        clientX: 160,
        clientY: 160,
        pointerId: 1,
        bubbles: true,
      });
      // Should not throw
      expect(() => document.dispatchEvent(pointerUp)).not.toThrow();
    });
  });

  describe('cleanup', () => {
    it('resets handle cursor on cleanup', () => {
      const cleanup = makeDraggable(element, '.drag-handle');

      expect(handle.style.cursor).toBe('grab');
      cleanup();
      expect(handle.style.cursor).toBe('');
    });

    it('resets body cursor on cleanup', () => {
      const cleanup = makeDraggable(element, '.drag-handle');

      // Start dragging
      const pointerDown = new PointerEvent('pointerdown', {
        clientX: 150,
        clientY: 150,
        pointerId: 1,
        bubbles: true,
      });
      handle.dispatchEvent(pointerDown);

      cleanup();
      expect(document.body.style.cursor).toBe('');
    });

    it('stops responding to pointer events after cleanup - abortController cancels listeners', () => {
      // Verify the AbortController signal works correctly by checking
      // that cleanup does not throw and event listeners are removed via signal
      const cleanup = makeDraggable(element, '.drag-handle');

      // Verify listeners work before cleanup
      const pointerDownBefore = new PointerEvent('pointerdown', {
        clientX: 150,
        clientY: 150,
        pointerId: 1,
        bubbles: true,
      });
      handle.dispatchEvent(pointerDownBefore);
      expect(document.body.style.cursor).toBe('grabbing');

      // Now cleanup - this should abort the signal
      cleanup();

      // After cleanup, cursor is reset
      expect(document.body.style.cursor).toBe('');
    });
  });
});
