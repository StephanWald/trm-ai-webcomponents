import { newSpecPage } from '@stencil/core/testing';
import { SpLanguageSelector } from './sp-language-selector';

// Note: Only SpLanguageSelector in components array — child components (sp-popover, sp-language-list)
// render as their custom element tags without being inflated. We test the selector's own logic.

describe('sp-language-selector', () => {

  // ---------------------------------------------------------------------------
  // Rendering tests (LANG-01)
  // ---------------------------------------------------------------------------

  describe('rendering (LANG-01)', () => {
    it('renders a button with ".selector-button" class', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector></sp-language-selector>',
      });

      const button = page.root?.shadowRoot?.querySelector('.selector-button');
      expect(button).toBeTruthy();
    });

    it('button contains a lang-code span that displays language in uppercase', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector></sp-language-selector>',
      });

      const langCode = page.root?.shadowRoot?.querySelector('.lang-code');
      expect(langCode).toBeTruthy();
      expect(langCode?.textContent).toBe('EN'); // default is 'en' → 'EN'
    });

    it('button contains a chevron span', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector></sp-language-selector>',
      });

      const chevron = page.root?.shadowRoot?.querySelector('.chevron');
      expect(chevron).toBeTruthy();
    });

    it('renders sp-popover element in shadow DOM', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector></sp-language-selector>',
      });

      const popover = page.root?.shadowRoot?.querySelector('sp-popover');
      expect(popover).toBeTruthy();
    });

    it('renders sp-language-list element inside the popover', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector></sp-language-selector>',
      });

      const langList = page.root?.shadowRoot?.querySelector('sp-language-list');
      expect(langList).toBeTruthy();
    });

    it('default selectedLanguage is "en" → shows "EN"', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector></sp-language-selector>',
      });

      expect(page.rootInstance.selectedLanguage).toBe('en');
      const langCode = page.root?.shadowRoot?.querySelector('.lang-code');
      expect(langCode?.textContent).toBe('EN');
    });

    it('button has aria-haspopup="listbox"', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector></sp-language-selector>',
      });

      const button = page.root?.shadowRoot?.querySelector('button');
      expect(button?.getAttribute('aria-haspopup')).toBe('listbox');
    });
  });

  // ---------------------------------------------------------------------------
  // Props tests
  // ---------------------------------------------------------------------------

  describe('props', () => {
    it('changing selectedLanguage updates the displayed code text', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector selected-language="fr"></sp-language-selector>',
      });

      const langCode = page.root?.shadowRoot?.querySelector('.lang-code');
      expect(langCode?.textContent).toBe('FR');
    });

    it('disabled prop adds disabled attribute to button', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector disabled></sp-language-selector>',
      });

      const button = page.root?.shadowRoot?.querySelector('button');
      // In Stencil's test env, disabled is an attribute on the element
      expect(button?.hasAttribute('disabled')).toBe(true);
    });

    it('compact mode adds ".compact" class to button', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector compact></sp-language-selector>',
      });

      const button = page.root?.shadowRoot?.querySelector('.selector-button');
      expect(button?.classList.contains('compact')).toBe(true);
    });

    it('theme="dark" sets theme-dark class on host', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector theme="dark"></sp-language-selector>',
      });

      expect(page.root).toHaveClass('theme-dark');
    });

    it('theme="light" sets theme-light class on host', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector theme="light"></sp-language-selector>',
      });

      expect(page.root).toHaveClass('theme-light');
    });

    it('theme="auto" (default) does not set theme class on host', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector></sp-language-selector>',
      });

      expect(page.root).not.toHaveClass('theme-dark');
      expect(page.root).not.toHaveClass('theme-light');
    });
  });

  // ---------------------------------------------------------------------------
  // State tests
  // ---------------------------------------------------------------------------

  describe('state', () => {
    it('isOpen defaults to false', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector></sp-language-selector>',
      });

      expect(page.rootInstance.isOpen).toBe(false);
    });

    it('button does not have ".open" class when isOpen=false', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector></sp-language-selector>',
      });

      const button = page.root?.shadowRoot?.querySelector('.selector-button');
      expect(button?.classList.contains('open')).toBe(false);
    });

    it('button has ".open" class when isOpen=true', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector></sp-language-selector>',
      });

      page.rootInstance.isOpen = true;
      await page.waitForChanges();

      const button = page.root?.shadowRoot?.querySelector('.selector-button');
      expect(button?.classList.contains('open')).toBe(true);
    });

    it('chevron has ".open" class when isOpen=true', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector></sp-language-selector>',
      });

      page.rootInstance.isOpen = true;
      await page.waitForChanges();

      const chevron = page.root?.shadowRoot?.querySelector('.chevron');
      expect(chevron?.classList.contains('open')).toBe(true);
    });

    it('button has aria-expanded="false" when closed', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector></sp-language-selector>',
      });

      const button = page.root?.shadowRoot?.querySelector('button');
      expect(button?.getAttribute('aria-expanded')).toBe('false');
    });

    it('button has aria-expanded="true" when open', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector></sp-language-selector>',
      });

      page.rootInstance.isOpen = true;
      await page.waitForChanges();

      const button = page.root?.shadowRoot?.querySelector('button');
      expect(button?.getAttribute('aria-expanded')).toBe('true');
    });
  });

  // ---------------------------------------------------------------------------
  // Event handling
  // ---------------------------------------------------------------------------

  describe('event handling', () => {
    it('disabled button does not call togglePopover when clicked', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector disabled></sp-language-selector>',
      });

      const instance = page.rootInstance;
      // Call handleButtonClick — because disabled=true, it should return early
      // (popoverRef?.togglePopover() is never called)
      instance['handleButtonClick']();
      await page.waitForChanges();

      // isOpen should remain false since toggle was never called
      expect(instance.isOpen).toBe(false);
    });

    it('dispatching languageChange from sp-language-list updates selectedLanguage and re-emits', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector></sp-language-selector>',
      });

      const spy = jest.fn();
      page.root?.addEventListener('languageChange', spy);

      // Stub out popoverRef to prevent null call error
      page.rootInstance['popoverRef'] = { hidePopover: jest.fn() } as any;

      // Simulate the handleLanguageSelected being called
      page.rootInstance['handleLanguageSelected'](
        new CustomEvent('languageChange', { detail: { code: 'de', name: 'German' } })
      );
      await page.waitForChanges();

      expect(page.rootInstance.selectedLanguage).toBe('de');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0].detail).toEqual({ code: 'de', name: 'German' });
    });

    it('handlePopoverOpen sets isOpen to true', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector></sp-language-selector>',
      });

      page.rootInstance['handlePopoverOpen']();
      await page.waitForChanges();

      expect(page.rootInstance.isOpen).toBe(true);
    });

    it('handlePopoverClose sets isOpen to false', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector></sp-language-selector>',
      });

      page.rootInstance.isOpen = true;
      await page.waitForChanges();

      page.rootInstance['handlePopoverClose']();
      await page.waitForChanges();

      expect(page.rootInstance.isOpen).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Auto-hide timer (LANG-05)
  // ---------------------------------------------------------------------------

  describe('auto-hide timer (LANG-05)', () => {
    it('mouse leave starts a timeout timer', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector></sp-language-selector>',
      });

      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      page.rootInstance['handleMouseLeave']();

      expect(setTimeoutSpy).toHaveBeenCalled();

      setTimeoutSpy.mockRestore();
    });

    it('mouse enter clears the auto-hide timer', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector></sp-language-selector>',
      });

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      // Start a timer first, then mouse enter clears it
      page.rootInstance['handleMouseLeave']();
      page.rootInstance['handleMouseEnter']();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });

    it('disconnectedCallback clears any active timer', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector></sp-language-selector>',
      });

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      // Set a timer
      page.rootInstance['handleMouseLeave']();
      // Disconnect the component
      page.rootInstance.disconnectedCallback();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });

    it('autoHideTimer is set after mouse leave', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector></sp-language-selector>',
      });

      jest.useFakeTimers();

      page.rootInstance['handleMouseLeave']();

      // Timer should be set (not null)
      expect(page.rootInstance['autoHideTimer']).not.toBeNull();

      jest.useRealTimers();
    });

    it('autoHideTimer is null after disconnectedCallback clears it', async () => {
      const page = await newSpecPage({
        components: [SpLanguageSelector],
        html: '<sp-language-selector></sp-language-selector>',
      });

      jest.useFakeTimers();

      page.rootInstance['handleMouseLeave']();
      expect(page.rootInstance['autoHideTimer']).not.toBeNull();

      page.rootInstance.disconnectedCallback();
      expect(page.rootInstance['autoHideTimer']).toBeNull();

      jest.useRealTimers();
    });
  });

});
