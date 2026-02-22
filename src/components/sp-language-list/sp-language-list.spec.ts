import { newSpecPage } from '@stencil/core/testing';
import { SpLanguageList } from './sp-language-list';
import { LANGUAGES } from '../sp-language-selector/utils/languages';

describe('sp-language-list', () => {

  // ---------------------------------------------------------------------------
  // Rendering tests
  // ---------------------------------------------------------------------------

  describe('rendering', () => {
    it('renders a language list container', async () => {
      const page = await newSpecPage({
        components: [SpLanguageList],
        html: '<sp-language-list></sp-language-list>',
      });

      const container = page.root?.shadowRoot?.querySelector('.language-list');
      expect(container).toBeTruthy();
    });

    it('renders all languages from the LANGUAGES array by default', async () => {
      const page = await newSpecPage({
        components: [SpLanguageList],
        html: '<sp-language-list></sp-language-list>',
      });

      await page.waitForChanges();
      const items = page.root?.shadowRoot?.querySelectorAll('.language-item');
      expect(items?.length).toBe(LANGUAGES.length);
    });

    it('languages prop defaults to the full LANGUAGES array', async () => {
      const page = await newSpecPage({
        components: [SpLanguageList],
        html: '<sp-language-list></sp-language-list>',
      });

      expect(page.rootInstance.languages).toBe(LANGUAGES);
    });

    it('language items display nativeName and English name', async () => {
      const page = await newSpecPage({
        components: [SpLanguageList],
        html: '<sp-language-list></sp-language-list>',
      });

      // German is in the LANGUAGES array
      const nativeSpans = page.root?.shadowRoot?.querySelectorAll('.language-native');
      const englishSpans = page.root?.shadowRoot?.querySelectorAll('.language-english');
      expect(nativeSpans?.length).toBeGreaterThan(0);
      expect(englishSpans?.length).toBeGreaterThan(0);

      // Find German item
      let foundGerman = false;
      nativeSpans?.forEach((span, i) => {
        if (span.textContent === 'Deutsch') {
          foundGerman = true;
          expect(englishSpans?.[i].textContent).toContain('German');
        }
      });
      expect(foundGerman).toBe(true);
    });

    it('has role="listbox" on the container', async () => {
      const page = await newSpecPage({
        components: [SpLanguageList],
        html: '<sp-language-list></sp-language-list>',
      });

      const container = page.root?.shadowRoot?.querySelector('[role="listbox"]');
      expect(container).toBeTruthy();
    });
  });

  // ---------------------------------------------------------------------------
  // Preferred section tests (LANG-02)
  // ---------------------------------------------------------------------------

  describe('preferred sections (LANG-02)', () => {
    it('renders "Preferred" header, preferred items, separator, "All Languages" header', async () => {
      const page = await newSpecPage({
        components: [SpLanguageList],
        html: '<sp-language-list></sp-language-list>',
      });

      // Set preferredLanguages using known codes from the LANGUAGES array
      page.root!.setAttribute('preferred-languages', '');
      // Use rootInstance to set the prop since it's already loaded
      // preferredLanguages is not mutable-locked — it's a regular Prop
      (page.rootInstance as any).preferredLanguages = ['en', 'fr'];
      await page.waitForChanges();

      const headers = page.root?.shadowRoot?.querySelectorAll('.section-header');
      expect(headers?.length).toBe(2);
      expect(headers?.[0].textContent).toBe('Preferred');
      expect(headers?.[1].textContent).toBe('All Languages');

      const separator = page.root?.shadowRoot?.querySelector('hr.separator');
      expect(separator).toBeTruthy();

      // All items from LANGUAGES should be rendered
      const items = page.root?.shadowRoot?.querySelectorAll('.language-item');
      expect(items?.length).toBe(LANGUAGES.length);
    });

    it('renders only the alphabetical list when preferredLanguages is empty (default)', async () => {
      const page = await newSpecPage({
        components: [SpLanguageList],
        html: '<sp-language-list></sp-language-list>',
      });

      // Default preferredLanguages is []
      const headers = page.root?.shadowRoot?.querySelectorAll('.section-header');
      expect(headers?.length).toBe(0);

      const separator = page.root?.shadowRoot?.querySelector('hr.separator');
      expect(separator).toBeFalsy();
    });

    it('preferred items appear in the order specified by preferredLanguages array', async () => {
      const page = await newSpecPage({
        components: [SpLanguageList],
        html: '<sp-language-list></sp-language-list>',
      });

      // fr before en — order should be preserved
      (page.rootInstance as any).preferredLanguages = ['fr', 'en'];
      await page.waitForChanges();

      // The first two items should be fr then en (preferred section)
      const allItems = page.root?.shadowRoot?.querySelectorAll('.language-item');
      expect(allItems?.[0].querySelector('.language-native')?.textContent).toBe('Français');
      expect(allItems?.[1].querySelector('.language-native')?.textContent).toBe('English');
    });

    it('preferred items do not appear in the "All Languages" section', async () => {
      const page = await newSpecPage({
        components: [SpLanguageList],
        html: '<sp-language-list></sp-language-list>',
      });

      (page.rootInstance as any).preferredLanguages = ['en'];
      await page.waitForChanges();

      // Total items = LANGUAGES.length (preferred items not duplicated in All)
      const items = page.root?.shadowRoot?.querySelectorAll('.language-item');
      expect(items?.length).toBe(LANGUAGES.length);

      // Count how many "English" native names appear
      const englishNativeCount = Array.from(items || [])
        .filter(el => el.querySelector('.language-native')?.textContent === 'English')
        .length;
      expect(englishNativeCount).toBe(1); // Only appears once
    });
  });

  // ---------------------------------------------------------------------------
  // Selection tests (LANG-03, LANG-04)
  // ---------------------------------------------------------------------------

  describe('selection (LANG-03, LANG-04)', () => {
    it('default selectedLanguage is "en" and the English item has ".selected" class', async () => {
      const page = await newSpecPage({
        components: [SpLanguageList],
        html: '<sp-language-list></sp-language-list>',
      });

      expect(page.rootInstance.selectedLanguage).toBe('en');

      const items = page.root?.shadowRoot?.querySelectorAll('.language-item');
      const enItem = Array.from(items || []).find(el => el.querySelector('.language-native')?.textContent === 'English');
      expect(enItem?.classList.contains('selected')).toBe(true);
    });

    it('changing selectedLanguage prop marks correct item as selected', async () => {
      const page = await newSpecPage({
        components: [SpLanguageList],
        html: '<sp-language-list selected-language="fr"></sp-language-list>',
      });

      const items = page.root?.shadowRoot?.querySelectorAll('.language-item');
      const frItem = Array.from(items || []).find(el => el.querySelector('.language-native')?.textContent === 'Français');
      const enItem = Array.from(items || []).find(el => el.querySelector('.language-native')?.textContent === 'English');

      expect(frItem?.classList.contains('selected')).toBe(true);
      expect(enItem?.classList.contains('selected')).toBe(false);
    });

    it('selected item has aria-selected="true"', async () => {
      const page = await newSpecPage({
        components: [SpLanguageList],
        html: '<sp-language-list selected-language="en"></sp-language-list>',
      });

      const items = page.root?.shadowRoot?.querySelectorAll('[role="option"]');
      const enItem = Array.from(items || []).find(el => el.querySelector('.language-native')?.textContent === 'English');
      expect(enItem?.getAttribute('aria-selected')).toBe('true');
    });

    it('non-selected items have aria-selected="false"', async () => {
      const page = await newSpecPage({
        components: [SpLanguageList],
        html: '<sp-language-list selected-language="en"></sp-language-list>',
      });

      const items = page.root?.shadowRoot?.querySelectorAll('[role="option"]');
      const frItem = Array.from(items || []).find(el => el.querySelector('.language-native')?.textContent === 'Français');
      expect(frItem?.getAttribute('aria-selected')).toBe('false');
    });

    it('each language item has a check-icon span element', async () => {
      const page = await newSpecPage({
        components: [SpLanguageList],
        html: '<sp-language-list></sp-language-list>',
      });

      const checkIcons = page.root?.shadowRoot?.querySelectorAll('.check-icon');
      expect(checkIcons?.length).toBeGreaterThan(0);
    });

    it('clicking a language item emits languageChange event with correct { code, name } detail', async () => {
      const page = await newSpecPage({
        components: [SpLanguageList],
        html: '<sp-language-list></sp-language-list>',
      });

      const spy = jest.fn();
      page.root?.addEventListener('languageChange', spy);

      // Find and click the French item
      const items = page.root?.shadowRoot?.querySelectorAll('.language-item');
      const frItem = Array.from(items || []).find(el => el.querySelector('.language-native')?.textContent === 'Français') as HTMLElement;
      frItem?.click();

      await page.waitForChanges();

      expect(spy).toHaveBeenCalledTimes(1);
      const detail = spy.mock.calls[0][0].detail;
      expect(detail.code).toBe('fr');
      expect(detail.name).toBe('French');
    });
  });

  // ---------------------------------------------------------------------------
  // Interaction tests
  // ---------------------------------------------------------------------------

  describe('interaction', () => {
    it('each language item has role="option"', async () => {
      const page = await newSpecPage({
        components: [SpLanguageList],
        html: '<sp-language-list></sp-language-list>',
      });

      const items = page.root?.shadowRoot?.querySelectorAll('[role="option"]');
      expect(items?.length).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Prop tests (LANG-06)
  // ---------------------------------------------------------------------------

  describe('props (LANG-06)', () => {
    it('compact mode adds ".compact" class to container', async () => {
      const page = await newSpecPage({
        components: [SpLanguageList],
        html: '<sp-language-list compact="true"></sp-language-list>',
      });

      const container = page.root?.shadowRoot?.querySelector('.language-list');
      expect(container?.classList.contains('compact')).toBe(true);
    });

    it('compact=false does not add ".compact" class', async () => {
      const page = await newSpecPage({
        components: [SpLanguageList],
        html: '<sp-language-list></sp-language-list>',
      });

      const container = page.root?.shadowRoot?.querySelector('.language-list');
      expect(container?.classList.contains('compact')).toBe(false);
    });

    it('theme="dark" sets theme-dark class on host', async () => {
      const page = await newSpecPage({
        components: [SpLanguageList],
        html: '<sp-language-list theme="dark"></sp-language-list>',
      });

      expect(page.root).toHaveClass('theme-dark');
    });

    it('theme="light" sets theme-light class on host', async () => {
      const page = await newSpecPage({
        components: [SpLanguageList],
        html: '<sp-language-list theme="light"></sp-language-list>',
      });

      expect(page.root).toHaveClass('theme-light');
    });

    it('theme="auto" (default) does not set theme class on host', async () => {
      const page = await newSpecPage({
        components: [SpLanguageList],
        html: '<sp-language-list></sp-language-list>',
      });

      expect(page.root).not.toHaveClass('theme-dark');
      expect(page.root).not.toHaveClass('theme-light');
    });

    it('selectedLanguage defaults to "en"', async () => {
      const page = await newSpecPage({
        components: [SpLanguageList],
        html: '<sp-language-list></sp-language-list>',
      });

      expect(page.rootInstance.selectedLanguage).toBe('en');
    });
  });

});
