import { newSpecPage } from '@stencil/core/testing';
import { SpExample } from './sp-example';

describe('sp-example', () => {
  it('renders with default props', async () => {
    const page = await newSpecPage({
      components: [SpExample],
      html: `<sp-example></sp-example>`,
    });

    // Verify component rendered
    expect(page.root).toBeTruthy();

    // Verify default heading text
    const heading = page.root?.shadowRoot?.querySelector('.heading');
    expect(heading?.textContent?.trim()).toBe('Example Component');

    // Verify button exists
    const button = page.root?.shadowRoot?.querySelector('button');
    expect(button?.textContent?.trim()).toBe('Click Me');

    // Verify all parts exist
    expect(page.root?.shadowRoot?.querySelector('[part="container"]')).toBeTruthy();
    expect(page.root?.shadowRoot?.querySelector('[part="heading"]')).toBeTruthy();
    expect(page.root?.shadowRoot?.querySelector('[part="content"]')).toBeTruthy();
    expect(page.root?.shadowRoot?.querySelector('[part="button"]')).toBeTruthy();
  });

  it('renders with custom heading prop', async () => {
    const page = await newSpecPage({
      components: [SpExample],
      html: `<sp-example heading="Custom Title"></sp-example>`,
    });

    const heading = page.root?.shadowRoot?.querySelector('.heading');
    expect(heading?.textContent?.trim()).toBe('Custom Title');
  });

  it('applies theme-dark class when theme="dark"', async () => {
    const page = await newSpecPage({
      components: [SpExample],
      html: `<sp-example theme="dark"></sp-example>`,
    });

    expect(page.root).toHaveClass('theme-dark');
  });

  it('applies theme-light class when theme="light"', async () => {
    const page = await newSpecPage({
      components: [SpExample],
      html: `<sp-example theme="light"></sp-example>`,
    });

    expect(page.root).toHaveClass('theme-light');
  });

  it('no theme class applied when theme="auto" (default)', async () => {
    const page = await newSpecPage({
      components: [SpExample],
      html: `<sp-example></sp-example>`,
    });

    expect(page.root).not.toHaveClass('theme-dark');
    expect(page.root).not.toHaveClass('theme-light');
  });

  it('emits spExampleClick event when button is clicked', async () => {
    const page = await newSpecPage({
      components: [SpExample],
      html: `<sp-example></sp-example>`,
    });

    const spyEvent = jest.fn();
    page.root?.addEventListener('spExampleClick', spyEvent);

    const button = page.root?.shadowRoot?.querySelector('button');
    button?.click();

    await page.waitForChanges();

    expect(spyEvent).toHaveBeenCalled();
  });

  it('exposes expected CSS parts', async () => {
    const page = await newSpecPage({
      components: [SpExample],
      html: `<sp-example></sp-example>`,
    });

    const container = page.root?.shadowRoot?.querySelector('[part="container"]');
    const heading = page.root?.shadowRoot?.querySelector('[part="heading"]');
    const content = page.root?.shadowRoot?.querySelector('[part="content"]');
    const button = page.root?.shadowRoot?.querySelector('[part="button"]');

    expect(container).toBeTruthy();
    expect(heading).toBeTruthy();
    expect(content).toBeTruthy();
    expect(button).toBeTruthy();
  });
});
