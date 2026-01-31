import { Component, Prop, h, Event, EventEmitter, Host } from '@stencil/core';

/**
 * @part container - Main container wrapper
 * @part heading - Heading element
 * @part content - Content paragraph
 * @part button - Action button
 */
@Component({
  tag: 'sp-example',
  styleUrl: 'sp-example.css',
  shadow: true,
})
export class SpExample {
  /**
   * Theme override for standalone usage
   * @type {'light' | 'dark' | 'auto'}
   */
  @Prop() theme: 'light' | 'dark' | 'auto' = 'auto';

  /**
   * Heading text to display
   */
  @Prop() heading: string = 'Example Component';

  /**
   * Emitted when the button is clicked
   */
  @Event() spExampleClick: EventEmitter<void>;

  private handleClick = () => {
    this.spExampleClick.emit();
  };

  render() {
    const hostClass = {
      'theme-light': this.theme === 'light',
      'theme-dark': this.theme === 'dark',
    };

    return (
      <Host class={hostClass}>
        <div part="container" class="container">
          <h2 part="heading" class="heading">
            {this.heading}
          </h2>
          <p part="content" class="content">
            This component validates the DWC theming system, build pipeline, and testing infrastructure.
            It consumes CSS custom properties from the global DWC theme with fallback defaults for standalone use.
          </p>
          <button part="button" class="button" onClick={this.handleClick}>
            Click Me
          </button>
        </div>
      </Host>
    );
  }
}
