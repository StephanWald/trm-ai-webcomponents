import { newSpecPage } from '@stencil/core/testing';
import { SpOrgChart } from './sp-org-chart';
import { User } from './types/org-chart.types';

describe('sp-org-chart', () => {
  it('renders with defaults and shows no-data message when users array is empty', async () => {
    const page = await newSpecPage({
      components: [SpOrgChart],
      html: '<sp-org-chart></sp-org-chart>',
    });

    expect(page.root).toBeTruthy();

    // Verify no-data message displayed
    const noData = page.root?.shadowRoot?.querySelector('.no-data');
    expect(noData).toBeTruthy();
    expect(noData?.textContent?.trim()).toBe('No data available');

    // Verify filter input exists
    const filterInput = page.root?.shadowRoot?.querySelector('.filter-input');
    expect(filterInput).toBeTruthy();
  });

  it('displays custom no-data message when prop is set', async () => {
    const page = await newSpecPage({
      components: [SpOrgChart],
      html: '<sp-org-chart no-data-message="Custom empty message"></sp-org-chart>',
    });

    const noData = page.root?.shadowRoot?.querySelector('.no-data');
    expect(noData?.textContent?.trim()).toBe('Custom empty message');
  });

  it('renders user tiles when users prop is set', async () => {
    const users: User[] = [
      { id: '1', name: 'Alice Johnson', role: 'CEO' },
      { id: '2', name: 'Bob Smith', role: 'CTO', reportsTo: '1' },
    ];

    const page = await newSpecPage({
      components: [SpOrgChart],
      html: '<sp-org-chart></sp-org-chart>',
    });

    page.rootInstance.users = users;
    await page.waitForChanges();

    // No-data message should be hidden
    const noData = page.root?.shadowRoot?.querySelector('.no-data');
    expect(noData).toBeFalsy();

    // Tree container should exist
    const treeContainer = page.root?.shadowRoot?.querySelector('.tree-container');
    expect(treeContainer).toBeTruthy();

    // User tiles should be rendered
    const userTiles = page.root?.shadowRoot?.querySelectorAll('.user-tile');
    expect(userTiles?.length).toBe(2);

    // Check user names
    const userNames = Array.from(userTiles || []).map(tile => tile.querySelector('.user-name')?.textContent);
    expect(userNames).toContain('Alice Johnson');
    expect(userNames).toContain('Bob Smith');

    // Check user roles
    const userRoles = Array.from(userTiles || []).map(tile => tile.querySelector('.user-role')?.textContent);
    expect(userRoles).toContain('CEO');
    expect(userRoles).toContain('CTO');
  });

  it('renders hierarchical tree structure with nested children', async () => {
    const users: User[] = [
      { id: '1', name: 'Alice', role: 'CEO' },
      { id: '2', name: 'Bob', role: 'CTO', reportsTo: '1' },
      { id: '3', name: 'Carol', role: 'Engineer', reportsTo: '2' },
    ];

    const page = await newSpecPage({
      components: [SpOrgChart],
      html: '<sp-org-chart></sp-org-chart>',
    });

    page.rootInstance.users = users;
    await page.waitForChanges();

    // Verify tree-children elements exist
    const treeChildren = page.root?.shadowRoot?.querySelectorAll('.tree-children');
    expect(treeChildren?.length).toBeGreaterThan(0);

    // Verify nested structure
    const treeNodes = page.root?.shadowRoot?.querySelectorAll('.tree-node');
    expect(treeNodes?.length).toBe(3);
  });

  it('renders siblings in alphabetical order by name', async () => {
    const users: User[] = [
      { id: '1', name: 'Alice', role: 'CEO' },
      { id: '2', name: 'Zoe', role: 'CTO', reportsTo: '1' },
      { id: '3', name: 'Bob', role: 'CFO', reportsTo: '1' },
      { id: '4', name: 'Carol', role: 'COO', reportsTo: '1' },
    ];

    const page = await newSpecPage({
      components: [SpOrgChart],
      html: '<sp-org-chart></sp-org-chart>',
    });

    page.rootInstance.users = users;
    await page.waitForChanges();

    const userNames = Array.from(page.root?.shadowRoot?.querySelectorAll('.user-name') || [])
      .map(el => el.textContent);

    // Alice is root, then children should be Bob, Carol, Zoe
    expect(userNames[0]).toBe('Alice');
    // Children of Alice should be sorted
    const children = userNames.slice(1);
    expect(children).toEqual(['Bob', 'Carol', 'Zoe']);
  });

  it('applies theme-light class when theme prop is "light"', async () => {
    const page = await newSpecPage({
      components: [SpOrgChart],
      html: '<sp-org-chart theme="light"></sp-org-chart>',
    });

    expect(page.root).toHaveClass('theme-light');
  });

  it('applies theme-dark class when theme prop is "dark"', async () => {
    const page = await newSpecPage({
      components: [SpOrgChart],
      html: '<sp-org-chart theme="dark"></sp-org-chart>',
    });

    expect(page.root).toHaveClass('theme-dark');
  });

  it('does not apply theme class when theme is "auto" (default)', async () => {
    const page = await newSpecPage({
      components: [SpOrgChart],
      html: '<sp-org-chart></sp-org-chart>',
    });

    expect(page.root).not.toHaveClass('theme-light');
    expect(page.root).not.toHaveClass('theme-dark');
  });

  it('makes tiles draggable when editable prop is true', async () => {
    const users: User[] = [
      { id: '1', name: 'Alice', role: 'CEO' },
    ];

    const page = await newSpecPage({
      components: [SpOrgChart],
      html: '<sp-org-chart editable="true"></sp-org-chart>',
    });

    page.rootInstance.users = users;
    await page.waitForChanges();

    const userTile = page.root?.shadowRoot?.querySelector('.user-tile');
    expect(userTile?.getAttribute('draggable')).toBe('true');
  });

  it('makes tiles not draggable when editable prop is false', async () => {
    const users: User[] = [
      { id: '1', name: 'Alice', role: 'CEO' },
    ];

    const page = await newSpecPage({
      components: [SpOrgChart],
      html: '<sp-org-chart></sp-org-chart>',
    });

    page.rootInstance.users = users;
    await page.waitForChanges();

    const userTile = page.root?.shadowRoot?.querySelector('.user-tile');
    expect(userTile?.getAttribute('draggable')).toBe('false');
  });

  it('emits userClick event when tile is clicked', async () => {
    const users: User[] = [
      { id: '1', name: 'Alice', role: 'CEO' },
    ];

    const page = await newSpecPage({
      components: [SpOrgChart],
      html: '<sp-org-chart></sp-org-chart>',
    });

    page.rootInstance.users = users;
    await page.waitForChanges();

    const spyEvent = jest.fn();
    page.root?.addEventListener('userClick', spyEvent);

    const userTile = page.root?.shadowRoot?.querySelector('.user-tile') as HTMLElement;
    userTile?.click();

    // Wait for single-click delay
    await new Promise(resolve => setTimeout(resolve, 350));
    await page.waitForChanges();

    expect(spyEvent).toHaveBeenCalled();
    expect(spyEvent.mock.calls[0][0].detail.userId).toBe('1');
    expect(spyEvent.mock.calls[0][0].detail.user.name).toBe('Alice');
  });

  it('returns null from getSelected() when nothing is selected', async () => {
    const page = await newSpecPage({
      components: [SpOrgChart],
      html: '<sp-org-chart></sp-org-chart>',
    });

    const selected = await page.rootInstance.getSelected();
    expect(selected).toBeNull();
  });

  it('sets highlighted state via highlightUser() method', async () => {
    const users: User[] = [
      { id: '1', name: 'Alice', role: 'CEO' },
    ];

    const page = await newSpecPage({
      components: [SpOrgChart],
      html: '<sp-org-chart></sp-org-chart>',
    });

    page.rootInstance.users = users;
    await page.waitForChanges();

    await page.rootInstance.highlightUser('1');
    await page.waitForChanges();

    const userTile = page.root?.shadowRoot?.querySelector('.user-tile');
    expect(userTile).toHaveClass('highlighted');
  });

  it('clears highlighted state via clearHighlight() method', async () => {
    const users: User[] = [
      { id: '1', name: 'Alice', role: 'CEO' },
    ];

    const page = await newSpecPage({
      components: [SpOrgChart],
      html: '<sp-org-chart></sp-org-chart>',
    });

    page.rootInstance.users = users;
    await page.waitForChanges();

    // Set highlight
    await page.rootInstance.highlightUser('1');
    await page.waitForChanges();

    let userTile = page.root?.shadowRoot?.querySelector('.user-tile');
    expect(userTile).toHaveClass('highlighted');

    // Clear highlight
    await page.rootInstance.clearHighlight();
    await page.waitForChanges();

    userTile = page.root?.shadowRoot?.querySelector('.user-tile');
    expect(userTile).not.toHaveClass('highlighted');
  });

  it('renders filter input element', async () => {
    const page = await newSpecPage({
      components: [SpOrgChart],
      html: '<sp-org-chart></sp-org-chart>',
    });

    const filterInput = page.root?.shadowRoot?.querySelector('.filter-input');
    expect(filterInput).toBeTruthy();
    expect(filterInput?.getAttribute('type')).toBe('text');
    expect(filterInput?.getAttribute('placeholder')).toContain('Filter');
  });

  it('renders drop zones when editable and dragging', async () => {
    const users: User[] = [
      { id: '1', name: 'Alice', role: 'CEO' },
    ];

    const page = await newSpecPage({
      components: [SpOrgChart],
      html: '<sp-org-chart editable="true"></sp-org-chart>',
    });

    page.rootInstance.users = users;
    await page.waitForChanges();

    // Initially no drop zones
    let dropZones = page.root?.shadowRoot?.querySelector('.drop-zones');
    expect(dropZones).toBeFalsy();

    // Simulate drag start by setting state
    page.rootInstance['showDropZones'] = true;
    await page.waitForChanges();

    // Drop zones should now be visible
    dropZones = page.root?.shadowRoot?.querySelector('.drop-zones');
    expect(dropZones).toBeTruthy();

    const dropZoneElements = page.root?.shadowRoot?.querySelectorAll('.drop-zone');
    expect(dropZoneElements?.length).toBeGreaterThanOrEqual(2);
  });

  it('exposes CSS parts for styling', async () => {
    const users: User[] = [
      { id: '1', name: 'Alice', role: 'CEO' },
    ];

    const page = await newSpecPage({
      components: [SpOrgChart],
      html: '<sp-org-chart></sp-org-chart>',
    });

    page.rootInstance.users = users;
    await page.waitForChanges();

    const filterInput = page.root?.shadowRoot?.querySelector('[part="filter-input"]');
    expect(filterInput).toBeTruthy();

    const treeContainer = page.root?.shadowRoot?.querySelector('[part="tree-container"]');
    expect(treeContainer).toBeTruthy();

    const userTile = page.root?.shadowRoot?.querySelector('[part="user-tile"]');
    expect(userTile).toBeTruthy();
  });
});
