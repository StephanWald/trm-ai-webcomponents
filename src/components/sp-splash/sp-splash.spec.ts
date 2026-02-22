import { newSpecPage } from '@stencil/core/testing';
import { SpSplash } from './sp-splash';

// Note: Only SpSplash in the components array.
// We test the splash component's own rendering, state, methods, and events.

describe('sp-splash', () => {

  // ---------------------------------------------------------------------------
  // Rendering tests (SPLS-01, SPLS-02, SPLS-06)
  // ---------------------------------------------------------------------------

  describe('rendering (SPLS-01, SPLS-02, SPLS-06)', () => {
    it('renders a .splash-overlay div with role="dialog" and aria-modal="true"', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      const overlay = page.root?.shadowRoot?.querySelector('.splash-overlay');
      expect(overlay).toBeTruthy();
      expect(overlay?.getAttribute('role')).toBe('dialog');
      expect(overlay?.getAttribute('aria-modal')).toBe('true');
    });

    it('renders a .splash-container inside the overlay', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      const container = page.root?.shadowRoot?.querySelector('.splash-container');
      expect(container).toBeTruthy();
    });

    it('renders a .close-button button with aria-label="Close"', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      const closeBtn = page.root?.shadowRoot?.querySelector('.close-button');
      expect(closeBtn).toBeTruthy();
      expect(closeBtn?.getAttribute('aria-label')).toBe('Close');
    });

    it('renders .splash-header section', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      const header = page.root?.shadowRoot?.querySelector('.splash-header');
      expect(header).toBeTruthy();
    });

    it('renders .splash-body section', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      const body = page.root?.shadowRoot?.querySelector('.splash-body');
      expect(body).toBeTruthy();
    });

    it('renders .splash-footer section', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      const footer = page.root?.shadowRoot?.querySelector('.splash-footer');
      expect(footer).toBeTruthy();
    });

    it('renders named slot="logo"', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      const logoSlot = page.root?.shadowRoot?.querySelector('slot[name="logo"]');
      expect(logoSlot).toBeTruthy();
    });

    it('renders named slot="title"', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      const titleSlot = page.root?.shadowRoot?.querySelector('slot[name="title"]');
      expect(titleSlot).toBeTruthy();
    });

    it('renders named slot="subtitle"', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      const subtitleSlot = page.root?.shadowRoot?.querySelector('slot[name="subtitle"]');
      expect(subtitleSlot).toBeTruthy();
    });

    it('renders named slot="body"', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      const bodySlot = page.root?.shadowRoot?.querySelector('slot[name="body"]');
      expect(bodySlot).toBeTruthy();
    });

    it('renders named slot="footer"', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      const footerSlot = page.root?.shadowRoot?.querySelector('slot[name="footer"]');
      expect(footerSlot).toBeTruthy();
    });

    it('overlay has aria-hidden="true" when closed (default)', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      const overlay = page.root?.shadowRoot?.querySelector('.splash-overlay');
      expect(overlay?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  // ---------------------------------------------------------------------------
  // Props tests
  // ---------------------------------------------------------------------------

  describe('props', () => {
    it('open defaults to false', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      expect(page.rootInstance.open).toBe(false);
    });

    it('isVisible defaults to false', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      expect(page.rootInstance.isVisible).toBe(false);
    });

    it('closeOnEscape defaults to true', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      expect(page.rootInstance.closeOnEscape).toBe(true);
    });

    it('closeOnBackdrop defaults to true', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      expect(page.rootInstance.closeOnBackdrop).toBe(true);
    });

    it('theme="dark" sets theme-dark class on host', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash theme="dark"></sp-splash>',
      });

      expect(page.root).toHaveClass('theme-dark');
    });

    it('theme="light" sets theme-light class on host', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash theme="light"></sp-splash>',
      });

      expect(page.root).toHaveClass('theme-light');
    });

    it('theme="auto" (default) does not set theme class on host', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      expect(page.root).not.toHaveClass('theme-dark');
      expect(page.root).not.toHaveClass('theme-light');
    });
  });

  // ---------------------------------------------------------------------------
  // State tests (SPLS-04)
  // ---------------------------------------------------------------------------

  describe('state (SPLS-04)', () => {
    it('when open is set to true via rootInstance, isVisible becomes true after waitForChanges', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      page.rootInstance.open = true;
      await page.waitForChanges();

      expect(page.rootInstance.isVisible).toBe(true);
    });

    it('overlay has .open class when isVisible=true', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      page.rootInstance.open = true;
      await page.waitForChanges();

      const overlay = page.root?.shadowRoot?.querySelector('.splash-overlay');
      expect(overlay?.classList.contains('open')).toBe(true);
    });

    it('overlay does not have .open class when isVisible=false', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      const overlay = page.root?.shadowRoot?.querySelector('.splash-overlay');
      expect(overlay?.classList.contains('open')).toBe(false);
    });

    it('aria-hidden="false" when open is true', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      page.rootInstance.open = true;
      await page.waitForChanges();

      const overlay = page.root?.shadowRoot?.querySelector('.splash-overlay');
      expect(overlay?.getAttribute('aria-hidden')).toBe('false');
    });

    it('componentDidLoad() syncs initial open=true so isVisible becomes true', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash open></sp-splash>',
      });

      // componentDidLoad fires after render, so isVisible should be true
      expect(page.rootInstance.isVisible).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Methods tests (SPLS-04)
  // ---------------------------------------------------------------------------

  describe('methods (SPLS-04)', () => {
    it('show() sets open to true', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      expect(page.rootInstance.open).toBe(true);
    });

    it('hide() sets open to false', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      page.rootInstance.open = true;
      await page.waitForChanges();

      await page.rootInstance.hide();
      await page.waitForChanges();

      expect(page.rootInstance.open).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Dismiss tests (SPLS-03, SPLS-05)
  // ---------------------------------------------------------------------------

  describe('dismiss (SPLS-03, SPLS-05)', () => {
    it('handleCloseClick emits splashClose with reason "button" and sets open to false', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      page.rootInstance.open = true;
      await page.waitForChanges();

      const spy = jest.fn();
      page.root?.addEventListener('splashClose', spy);

      page.rootInstance['handleCloseClick']();
      await page.waitForChanges();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0].detail).toEqual({ reason: 'button' });
      expect(page.rootInstance.open).toBe(false);
    });

    it('close button click emits splashClose with reason "button"', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      const spy = jest.fn();
      page.root?.addEventListener('splashClose', spy);

      const closeBtn = page.root?.shadowRoot?.querySelector('.close-button') as HTMLElement;
      closeBtn?.click();

      await page.waitForChanges();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0].detail.reason).toBe('button');
    });

    it('handleKeydown with Escape key emits splashClose with reason "escape" when closeOnEscape=true', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      page.rootInstance.open = true;
      await page.waitForChanges();

      const spy = jest.fn();
      page.root?.addEventListener('splashClose', spy);

      page.rootInstance['handleKeydown'](new KeyboardEvent('keydown', { key: 'Escape' }));
      await page.waitForChanges();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0].detail).toEqual({ reason: 'escape' });
    });

    it('handleKeydown with Escape key does NOT emit when closeOnEscape=false', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash close-on-escape="false"></sp-splash>',
      });

      page.rootInstance.open = true;
      await page.waitForChanges();

      const spy = jest.fn();
      page.root?.addEventListener('splashClose', spy);

      page.rootInstance['handleKeydown'](new KeyboardEvent('keydown', { key: 'Escape' }));
      await page.waitForChanges();

      expect(spy).not.toHaveBeenCalled();
    });

    it('handleKeydown with a non-Escape key does NOT emit', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      page.rootInstance.open = true;
      await page.waitForChanges();

      const spy = jest.fn();
      page.root?.addEventListener('splashClose', spy);

      page.rootInstance['handleKeydown'](new KeyboardEvent('keydown', { key: 'Enter' }));
      await page.waitForChanges();

      expect(spy).not.toHaveBeenCalled();
    });

    it('handleBackdropClick emits splashClose with reason "backdrop" when target===currentTarget and closeOnBackdrop=true', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      page.rootInstance.open = true;
      await page.waitForChanges();

      const spy = jest.fn();
      page.root?.addEventListener('splashClose', spy);

      // Create a mock MouseEvent where target === currentTarget (backdrop click)
      const overlayEl = page.root?.shadowRoot?.querySelector('.splash-overlay') as HTMLElement;
      const mockEvent = { target: overlayEl, currentTarget: overlayEl } as unknown as MouseEvent;

      page.rootInstance['handleBackdropClick'](mockEvent);
      await page.waitForChanges();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0].detail).toEqual({ reason: 'backdrop' });
    });

    it('handleBackdropClick does NOT emit when target !== currentTarget (inner element click)', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      page.rootInstance.open = true;
      await page.waitForChanges();

      const spy = jest.fn();
      page.root?.addEventListener('splashClose', spy);

      // target is inner container, not the overlay itself
      const overlayEl = page.root?.shadowRoot?.querySelector('.splash-overlay') as HTMLElement;
      const containerEl = page.root?.shadowRoot?.querySelector('.splash-container') as HTMLElement;
      const mockEvent = { target: containerEl, currentTarget: overlayEl } as unknown as MouseEvent;

      page.rootInstance['handleBackdropClick'](mockEvent);
      await page.waitForChanges();

      expect(spy).not.toHaveBeenCalled();
    });

    it('handleBackdropClick does NOT emit when closeOnBackdrop=false', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash close-on-backdrop="false"></sp-splash>',
      });

      page.rootInstance.open = true;
      await page.waitForChanges();

      const spy = jest.fn();
      page.root?.addEventListener('splashClose', spy);

      const overlayEl = page.root?.shadowRoot?.querySelector('.splash-overlay') as HTMLElement;
      const mockEvent = { target: overlayEl, currentTarget: overlayEl } as unknown as MouseEvent;

      page.rootInstance['handleBackdropClick'](mockEvent);
      await page.waitForChanges();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Cleanup tests
  // ---------------------------------------------------------------------------

  describe('cleanup', () => {
    it('disconnectedCallback does not throw (cleanup runs cleanly)', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      expect(() => page.rootInstance.disconnectedCallback()).not.toThrow();
    });

    it('disconnectedCallback cleans up when open was true', async () => {
      const page = await newSpecPage({
        components: [SpSplash],
        html: '<sp-splash></sp-splash>',
      });

      page.rootInstance.open = true;
      await page.waitForChanges();

      expect(() => page.rootInstance.disconnectedCallback()).not.toThrow();
    });
  });

});
