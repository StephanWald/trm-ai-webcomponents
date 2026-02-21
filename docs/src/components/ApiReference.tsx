import React from 'react';

// Type definitions matching docs.json structure

interface DocsProp {
  name: string;
  attr?: string;
  type: string;
  default?: string;
  docs?: string;
}

interface DocsEvent {
  event: string;
  detail?: string;
  complexType?: {
    detail?: string;
  };
  docs?: string;
}

interface DocsMethod {
  name: string;
  signature?: string;
  complexType?: {
    signature?: string;
  };
  docs?: string;
}

interface DocsStyle {
  name: string;
  docs?: string;
}

interface DocsPart {
  name: string;
  docs?: string;
}

export interface DocsComponent {
  tag: string;
  docs?: string;
  props?: DocsProp[];
  events?: DocsEvent[];
  methods?: DocsMethod[];
  styles?: DocsStyle[];
  parts?: DocsPart[];
}

interface ApiReferenceProps {
  /** Component data object from docs.json components array */
  component: DocsComponent;
}

/** Render a dash for empty/null/undefined values */
function display(value: string | undefined | null): string {
  if (value == null || value.trim() === '') return '—';
  return value;
}

/**
 * ApiReference renders component API documentation tables from docs.json data.
 * Use in MDX pages by importing docs.json and passing the matching component entry.
 *
 * @example
 * ```mdx
 * import docsData from '@site/../../docs.json';
 * import ApiReference from '@site/src/components/ApiReference';
 *
 * export const component = docsData.components.find(c => c.tag === 'sp-org-chart');
 * <ApiReference component={component} />
 * ```
 */
export default function ApiReference({ component }: ApiReferenceProps): React.JSX.Element {
  const props = component.props ?? [];
  const events = component.events ?? [];
  const methods = component.methods ?? [];
  const styles = component.styles ?? [];
  const parts = component.parts ?? [];

  return (
    <div>
      {/* Properties table */}
      {props.length > 0 && (
        <>
          <h3>Properties</h3>
          <table className="api-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Attribute</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {props.map((prop) => (
                <tr key={prop.name}>
                  <td><code>{prop.name}</code></td>
                  <td><code>{display(prop.attr)}</code></td>
                  <td><code>{display(prop.type)}</code></td>
                  <td><code>{display(prop.default)}</code></td>
                  <td>{display(prop.docs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Events table */}
      {events.length > 0 && (
        <>
          <h3>Events</h3>
          <table className="api-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Detail Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const detailType = event.complexType?.detail ?? event.detail;
                return (
                  <tr key={event.event}>
                    <td><code>{event.event}</code></td>
                    <td><code>{display(detailType)}</code></td>
                    <td>{display(event.docs)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      {/* Methods table */}
      {methods.length > 0 && (
        <>
          <h3>Methods</h3>
          <table className="api-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Signature</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {methods.map((method) => {
                const sig = method.complexType?.signature ?? method.signature;
                return (
                  <tr key={method.name}>
                    <td><code>{method.name}</code></td>
                    <td><code>{display(sig)}</code></td>
                    <td>{display(method.docs)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      {/* CSS Custom Properties table */}
      {styles.length > 0 && (
        <>
          <h3>CSS Custom Properties</h3>
          <table className="api-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {styles.map((style) => (
                <tr key={style.name}>
                  <td><code>{style.name}</code></td>
                  <td>{display(style.docs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* CSS Parts table */}
      {parts.length > 0 && (
        <>
          <h3>CSS Parts</h3>
          <table className="api-table">
            <thead>
              <tr>
                <th>Part</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((part) => (
                <tr key={part.name}>
                  <td><code>{part.name}</code></td>
                  <td>{display(part.docs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* No API data fallback */}
      {props.length === 0 && events.length === 0 && methods.length === 0 && styles.length === 0 && parts.length === 0 && (
        <p><em>No API documentation available for this component.</em></p>
      )}
    </div>
  );
}
