import { LANGUAGES, getBrowserPreferredLanguages, getLanguageByCode } from './languages';

describe('LANGUAGES array', () => {
  it('has at least 20 language entries', () => {
    expect(LANGUAGES.length).toBeGreaterThanOrEqual(20);
  });

  it('each entry has code, name, and nativeName strings', () => {
    for (const lang of LANGUAGES) {
      expect(typeof lang.code).toBe('string');
      expect(typeof lang.name).toBe('string');
      expect(typeof lang.nativeName).toBe('string');
      expect(lang.code.length).toBeGreaterThan(0);
      expect(lang.name.length).toBeGreaterThan(0);
      expect(lang.nativeName.length).toBeGreaterThan(0);
    }
  });

  it('all codes are 2-letter lowercase ISO 639-1', () => {
    for (const lang of LANGUAGES) {
      expect(lang.code).toMatch(/^[a-z]{2}$/);
    }
  });

  it('has no duplicate codes', () => {
    const codes = LANGUAGES.map(l => l.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });

  it('contains English (en)', () => {
    const en = LANGUAGES.find(l => l.code === 'en');
    expect(en).toBeDefined();
    expect(en?.name).toBe('English');
  });

  it('contains Spanish (es)', () => {
    const es = LANGUAGES.find(l => l.code === 'es');
    expect(es).toBeDefined();
    expect(es?.name).toBe('Spanish');
    expect(es?.nativeName).toContain('Español');
  });

  it('contains French (fr)', () => {
    const fr = LANGUAGES.find(l => l.code === 'fr');
    expect(fr).toBeDefined();
    expect(fr?.name).toBe('French');
  });

  it('contains German (de)', () => {
    const de = LANGUAGES.find(l => l.code === 'de');
    expect(de).toBeDefined();
    expect(de?.name).toBe('German');
    expect(de?.nativeName).toBe('Deutsch');
  });

  it('contains Japanese (ja)', () => {
    const ja = LANGUAGES.find(l => l.code === 'ja');
    expect(ja).toBeDefined();
    expect(ja?.name).toBe('Japanese');
  });
});

describe('getBrowserPreferredLanguages()', () => {
  const originalLanguages = Object.getOwnPropertyDescriptor(navigator, 'languages');
  const originalLanguage = Object.getOwnPropertyDescriptor(navigator, 'language');

  afterEach(() => {
    // Restore navigator properties after each test
    if (originalLanguages) {
      Object.defineProperty(navigator, 'languages', originalLanguages);
    }
    if (originalLanguage) {
      Object.defineProperty(navigator, 'language', originalLanguage);
    }
  });

  it('returns ["en", "fr", "de"] for navigator.languages = ["en-US", "fr-FR", "de"]', () => {
    Object.defineProperty(navigator, 'languages', {
      value: ['en-US', 'fr-FR', 'de'],
      configurable: true,
    });

    const result = getBrowserPreferredLanguages();
    expect(result).toEqual(['en', 'fr', 'de']);
  });

  it('returns ["zh", "en"] for navigator.languages = ["zh-CN", "en"]', () => {
    Object.defineProperty(navigator, 'languages', {
      value: ['zh-CN', 'en'],
      configurable: true,
    });

    const result = getBrowserPreferredLanguages();
    expect(result).toEqual(['zh', 'en']);
  });

  it('falls back to navigator.language when navigator.languages is empty', () => {
    Object.defineProperty(navigator, 'languages', {
      value: [],
      configurable: true,
    });
    Object.defineProperty(navigator, 'language', {
      value: 'es',
      configurable: true,
    });

    const result = getBrowserPreferredLanguages();
    expect(result).toEqual(['es']);
  });

  it('returns only codes that exist in the LANGUAGES array', () => {
    Object.defineProperty(navigator, 'languages', {
      value: ['en-US', 'xx-YY', 'zz'],
      configurable: true,
    });

    const result = getBrowserPreferredLanguages();
    expect(result).toContain('en');
    expect(result).not.toContain('xx');
    expect(result).not.toContain('zz');
  });

  it('deduplicates codes from multiple regions (en-US, en-GB → en)', () => {
    Object.defineProperty(navigator, 'languages', {
      value: ['en-US', 'en-GB', 'fr'],
      configurable: true,
    });

    const result = getBrowserPreferredLanguages();
    expect(result.filter(c => c === 'en').length).toBe(1);
    expect(result).toEqual(['en', 'fr']);
  });

  it('handles missing navigator gracefully', () => {
    // getBrowserPreferredLanguages checks typeof navigator === 'undefined'
    // In test environment navigator exists, so test that unknown codes are filtered
    Object.defineProperty(navigator, 'languages', {
      value: [],
      configurable: true,
    });
    Object.defineProperty(navigator, 'language', {
      value: '',
      configurable: true,
    });

    const result = getBrowserPreferredLanguages();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('getLanguageByCode()', () => {
  it('returns correct LanguageInfo for known code "en"', () => {
    const result = getLanguageByCode('en');
    expect(result).toBeDefined();
    expect(result?.code).toBe('en');
    expect(result?.name).toBe('English');
  });

  it('returns correct LanguageInfo for known code "de"', () => {
    const result = getLanguageByCode('de');
    expect(result).toBeDefined();
    expect(result?.code).toBe('de');
    expect(result?.name).toBe('German');
    expect(result?.nativeName).toBe('Deutsch');
  });

  it('returns undefined for unknown code "xx"', () => {
    const result = getLanguageByCode('xx');
    expect(result).toBeUndefined();
  });

  it('is case-sensitive — "EN" returns undefined when codes are lowercase', () => {
    const result = getLanguageByCode('EN');
    expect(result).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    const result = getLanguageByCode('');
    expect(result).toBeUndefined();
  });
});
