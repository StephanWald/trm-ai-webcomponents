import { Component, Prop, Event, EventEmitter, Host, h } from '@stencil/core';
import { LanguageInfo, LanguageChangeEventDetail } from '../sp-language-selector/types';
import { LANGUAGES } from '../sp-language-selector/utils/languages';
import { renderCheckIcon } from '../sp-language-selector/utils/icons';

/**
 * Dropdown panel displaying available languages, grouped by browser preference.
 *
 * @part container - Root scrollable container
 * @part section-header - Section label ("Preferred" / "All Languages")
 * @part language-item - Individual language row
 */
@Component({
  tag: 'sp-language-list',
  styleUrl: 'sp-language-list.css',
  shadow: true,
})
export class SpLanguageList {
  /**
   * Full list of available languages to display.
   * Defaults to the bundled LANGUAGES array.
   */
  @Prop() languages: LanguageInfo[] = LANGUAGES;

  /**
   * Currently selected language code (LANG-04).
   * The matching item shows a checkmark.
   */
  @Prop() selectedLanguage: string = 'en';

  /**
   * Browser-preferred language codes in order of preference.
   * When non-empty, renders a "Preferred" section at the top.
   */
  @Prop() preferredLanguages: string[] = [];

  /**
   * Theme override for standalone usage.
   * @type {'light' | 'dark' | 'auto'}
   */
  @Prop() theme: 'light' | 'dark' | 'auto' = 'auto';

  /**
   * Compact mode — smaller font size and padding.
   */
  @Prop() compact: boolean = false;

  /**
   * Emitted when the user selects a language (LANG-03).
   */
  @Event() languageChange: EventEmitter<LanguageChangeEventDetail>;

  private handleLanguageClick(lang: LanguageInfo) {
    this.languageChange.emit({ code: lang.code, name: lang.name });
  }

  private renderLanguageItem(lang: LanguageInfo) {
    const isSelected = lang.code === this.selectedLanguage;
    return (
      <div
        key={lang.code}
        class={{ 'language-item': true, selected: isSelected }}
        part="language-item"
        role="option"
        aria-selected={isSelected.toString()}
        onClick={() => this.handleLanguageClick(lang)}
      >
        <span class="check-icon">{renderCheckIcon(16)}</span>
        <span class="language-native">{lang.nativeName}</span>
        <span class="language-english">({lang.name})</span>
      </div>
    );
  }

  render() {
    const hostClass = {
      'theme-light': this.theme === 'light',
      'theme-dark': this.theme === 'dark',
    };

    // Split into preferred and others
    const preferredSet = new Set(this.preferredLanguages);
    const preferredList = this.preferredLanguages
      .map(code => this.languages.find(l => l.code === code))
      .filter((l): l is LanguageInfo => l !== undefined);

    const othersList = this.languages
      .filter(l => !preferredSet.has(l.code))
      .sort((a, b) => a.name.localeCompare(b.name));

    const hasPreferred = preferredList.length > 0;

    return (
      <Host class={hostClass}>
        <div
          class={{ 'language-list': true, compact: this.compact }}
          part="container"
          role="listbox"
          aria-label="Select language"
        >
          {hasPreferred && [
            <div class="section-header" part="section-header">Preferred</div>,
            ...preferredList.map(lang => this.renderLanguageItem(lang)),
            <hr class="separator" />,
            <div class="section-header" part="section-header">All Languages</div>,
          ]}
          {othersList.map(lang => this.renderLanguageItem(lang))}
        </div>
      </Host>
    );
  }
}
