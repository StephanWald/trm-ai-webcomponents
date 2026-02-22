/**
 * Represents a single language option in the language selector
 */
export interface LanguageInfo {
  /** ISO 639-1 two-letter language code (e.g. 'en', 'de', 'fr') */
  code: string;
  /** English name of the language (e.g. 'German') */
  name: string;
  /** Native name of the language (e.g. 'Deutsch') */
  nativeName: string;
}

/**
 * Event payload emitted when user selects a language (LANG-03)
 */
export interface LanguageChangeEventDetail {
  /** ISO 639-1 language code of the selected language */
  code: string;
  /** English name of the selected language */
  name: string;
}
