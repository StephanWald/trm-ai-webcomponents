/**
 * CSS selector generation utility for author mode
 * Creates stable selectors with ID > data-attr > class > nth-child fallback strategy
 */

/**
 * Validation result for CSS selectors
 */
export interface SelectorValidation {
  valid: boolean;
  matchCount: number;
}

/**
 * Generate a CSS selector for a DOM element
 * Prioritizes stability: ID > data-attr > class > nth-child
 * @param element - The target DOM element
 * @returns CSS selector string
 */
export function generateSelector(element: HTMLElement): string {
  // Strategy 1: ID selector (most stable)
  if (element.id && element.id.trim() !== '') {
    const selector = `#${CSS.escape(element.id)}`;
    const validation = validateSelector(selector);
    if (validation.matchCount === 1) {
      return selector;
    }
  }

  // Strategy 2: Data attribute selector (stable if unique)
  if (element.dataset.walkthroughId) {
    const selector = `[data-walkthrough-id="${element.dataset.walkthroughId}"]`;
    const validation = validateSelector(selector);
    if (validation.matchCount === 1) {
      return selector;
    }
  }

  // Strategy 3: Class selector (if unique)
  if (element.className && typeof element.className === 'string' && element.className.trim() !== '') {
    const classes = element.className
      .trim()
      .split(/\s+/)
      .filter(cls => cls.length > 0)
      .map(cls => CSS.escape(cls));

    if (classes.length > 0) {
      const selector = `.${classes.join('.')}`;
      const validation = validateSelector(selector);
      if (validation.matchCount === 1) {
        return selector;
      }
    }
  }

  // Strategy 4: Tag + class combination (if classes exist)
  if (element.className && typeof element.className === 'string' && element.className.trim() !== '') {
    const classes = element.className
      .trim()
      .split(/\s+/)
      .filter(cls => cls.length > 0)
      .map(cls => CSS.escape(cls));

    if (classes.length > 0) {
      const tagName = element.tagName.toLowerCase();
      const selector = `${tagName}.${classes.join('.')}`;
      const validation = validateSelector(selector);
      if (validation.matchCount === 1) {
        return selector;
      }
    }
  }

  // Strategy 5: Nth-child path (fallback - always unique but fragile)
  return buildNthChildPath(element);
}

/**
 * Build nth-child path from element to body
 * Most fragile but guaranteed unique
 */
function buildNthChildPath(element: HTMLElement): string {
  const path: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.body) {
    const tagName = current.tagName.toLowerCase();
    const parent = current.parentElement;

    if (parent) {
      // Count siblings of the same tag type
      const siblings = Array.from(parent.children).filter(
        child => child.tagName.toLowerCase() === tagName
      );

      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        path.unshift(`${tagName}:nth-child(${index})`);
      } else {
        path.unshift(tagName);
      }
    } else {
      path.unshift(tagName);
    }

    current = parent;
  }

  return path.join(' > ');
}

/**
 * Validate a CSS selector
 * Tests selector with querySelectorAll and returns match count
 * @param selector - CSS selector string to validate
 * @returns Validation result with match count
 */
export function validateSelector(selector: string): SelectorValidation {
  try {
    const matches = document.querySelectorAll(selector);
    return {
      valid: true,
      matchCount: matches.length,
    };
  } catch (error) {
    return {
      valid: false,
      matchCount: 0,
    };
  }
}
