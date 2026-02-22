import { newSpecPage } from '@stencil/core/testing';
import { SpCommunicationList } from './sp-communication-list';
import { CHANNELS } from '../sp-communication-preferences/utils/channels';

// Note: Only SpCommunicationList in the components array — child tags render as
// uninflated custom element stubs. We test the list's own rendering and events.

describe('sp-communication-list', () => {

  // ---------------------------------------------------------------------------
  // Rendering tests (COMM-02)
  // ---------------------------------------------------------------------------

  describe('rendering (COMM-02)', () => {
    it('renders a container with .channel-list class', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationList],
        html: '<sp-communication-list></sp-communication-list>',
      });

      const container = page.root?.shadowRoot?.querySelector('.channel-list');
      expect(container).toBeTruthy();
    });

    it('container has role="listbox"', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationList],
        html: '<sp-communication-list></sp-communication-list>',
      });

      const container = page.root?.shadowRoot?.querySelector('[role="listbox"]');
      expect(container).toBeTruthy();
    });

    it('renders 6 channel items by default (one per CHANNELS entry)', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationList],
        html: '<sp-communication-list></sp-communication-list>',
      });

      const items = page.root?.shadowRoot?.querySelectorAll('.channel-item');
      expect(items?.length).toBe(CHANNELS.length);
      expect(items?.length).toBe(6);
    });

    it('each channel item has .channel-item class', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationList],
        html: '<sp-communication-list></sp-communication-list>',
      });

      const items = page.root?.shadowRoot?.querySelectorAll('.channel-item');
      items?.forEach(item => {
        expect(item.classList.contains('channel-item')).toBe(true);
      });
    });

    it('each channel item contains an SVG icon element', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationList],
        html: '<sp-communication-list></sp-communication-list>',
      });

      const items = page.root?.shadowRoot?.querySelectorAll('.channel-item');
      items?.forEach(item => {
        const svg = item.querySelector('.channel-icon svg');
        expect(svg).toBeTruthy();
      });
    });

    it('renders "Application" channel label text', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationList],
        html: '<sp-communication-list></sp-communication-list>',
      });

      const labels = Array.from(
        page.root?.shadowRoot?.querySelectorAll('.channel-label') ?? []
      ).map(el => el.textContent);
      expect(labels).toContain('Application');
    });

    it('renders "Email" channel label text', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationList],
        html: '<sp-communication-list></sp-communication-list>',
      });

      const labels = Array.from(
        page.root?.shadowRoot?.querySelectorAll('.channel-label') ?? []
      ).map(el => el.textContent);
      expect(labels).toContain('Email');
    });

    it('renders all 6 channel labels', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationList],
        html: '<sp-communication-list></sp-communication-list>',
      });

      const labels = Array.from(
        page.root?.shadowRoot?.querySelectorAll('.channel-label') ?? []
      ).map(el => el.textContent);

      expect(labels).toContain('Application');
      expect(labels).toContain('Email');
      expect(labels).toContain('WhatsApp');
      expect(labels).toContain('Phone');
      expect(labels).toContain('MS Teams');
      expect(labels).toContain('Google Chat');
    });
  });

  // ---------------------------------------------------------------------------
  // Props tests
  // ---------------------------------------------------------------------------

  describe('props', () => {
    it('selectedChannel defaults to "APPLICATION"', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationList],
        html: '<sp-communication-list></sp-communication-list>',
      });

      expect(page.rootInstance.selectedChannel).toBe('APPLICATION');
    });

    it('changing selectedChannel marks the correct item as .selected', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationList],
        html: '<sp-communication-list selected-channel="EMAIL"></sp-communication-list>',
      });

      const items = page.root?.shadowRoot?.querySelectorAll('.channel-item');
      const emailItem = Array.from(items ?? []).find(
        el => el.querySelector('.channel-label')?.textContent === 'Email'
      );
      expect(emailItem?.classList.contains('selected')).toBe(true);
    });

    it('theme="dark" sets theme-dark class on host', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationList],
        html: '<sp-communication-list theme="dark"></sp-communication-list>',
      });

      expect(page.root).toHaveClass('theme-dark');
    });

    it('theme="light" sets theme-light class on host', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationList],
        html: '<sp-communication-list theme="light"></sp-communication-list>',
      });

      expect(page.root).toHaveClass('theme-light');
    });

    it('theme="auto" (default) does not set theme class on host', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationList],
        html: '<sp-communication-list></sp-communication-list>',
      });

      expect(page.root).not.toHaveClass('theme-dark');
      expect(page.root).not.toHaveClass('theme-light');
    });

    it('compact mode adds .compact class to the list container', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationList],
        html: '<sp-communication-list compact="true"></sp-communication-list>',
      });

      const container = page.root?.shadowRoot?.querySelector('.channel-list');
      expect(container?.classList.contains('compact')).toBe(true);
    });

    it('compact=false does not add .compact class', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationList],
        html: '<sp-communication-list></sp-communication-list>',
      });

      const container = page.root?.shadowRoot?.querySelector('.channel-list');
      expect(container?.classList.contains('compact')).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Selection tests (COMM-03, COMM-04)
  // ---------------------------------------------------------------------------

  describe('selection (COMM-03, COMM-04)', () => {
    it('selected channel item has .selected class', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationList],
        html: '<sp-communication-list selected-channel="APPLICATION"></sp-communication-list>',
      });

      const items = page.root?.shadowRoot?.querySelectorAll('.channel-item');
      const appItem = Array.from(items ?? []).find(
        el => el.querySelector('.channel-label')?.textContent === 'Application'
      );
      expect(appItem?.classList.contains('selected')).toBe(true);
    });

    it('selected channel item has aria-selected="true"', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationList],
        html: '<sp-communication-list selected-channel="EMAIL"></sp-communication-list>',
      });

      const items = page.root?.shadowRoot?.querySelectorAll('[role="option"]');
      const emailItem = Array.from(items ?? []).find(
        el => el.querySelector('.channel-label')?.textContent === 'Email'
      );
      expect(emailItem?.getAttribute('aria-selected')).toBe('true');
    });

    it('non-selected items do not have .selected class', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationList],
        html: '<sp-communication-list selected-channel="APPLICATION"></sp-communication-list>',
      });

      const items = page.root?.shadowRoot?.querySelectorAll('.channel-item');
      const emailItem = Array.from(items ?? []).find(
        el => el.querySelector('.channel-label')?.textContent === 'Email'
      );
      expect(emailItem?.classList.contains('selected')).toBe(false);
    });

    it('each channel item has a check-icon span', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationList],
        html: '<sp-communication-list></sp-communication-list>',
      });

      const checkIcons = page.root?.shadowRoot?.querySelectorAll('.check-icon');
      expect(checkIcons?.length).toBe(6);
    });

    it('clicking a channel item emits preferenceChange event with correct channel and label', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationList],
        html: '<sp-communication-list></sp-communication-list>',
      });

      const spy = jest.fn();
      page.root?.addEventListener('preferenceChange', spy);

      // Click the Email item
      const items = page.root?.shadowRoot?.querySelectorAll('.channel-item');
      const emailItem = Array.from(items ?? []).find(
        el => el.querySelector('.channel-label')?.textContent === 'Email'
      ) as HTMLElement;
      emailItem?.click();

      await page.waitForChanges();

      expect(spy).toHaveBeenCalledTimes(1);
      const detail = spy.mock.calls[0][0].detail;
      expect(detail.channel).toBe('EMAIL');
      expect(detail.label).toBe('Email');
    });

    it('event detail contains { channel: "EMAIL", label: "Email" } when Email is clicked', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationList],
        html: '<sp-communication-list></sp-communication-list>',
      });

      const spy = jest.fn();
      page.root?.addEventListener('preferenceChange', spy);

      const items = page.root?.shadowRoot?.querySelectorAll('.channel-item');
      const emailItem = Array.from(items ?? []).find(
        el => el.querySelector('.channel-label')?.textContent === 'Email'
      ) as HTMLElement;
      emailItem?.click();

      await page.waitForChanges();

      expect(spy.mock.calls[0][0].detail).toEqual({ channel: 'EMAIL', label: 'Email' });
    });

    it('each channel item has role="option"', async () => {
      const page = await newSpecPage({
        components: [SpCommunicationList],
        html: '<sp-communication-list></sp-communication-list>',
      });

      const options = page.root?.shadowRoot?.querySelectorAll('[role="option"]');
      expect(options?.length).toBe(6);
    });
  });

});
