import { Component, h } from '@stencil/core';

@Component({
  tag: 'sp-example',
  styleUrl: 'sp-example.css',
  shadow: true,
})
export class SpExample {
  render() {
    return (
      <div part="container">
        <h2 part="heading">Example Component</h2>
        <p part="content">This is a placeholder component for testing the build pipeline.</p>
      </div>
    );
  }
}
