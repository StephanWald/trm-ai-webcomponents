import { generateSelector, validateSelector } from './selector-generator';

// Polyfill CSS.escape for JSDOM/Stencil mock (not available in test environment)
if (!(globalThis as any).CSS || typeof (globalThis as any).CSS.escape !== 'function') {
  Object.defineProperty(globalThis, 'CSS', {
    value: {
      escape: (str: string) => {
        // Simple polyfill - escape special CSS characters for valid CSS selectors
        return str.replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, '\\$&');
      },
    },
    writable: false,
    configurable: true,
  });
}

describe('Selector Generator', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('generateSelector', () => {
    it('generates ID selector for element with unique ID', () => {
      const element = document.createElement('div');
      element.id = 'unique-element';
      document.body.appendChild(element);

      const selector = generateSelector(element);
      expect(selector).toBe('#unique-element');

      const validation = validateSelector(selector);
      expect(validation.matchCount).toBe(1);
    });

    it('escapes special characters in ID', () => {
      const element = document.createElement('div');
      element.id = 'element:with:colons';
      document.body.appendChild(element);

      const selector = generateSelector(element);
      expect(selector).toContain('element');
      // CSS.escape should handle special chars
      expect(selector.startsWith('#')).toBe(true);
    });

    it('generates data-attribute selector when available and unique', () => {
      const element = document.createElement('div');
      element.dataset.walkthroughId = 'unique-data-id';
      document.body.appendChild(element);

      const selector = generateSelector(element);
      expect(selector).toBe('[data-walkthrough-id="unique-data-id"]');

      const validation = validateSelector(selector);
      expect(validation.matchCount).toBe(1);
    });

    it('generates class selector for element with unique class', () => {
      const element = document.createElement('div');
      element.className = 'unique-class';
      document.body.appendChild(element);

      const selector = generateSelector(element);
      expect(selector).toBe('.unique-class');

      const validation = validateSelector(selector);
      expect(validation.matchCount).toBe(1);
    });

    it('combines multiple classes with dot notation', () => {
      const element = document.createElement('div');
      element.className = 'class-one class-two unique-class';
      document.body.appendChild(element);

      const selector = generateSelector(element);
      expect(selector).toContain('class-one');
      expect(selector).toContain('class-two');
      expect(selector).toContain('unique-class');
    });

    it('generates tag + class selector when class alone is not unique', () => {
      const element1 = document.createElement('div');
      element1.className = 'shared-class';
      document.body.appendChild(element1);

      const element2 = document.createElement('span');
      element2.className = 'shared-class';
      document.body.appendChild(element2);

      const selector = generateSelector(element2);
      // Should include tag name when class alone is not unique
      expect(selector).toContain('span');
      expect(selector).toContain('shared-class');
    });

    it('falls back to nth-child path when no unique identifier', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const element1 = document.createElement('span');
      const element2 = document.createElement('span');
      const element3 = document.createElement('span');

      container.appendChild(element1);
      container.appendChild(element2);
      container.appendChild(element3);

      const selector = generateSelector(element2);
      expect(selector).toContain('span');
      expect(selector).toContain('nth-child');
    });

    it('builds path from element to body', () => {
      const container = document.createElement('div');
      const nested = document.createElement('section');
      const target = document.createElement('p');

      document.body.appendChild(container);
      container.appendChild(nested);
      nested.appendChild(target);

      const selector = generateSelector(target);
      // Selector should be path from body
      expect(selector).toContain('>');
    });

    it('handles elements with whitespace in className', () => {
      const element = document.createElement('div');
      element.className = '   class-one   class-two   ';
      document.body.appendChild(element);

      const selector = generateSelector(element);
      expect(selector).toBeTruthy();
      expect(selector).toContain('class-one');
      expect(selector).toContain('class-two');
    });

    it('handles elements with empty className', () => {
      const element = document.createElement('div');
      element.className = '';
      document.body.appendChild(element);

      const selector = generateSelector(element);
      // Should fall back to nth-child path
      expect(selector).toContain('div');
    });

    it('prioritizes ID over data attribute', () => {
      const element = document.createElement('div');
      element.id = 'unique-id';
      element.dataset.walkthroughId = 'data-id';
      document.body.appendChild(element);

      const selector = generateSelector(element);
      expect(selector).toBe('#unique-id');
    });

    it('prioritizes data attribute over class', () => {
      const element = document.createElement('div');
      element.dataset.walkthroughId = 'unique-data';
      element.className = 'some-class';
      document.body.appendChild(element);

      const selector = generateSelector(element);
      expect(selector).toBe('[data-walkthrough-id="unique-data"]');
    });
  });

  describe('validateSelector', () => {
    it('returns valid true for correct selector', () => {
      const element = document.createElement('div');
      element.id = 'test-element';
      document.body.appendChild(element);

      const validation = validateSelector('#test-element');
      expect(validation.valid).toBe(true);
      expect(validation.matchCount).toBe(1);
    });

    it('returns match count for multiple matches', () => {
      const element1 = document.createElement('div');
      element1.className = 'test-class';
      const element2 = document.createElement('div');
      element2.className = 'test-class';

      document.body.appendChild(element1);
      document.body.appendChild(element2);

      const validation = validateSelector('.test-class');
      expect(validation.valid).toBe(true);
      expect(validation.matchCount).toBe(2);
    });

    it('returns 0 matches for non-existent selector', () => {
      const validation = validateSelector('#does-not-exist');
      expect(validation.valid).toBe(true);
      expect(validation.matchCount).toBe(0);
    });

    it('returns valid false for invalid selector syntax', () => {
      const validation = validateSelector('###invalid');
      expect(validation.valid).toBe(false);
      expect(validation.matchCount).toBe(0);
    });

    it('handles complex selectors', () => {
      const container = document.createElement('div');
      container.id = 'container';
      const child = document.createElement('span');
      child.className = 'child';
      container.appendChild(child);
      document.body.appendChild(container);

      const validation = validateSelector('#container .child');
      expect(validation.valid).toBe(true);
      expect(validation.matchCount).toBe(1);
    });

    it('handles attribute selectors', () => {
      const element = document.createElement('button');
      element.setAttribute('data-action', 'submit');
      document.body.appendChild(element);

      const validation = validateSelector('[data-action="submit"]');
      expect(validation.valid).toBe(true);
      expect(validation.matchCount).toBe(1);
    });

    it('handles pseudo-selectors that return results', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');
      document.body.appendChild(element1);
      document.body.appendChild(element2);

      const validation = validateSelector('div:first-child');
      expect(validation.valid).toBe(true);
      expect(validation.matchCount).toBeGreaterThanOrEqual(1);
    });
  });
});
