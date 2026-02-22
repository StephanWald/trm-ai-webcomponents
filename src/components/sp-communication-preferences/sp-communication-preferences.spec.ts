import { newSpecPage } from '@stencil/core/testing';
import { SpCommunicationPreferences } from './sp-communication-preferences';

// Note: Only SpCommunicationPreferences in the components array — child components
// (sp-popover, sp-communication-list) render as uninflated custom element stubs.
// We test the preferences selector's own logic and rendered structure.

describe('sp-communication-preferences', () => {

  // ---------------------------------------------------------------------------
  // Rendering tests (COMM-01)
  // ---------------------------------------------------------------------------

  describe('rendering (COMM-01)', () => {
    it('renders a button with .selector-button class', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences></sp-communication-preferences>',
      });

      const button = page.root?.shadowRoot?.querySelector('.selector-button');
      expect(button).toBeTruthy();
    });

    it('button contains an SVG icon (channel icon)', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences></sp-communication-preferences>',
      });

      const svg = page.root?.shadowRoot?.querySelector('.selector-button svg');
      expect(svg).toBeTruthy();
    });

    it('button contains a .channel-label span with the channel display name', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences></sp-communication-preferences>',
      });

      const label = page.root?.shadowRoot?.querySelector('.channel-label');
      expect(label).toBeTruthy();
      expect(label?.textContent).toBe('Application');
    });

    it('button contains a .chevron span', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences></sp-communication-preferences>',
      });

      const chevron = page.root?.shadowRoot?.querySelector('.chevron');
      expect(chevron).toBeTruthy();
    });

    it('renders sp-popover element in shadow DOM', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences></sp-communication-preferences>',
      });

      const popover = page.root?.shadowRoot?.querySelector('sp-popover');
      expect(popover).toBeTruthy();
    });

    it('renders sp-communication-list inside the popover', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences></sp-communication-preferences>',
      });

      const commList = page.root?.shadowRoot?.querySelector('sp-communication-list');
      expect(commList).toBeTruthy();
    });

    it('default selectedChannel is "APPLICATION"', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences></sp-communication-preferences>',
      });

      expect(page.rootInstance.selectedChannel).toBe('APPLICATION');
    });

    it('button has aria-haspopup="listbox"', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences></sp-communication-preferences>',
      });

      const button = page.root?.shadowRoot?.querySelector('button');
      expect(button?.getAttribute('aria-haspopup')).toBe('listbox');
    });
  });

  // ---------------------------------------------------------------------------
  // Props tests
  // ---------------------------------------------------------------------------

  describe('props', () => {
    it('changing selectedChannel updates the displayed label', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences selected-channel="EMAIL"></sp-communication-preferences>',
      });

      const label = page.root?.shadowRoot?.querySelector('.channel-label');
      expect(label?.textContent).toBe('Email');
    });

    it('selectedChannel="WHATSAPP" shows "WhatsApp" label', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences selected-channel="WHATSAPP"></sp-communication-preferences>',
      });

      const label = page.root?.shadowRoot?.querySelector('.channel-label');
      expect(label?.textContent).toBe('WhatsApp');
    });

    it('disabled prop adds disabled attribute to button', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences disabled></sp-communication-preferences>',
      });

      const button = page.root?.shadowRoot?.querySelector('button');
      expect(button?.hasAttribute('disabled')).toBe(true);
    });

    it('compact mode adds .compact class to button', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences compact></sp-communication-preferences>',
      });

      const button = page.root?.shadowRoot?.querySelector('.selector-button');
      expect(button?.classList.contains('compact')).toBe(true);
    });

    it('compact=false does not add .compact class to button', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences></sp-communication-preferences>',
      });

      const button = page.root?.shadowRoot?.querySelector('.selector-button');
      expect(button?.classList.contains('compact')).toBe(false);
    });

    it('theme="dark" sets theme-dark class on host', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences theme="dark"></sp-communication-preferences>',
      });

      expect(page.root).toHaveClass('theme-dark');
    });

    it('theme="light" sets theme-light class on host', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences theme="light"></sp-communication-preferences>',
      });

      expect(page.root).toHaveClass('theme-light');
    });

    it('theme="auto" (default) does not set theme class on host', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences></sp-communication-preferences>',
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
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences></sp-communication-preferences>',
      });

      expect(page.rootInstance.isOpen).toBe(false);
    });

    it('button does not have .open class when isOpen=false', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences></sp-communication-preferences>',
      });

      const button = page.root?.shadowRoot?.querySelector('.selector-button');
      expect(button?.classList.contains('open')).toBe(false);
    });

    it('button has .open class when isOpen=true', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences></sp-communication-preferences>',
      });

      page.rootInstance.isOpen = true;
      await page.waitForChanges();

      const button = page.root?.shadowRoot?.querySelector('.selector-button');
      expect(button?.classList.contains('open')).toBe(true);
    });

    it('chevron has .open class when isOpen=true', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences></sp-communication-preferences>',
      });

      page.rootInstance.isOpen = true;
      await page.waitForChanges();

      const chevron = page.root?.shadowRoot?.querySelector('.chevron');
      expect(chevron?.classList.contains('open')).toBe(true);
    });

    it('button has aria-expanded="false" when closed', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences></sp-communication-preferences>',
      });

      const button = page.root?.shadowRoot?.querySelector('button');
      expect(button?.getAttribute('aria-expanded')).toBe('false');
    });

    it('button has aria-expanded="true" when open', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences></sp-communication-preferences>',
      });

      page.rootInstance.isOpen = true;
      await page.waitForChanges();

      const button = page.root?.shadowRoot?.querySelector('button');
      expect(button?.getAttribute('aria-expanded')).toBe('true');
    });
  });

  // ---------------------------------------------------------------------------
  // Event handling tests
  // ---------------------------------------------------------------------------

  describe('event handling', () => {
    it('disabled button does not toggle popover on click (isOpen stays false)', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences disabled></sp-communication-preferences>',
      });

      const instance = page.rootInstance;
      // Call handleButtonClick — because disabled=true, it should return early
      instance['handleButtonClick']();
      await page.waitForChanges();

      expect(instance.isOpen).toBe(false);
    });

    it('handleChannelSelected updates selectedChannel and re-emits preferenceChange event', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences></sp-communication-preferences>',
      });

      const spy = jest.fn();
      page.root?.addEventListener('preferenceChange', spy);

      // Stub popoverRef to avoid null call errors
      page.rootInstance['popoverRef'] = { hidePopover: jest.fn() } as any;

      page.rootInstance['handleChannelSelected'](
        new CustomEvent('preferenceChange', { detail: { channel: 'EMAIL', label: 'Email' } })
      );
      await page.waitForChanges();

      expect(page.rootInstance.selectedChannel).toBe('EMAIL');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0].detail).toEqual({ channel: 'EMAIL', label: 'Email' });
    });

    it('handleChannelSelected calls popoverRef.hidePopover()', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences></sp-communication-preferences>',
      });

      const hidePopover = jest.fn();
      page.rootInstance['popoverRef'] = { hidePopover } as any;

      page.rootInstance['handleChannelSelected'](
        new CustomEvent('preferenceChange', { detail: { channel: 'PHONE', label: 'Phone' } })
      );
      await page.waitForChanges();

      expect(hidePopover).toHaveBeenCalledTimes(1);
    });

    it('handlePopoverOpen sets isOpen to true', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences></sp-communication-preferences>',
      });

      page.rootInstance['handlePopoverOpen']();
      await page.waitForChanges();

      expect(page.rootInstance.isOpen).toBe(true);
    });

    it('handlePopoverClose sets isOpen to false', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences></sp-communication-preferences>',
      });

      page.rootInstance.isOpen = true;
      await page.waitForChanges();

      page.rootInstance['handlePopoverClose']();
      await page.waitForChanges();

      expect(page.rootInstance.isOpen).toBe(false);
    });

    it('disconnectedCallback does not throw (no-op cleanup)', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationPreferences],
        html: '<sp-communication-preferences></sp-communication-preferences>',
      });

      expect(() => page.rootInstance.disconnectedCallback()).not.toThrow();
    });
  });

});
