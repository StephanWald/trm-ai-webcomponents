import { newSpecPage } from '@stencil/core/testing';
import { SpPopover } from './sp-popover';

// The component's openInternal() defers position compute and isOpen=true to a
// requestAnimationFrame callback. In Stencil's testing environment (mock-doc),
// rAF is implemented as setTimeout(0) which is async. We replace the global
// requestAnimationFrame with a synchronous shim so it fires immediately during
// async method calls, without needing to advance fake timers.
//
// Note: this is set once globally for the module. Each test creates a fresh
// page, so there is no cross-test state from the component itself.
const originalRaf = global.requestAnimationFrame;
const originalCaf = global.cancelAnimationFrame;

global.requestAnimationFrame = (cb: FrameRequestCallback): number => {
  cb(0);
  return 0;
};
global.cancelAnimationFrame = (_id: number): void => {};

afterAll(() => {
  global.requestAnimationFrame = originalRaf;
  global.cancelAnimationFrame = originalCaf;
});

describe('sp-popover', () => {

  // ---------------------------------------------------------------------------
  // Rendering tests
  // ---------------------------------------------------------------------------

  describe('rendering', () => {
    it('renders with default props — popover-container exists and is not open', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover>content</sp-popover>',
      });

      expect(page.root).toBeTruthy();
      const container = page.root?.shadowRoot?.querySelector('.popover-container');
      expect(container).toBeTruthy();
      expect(container?.classList.contains('open')).toBe(false);
    });

    it('renders with open={true} — popover-container has .open class', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover open>content</sp-popover>',
      });

      await page.waitForChanges();

      const container = page.root?.shadowRoot?.querySelector('.popover-container');
      expect(container).toBeTruthy();
      expect(container?.classList.contains('open')).toBe(true);
    });

    it('applies theme-dark class to host when theme="dark"', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover theme="dark">content</sp-popover>',
      });

      expect(page.root).toHaveClass('theme-dark');
    });

    it('applies theme-light class to host when theme="light"', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover theme="light">content</sp-popover>',
      });

      expect(page.root).toHaveClass('theme-light');
    });

    it('does not apply theme class when theme="auto" (default)', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover>content</sp-popover>',
      });

      expect(page.root).not.toHaveClass('theme-dark');
      expect(page.root).not.toHaveClass('theme-light');
    });

    it('slot content is projected into .popover-content', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover><span class="inner">hello</span></sp-popover>',
      });

      const contentWrapper = page.root?.shadowRoot?.querySelector('.popover-content');
      expect(contentWrapper).toBeTruthy();
    });

    it('renders role="dialog" on the container', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover>content</sp-popover>',
      });

      const container = page.root?.shadowRoot?.querySelector('.popover-container');
      expect(container?.getAttribute('role')).toBe('dialog');
    });
  });

  // ---------------------------------------------------------------------------
  // Prop defaults
  // ---------------------------------------------------------------------------

  describe('prop defaults', () => {
    it('placement defaults to "bottom-start"', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover>content</sp-popover>',
      });

      expect(page.rootInstance.placement).toBe('bottom-start');
    });

    it('closeOnClick defaults to true', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover>content</sp-popover>',
      });

      expect(page.rootInstance.closeOnClick).toBe(true);
    });

    it('closeOnEscape defaults to true', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover>content</sp-popover>',
      });

      expect(page.rootInstance.closeOnEscape).toBe(true);
    });

    it('open defaults to false', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover>content</sp-popover>',
      });

      expect(page.rootInstance.open).toBe(false);
    });

    it('theme defaults to "auto"', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover>content</sp-popover>',
      });

      expect(page.rootInstance.theme).toBe('auto');
    });
  });

  // ---------------------------------------------------------------------------
  // @Watch('open') — prop change triggers state update
  // ---------------------------------------------------------------------------

  describe('@Watch("open") prop change', () => {
    it('setting open=true via prop triggers isOpen state update', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover>content</sp-popover>',
      });

      expect(page.rootInstance.isOpen).toBe(false);

      page.rootInstance.open = true;
      page.rootInstance.onOpenChange(true);
      await page.waitForChanges();

      expect(page.rootInstance.isOpen).toBe(true);
    });

    it('setting open=false via prop triggers isOpen=false', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover>content</sp-popover>',
      });

      // First open it
      page.rootInstance.open = true;
      page.rootInstance.onOpenChange(true);
      await page.waitForChanges();

      // Now close via prop change
      page.rootInstance.open = false;
      page.rootInstance.onOpenChange(false);
      await page.waitForChanges();

      expect(page.rootInstance.isOpen).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Method tests
  // ---------------------------------------------------------------------------

  describe('methods', () => {
    it('showPopover() sets isOpen=true and emits popoverOpen event', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover>content</sp-popover>',
      });

      const openSpy = jest.fn();
      page.root?.addEventListener('popoverOpen', openSpy);

      await page.rootInstance.showPopover();
      await page.waitForChanges();

      expect(page.rootInstance.isOpen).toBe(true);
      expect(openSpy).toHaveBeenCalled();
    });

    it('showPopover() is a no-op when already open', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover>content</sp-popover>',
      });

      const openSpy = jest.fn();
      page.root?.addEventListener('popoverOpen', openSpy);

      await page.rootInstance.showPopover();
      await page.waitForChanges();
      await page.rootInstance.showPopover();
      await page.waitForChanges();

      // Should only have fired once
      expect(openSpy).toHaveBeenCalledTimes(1);
    });

    it('hidePopover() sets isOpen=false and emits popoverClose event', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover>content</sp-popover>',
      });

      await page.rootInstance.showPopover();
      await page.waitForChanges();

      const closeSpy = jest.fn();
      page.root?.addEventListener('popoverClose', closeSpy);

      await page.rootInstance.hidePopover();
      await page.waitForChanges();

      expect(page.rootInstance.isOpen).toBe(false);
      expect(closeSpy).toHaveBeenCalled();
    });

    it('hidePopover() is a no-op when already closed', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover>content</sp-popover>',
      });

      const closeSpy = jest.fn();
      page.root?.addEventListener('popoverClose', closeSpy);

      await page.rootInstance.hidePopover();
      await page.waitForChanges();

      expect(closeSpy).not.toHaveBeenCalled();
    });

    it('togglePopover() opens a closed popover', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover>content</sp-popover>',
      });

      expect(page.rootInstance.isOpen).toBe(false);

      await page.rootInstance.togglePopover();
      await page.waitForChanges();

      expect(page.rootInstance.isOpen).toBe(true);
    });

    it('togglePopover() closes an open popover', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover>content</sp-popover>',
      });

      await page.rootInstance.showPopover();
      await page.waitForChanges();
      expect(page.rootInstance.isOpen).toBe(true);

      await page.rootInstance.togglePopover();
      await page.waitForChanges();

      expect(page.rootInstance.isOpen).toBe(false);
    });

    it('updatePosition() does not change open state when popover is closed', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover>content</sp-popover>',
      });

      expect(page.rootInstance.isOpen).toBe(false);

      await page.rootInstance.updatePosition();
      await page.waitForChanges();

      expect(page.rootInstance.isOpen).toBe(false);
    });

    it('updatePosition() does not change open state when popover is open', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover>content</sp-popover>',
      });

      await page.rootInstance.showPopover();
      await page.waitForChanges();
      expect(page.rootInstance.isOpen).toBe(true);

      await page.rootInstance.updatePosition();
      await page.waitForChanges();

      expect(page.rootInstance.isOpen).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Event tests
  // ---------------------------------------------------------------------------

  describe('events', () => {
    it('emits popoverOpen when showPopover() is called', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover>content</sp-popover>',
      });

      const openSpy = jest.fn();
      page.root?.addEventListener('popoverOpen', openSpy);

      await page.rootInstance.showPopover();
      await page.waitForChanges();

      expect(openSpy).toHaveBeenCalledTimes(1);
    });

    it('emits popoverClose when hidePopover() is called', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover>content</sp-popover>',
      });

      await page.rootInstance.showPopover();
      await page.waitForChanges();

      const closeSpy = jest.fn();
      page.root?.addEventListener('popoverClose', closeSpy);

      await page.rootInstance.hidePopover();
      await page.waitForChanges();

      expect(closeSpy).toHaveBeenCalledTimes(1);
    });
  });

  // ---------------------------------------------------------------------------
  // ARIA tests
  // ---------------------------------------------------------------------------

  describe('ARIA attributes', () => {
    it('aria-hidden="true" when closed', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover>content</sp-popover>',
      });

      const container = page.root?.shadowRoot?.querySelector('.popover-container');
      expect(container?.getAttribute('aria-hidden')).toBe('true');
    });

    it('aria-hidden="false" when open', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover>content</sp-popover>',
      });

      await page.rootInstance.showPopover();
      await page.waitForChanges();

      const container = page.root?.shadowRoot?.querySelector('.popover-container');
      expect(container?.getAttribute('aria-hidden')).toBe('false');
    });

    it('role="dialog" on the container', async () => {
      const page = await newSpecPage({
        components: [SpPopover],
        html: '<sp-popover>content</sp-popover>',
      });

      const container = page.root?.shadowRoot?.querySelector('.popover-container');
      expect(container?.getAttribute('role')).toBe('dialog');
    });
  });

});
