import { LanguageInfo } from '../types';

/**
 * Comprehensive list of common languages with ISO 639-1 codes,
 * English names, and native names.
 */
export const LANGUAGES: LanguageInfo[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'th', name: 'Thai', nativeName: 'ภาษาไทย' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
];

/**
 * Returns language codes that the browser prefers and that exist in the LANGUAGES array.
 * Reads navigator.languages (with navigator.language fallback), extracts 2-letter codes,
 * deduplicates, and filters to known languages.
 */
export function getBrowserPreferredLanguages(): string[] {
  if (typeof navigator === 'undefined') {
    return [];
  }

  // Get raw language tags from browser
  const rawLanguages: string[] = [];
  if (navigator.languages && navigator.languages.length > 0) {
    rawLanguages.push(...Array.from(navigator.languages));
  } else if (navigator.language) {
    rawLanguages.push(navigator.language);
  }

  // Extract 2-letter codes, deduplicate, filter to known languages
  const seen = new Set<string>();
  const result: string[] = [];

  for (const lang of rawLanguages) {
    // Strip region suffix: "en-US" → "en"
    const code = lang.split('-')[0].toLowerCase();
    if (!seen.has(code)) {
      seen.add(code);
      // Only include codes that exist in LANGUAGES
      if (LANGUAGES.some(l => l.code === code)) {
        result.push(code);
      }
    }
  }

  return result;
}

/**
 * Look up a language by its ISO 639-1 code.
 * Returns undefined if the code is not in the LANGUAGES array.
 */
export function getLanguageByCode(code: string): LanguageInfo | undefined {
  return LANGUAGES.find(l => l.code === code);
}
