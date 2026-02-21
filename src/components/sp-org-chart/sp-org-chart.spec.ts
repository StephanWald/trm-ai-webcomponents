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

    // Filter input should NOT exist (removed in Plan 02)
    const filterInput = page.root?.shadowRoot?.querySelector('.filter-input');
    expect(filterInput).toBeFalsy();
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
      { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      { id: '2', firstName: 'Bob', lastName: 'Smith', role: 'CTO', reportsTo: '1' },
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

  it('renders expanded tile content: email, phone, and branch badge', async () => {
    const users: User[] = [
      {
        id: '1',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'CEO',
        email: 'alice@example.com',
        phone: '555-1234',
        branchName: 'HQ',
      },
    ];

    const page = await newSpecPage({
      components: [SpOrgChart],
      html: '<sp-org-chart></sp-org-chart>',
    });

    page.rootInstance.users = users;
    await page.waitForChanges();

    const tile = page.root?.shadowRoot?.querySelector('.user-tile');
    expect(tile?.querySelector('.user-email')?.textContent).toBe('alice@example.com');
    expect(tile?.querySelector('.user-phone')?.textContent).toBe('555-1234');
    expect(tile?.querySelector('.user-branch-badge')?.textContent).toBe('HQ');
  });

  it('does not render email or phone elements when fields are absent', async () => {
    const users: User[] = [
      { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
    ];

    const page = await newSpecPage({
      components: [SpOrgChart],
      html: '<sp-org-chart></sp-org-chart>',
    });

    page.rootInstance.users = users;
    await page.waitForChanges();

    const tile = page.root?.shadowRoot?.querySelector('.user-tile');
    expect(tile?.querySelector('.user-email')).toBeFalsy();
    expect(tile?.querySelector('.user-phone')).toBeFalsy();
    expect(tile?.querySelector('.user-branch-badge')).toBeFalsy();
  });

  it('renders hierarchical tree structure with nested children', async () => {
    const users: User[] = [
      { id: '1', firstName: 'Alice', lastName: 'Smith', role: 'CEO' },
      { id: '2', firstName: 'Bob', lastName: 'Jones', role: 'CTO', reportsTo: '1' },
      { id: '3', firstName: 'Carol', lastName: 'Lee', role: 'Engineer', reportsTo: '2' },
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

  it('renders siblings in alphabetical order by display name', async () => {
    const users: User[] = [
      { id: '1', firstName: 'Alice', lastName: 'Smith', role: 'CEO' },
      { id: '2', firstName: 'Zoe', lastName: 'Clark', role: 'CTO', reportsTo: '1' },
      { id: '3', firstName: 'Bob', lastName: 'Adams', role: 'CFO', reportsTo: '1' },
      { id: '4', firstName: 'Carol', lastName: 'King', role: 'COO', reportsTo: '1' },
    ];

    const page = await newSpecPage({
      components: [SpOrgChart],
      html: '<sp-org-chart></sp-org-chart>',
    });

    page.rootInstance.users = users;
    await page.waitForChanges();

    const userNames = Array.from(page.root?.shadowRoot?.querySelectorAll('.user-name') || [])
      .map(el => el.textContent);

    // Alice is root, children should be sorted by display name
    expect(userNames[0]).toBe('Alice Smith');
    const children = userNames.slice(1);
    expect(children).toEqual(['Bob Adams', 'Carol King', 'Zoe Clark']);
  });

  // ==========================================
  // Branch entity rendering
  // ==========================================

  describe('branch entity rendering', () => {
    it('renders branch entity with branch-tile and branch-avatar classes', async () => {
      const users: User[] = [
        { id: 'branch-1', firstName: 'Acme Corp', role: 'Branch', branchId: 'branch-1' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const tile = page.root?.shadowRoot?.querySelector('.user-tile');
      expect(tile).toHaveClass('branch-tile');

      const avatar = tile?.querySelector('.user-avatar');
      expect(avatar).toHaveClass('branch-avatar');
    });

    it('does not show branch badge for branch entities themselves', async () => {
      const users: User[] = [
        { id: 'branch-1', firstName: 'Acme Corp', role: 'Branch', branchName: 'Acme' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      // Branch entities should not show their own branchName as badge
      const badge = page.root?.shadowRoot?.querySelector('.user-branch-badge');
      expect(badge).toBeFalsy();
    });

    it('renders branch logo as avatar image for branch entity', async () => {
      const users: User[] = [
        { id: 'branch-1', firstName: 'Acme Corp', role: 'Branch', branchLogo: 'https://example.com/logo.png' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const avatarImg = page.root?.shadowRoot?.querySelector('.avatar-img') as HTMLImageElement;
      expect(avatarImg).toBeTruthy();
      expect(avatarImg?.src).toBe('https://example.com/logo.png');
    });

    it('renders regular user with circular avatar (no branch-avatar class)', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const tile = page.root?.shadowRoot?.querySelector('.user-tile');
      expect(tile).not.toHaveClass('branch-tile');

      const avatar = tile?.querySelector('.user-avatar');
      expect(avatar).not.toHaveClass('branch-avatar');
    });
  });

  // ==========================================
  // Editable defaults to true
  // ==========================================

  describe('editable prop behavior', () => {
    it('editable defaults to true — tiles are draggable by default', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const userTile = page.root?.shadowRoot?.querySelector('.user-tile');
      expect(userTile?.getAttribute('draggable')).toBe('true');
    });

    it('makes tiles not draggable when editable prop is explicitly false', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart editable="false"></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const userTile = page.root?.shadowRoot?.querySelector('.user-tile');
      expect(userTile?.getAttribute('draggable')).toBe('false');
    });

    it('makes tiles draggable when editable prop is explicitly true', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
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
  });

  // ==========================================
  // Theme tests
  // ==========================================

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

  // ==========================================
  // Branch filtering via filterMode/filterBranchId props
  // ==========================================

  describe('branch filtering via props', () => {
    it('shows all users when filterMode is none (default)', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO', branchId: 'branch-1' },
        { id: '2', firstName: 'Bob', lastName: 'Smith', role: 'CTO', reportsTo: '1', branchId: 'branch-2' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const tiles = page.root?.shadowRoot?.querySelectorAll('.user-tile');
      expect(tiles?.length).toBe(2);

      // No tiles should be dimmed when no filter is active
      Array.from(tiles || []).forEach(tile => {
        expect(tile).not.toHaveClass('dimmed');
      });
    });

    it('dims non-matching users when filterMode is highlight', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO', branchId: 'branch-1' },
        { id: '2', firstName: 'Bob', lastName: 'Smith', role: 'CTO', reportsTo: '1', branchId: 'branch-2' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      // Set highlight filter for branch-1
      page.rootInstance.filterMode = 'highlight';
      page.rootInstance.filterBranchId = 'branch-1';
      // Manually call applyBranchFilter since @Watch won't fire in test direct assignment
      page.rootInstance['applyBranchFilter']();
      await page.waitForChanges();

      expect(page.rootInstance.branchFilterResults).not.toBeNull();

      const userTiles = page.root?.shadowRoot?.querySelectorAll('.user-tile');
      const aliceTile = Array.from(userTiles || []).find(t => t.querySelector('.user-name')?.textContent === 'Alice Johnson');
      const bobTile = Array.from(userTiles || []).find(t => t.querySelector('.user-name')?.textContent === 'Bob Smith');

      // Alice matches branch-1, Bob does not and is not ancestor
      expect(aliceTile).not.toHaveClass('dimmed');
      expect(bobTile).toHaveClass('dimmed');
    });

    it('clears branch filter when filterMode is set back to none', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO', branchId: 'branch-1' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      // Apply filter
      page.rootInstance.filterMode = 'highlight';
      page.rootInstance.filterBranchId = 'branch-1';
      page.rootInstance['applyBranchFilter']();
      await page.waitForChanges();
      expect(page.rootInstance.branchFilterResults).not.toBeNull();

      // Clear filter
      page.rootInstance.filterMode = 'none';
      page.rootInstance['applyBranchFilter']();
      await page.waitForChanges();
      expect(page.rootInstance.branchFilterResults).toBeNull();
    });

    it('clears branch filter when filterBranchId is empty', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO', branchId: 'branch-1' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      // Apply filter then clear branchId
      page.rootInstance.filterMode = 'highlight';
      page.rootInstance.filterBranchId = 'branch-1';
      page.rootInstance['applyBranchFilter']();
      await page.waitForChanges();
      expect(page.rootInstance.branchFilterResults).not.toBeNull();

      // Empty filterBranchId clears results
      page.rootInstance.filterBranchId = '';
      page.rootInstance['applyBranchFilter']();
      await page.waitForChanges();
      expect(page.rootInstance.branchFilterResults).toBeNull();
    });

    it('hides unrelated branch entities in isolate mode', async () => {
      const users: User[] = [
        { id: 'branch-1', firstName: 'Branch One', role: 'Branch', branchId: 'branch-1' },
        { id: 'branch-2', firstName: 'Branch Two', role: 'Branch', branchId: 'branch-2' },
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO', reportsTo: 'branch-1', branchId: 'branch-1' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      // Apply isolate filter for branch-1
      page.rootInstance.filterMode = 'isolate';
      page.rootInstance.filterBranchId = 'branch-1';
      page.rootInstance['applyBranchFilter']();
      await page.waitForChanges();

      // branch-2 entity should be hidden (it has no matching descendants)
      // branch-1 should be visible (it matches or has matching descendants)
      const names = Array.from(
        page.root?.shadowRoot?.querySelectorAll('.user-name') || []
      ).map(n => n.textContent);

      expect(names).not.toContain('Branch Two');
    });

    it('shows all nodes when filterMode is none', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO', branchId: 'branch-1' },
        { id: '2', firstName: 'Bob', lastName: 'Smith', role: 'CTO', reportsTo: '1', branchId: 'branch-2' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      // filterMode is none by default — all tiles visible, no dimming
      const tiles = page.root?.shadowRoot?.querySelectorAll('.user-tile');
      expect(tiles?.length).toBe(2);
      Array.from(tiles || []).forEach(tile => {
        expect(tile).not.toHaveClass('dimmed');
      });
    });
  });

  // ==========================================
  // Event emissions
  // ==========================================

  it('emits userClick event when tile is clicked', async () => {
    const users: User[] = [
      { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
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
    expect(spyEvent.mock.calls[0][0].detail.user.firstName).toBe('Alice');
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
      { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
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
      { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
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

  it('renders drop zones (drop-zone-container) when editable and dragging', async () => {
    const users: User[] = [
      { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
    ];

    const page = await newSpecPage({
      components: [SpOrgChart],
      html: '<sp-org-chart></sp-org-chart>',
    });

    page.rootInstance.users = users;
    await page.waitForChanges();

    // Initially no drop zones
    let dropZoneContainer = page.root?.shadowRoot?.querySelector('.drop-zone-container');
    expect(dropZoneContainer).toBeFalsy();

    // Simulate drag start by setting state
    page.rootInstance['showDropZones'] = true;
    await page.waitForChanges();

    // Drop zones should now be visible (editable defaults to true)
    dropZoneContainer = page.root?.shadowRoot?.querySelector('.drop-zone-container');
    expect(dropZoneContainer).toBeTruthy();

    const dropZoneElements = page.root?.shadowRoot?.querySelectorAll('.drop-zone');
    expect(dropZoneElements?.length).toBeGreaterThanOrEqual(2);
  });

  it('exposes CSS parts for styling', async () => {
    const users: User[] = [
      { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
    ];

    const page = await newSpecPage({
      components: [SpOrgChart],
      html: '<sp-org-chart></sp-org-chart>',
    });

    page.rootInstance.users = users;
    await page.waitForChanges();

    // filter-input part removed, tree-container and user-tile remain
    const treeContainer = page.root?.shadowRoot?.querySelector('[part="tree-container"]');
    expect(treeContainer).toBeTruthy();

    const userTile = page.root?.shadowRoot?.querySelector('[part="user-tile"]');
    expect(userTile).toBeTruthy();
  });

  // ==========================================
  // User selection via click
  // ==========================================

  describe('user selection via click', () => {
    it('sets selectedUserId state when tile is clicked (single-click)', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
        { id: '2', firstName: 'Bob', lastName: 'Smith', role: 'CTO', reportsTo: '1' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const userTiles = page.root?.shadowRoot?.querySelectorAll('.user-tile') as NodeListOf<HTMLElement>;
      // Click Alice (first tile)
      userTiles[0].click();

      // Wait for click debounce
      await new Promise(resolve => setTimeout(resolve, 350));
      await page.waitForChanges();

      expect(page.rootInstance.selectedUserId).toBe('1');
    });

    it('emits userClick event on single click with user detail', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const clickEvents: CustomEvent[] = [];
      page.root?.addEventListener('userClick', (ev: Event) => clickEvents.push(ev as CustomEvent));

      const userTile = page.root?.shadowRoot?.querySelector('.user-tile') as HTMLElement;
      userTile.click();

      await new Promise(resolve => setTimeout(resolve, 350));
      await page.waitForChanges();

      expect(clickEvents.length).toBe(1);
      expect(clickEvents[0].detail.userId).toBe('1');
      expect(clickEvents[0].detail.user).toEqual({
        id: '1',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'CEO',
      });
    });

    it('getSelected() returns selected user after click', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const userTile = page.root?.shadowRoot?.querySelector('.user-tile') as HTMLElement;
      userTile.click();

      await new Promise(resolve => setTimeout(resolve, 350));
      await page.waitForChanges();

      const selected = await page.rootInstance.getSelected();
      expect(selected).toEqual({
        id: '1',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'CEO',
      });
    });

    it('applies selected CSS class to clicked tile', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const userTile = page.root?.shadowRoot?.querySelector('.user-tile') as HTMLElement;
      userTile.click();

      await new Promise(resolve => setTimeout(resolve, 350));
      await page.waitForChanges();

      const tile = page.root?.shadowRoot?.querySelector('.user-tile');
      expect(tile).toHaveClass('selected');
    });
  });

  // ==========================================
  // User double-click
  // ==========================================

  describe('user double-click', () => {
    it('emits userDblclick event when tile is double-clicked', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const dblclickEvents: CustomEvent[] = [];
      page.root?.addEventListener('userDblclick', (ev: Event) => dblclickEvents.push(ev as CustomEvent));

      const userTile = page.root?.shadowRoot?.querySelector('.user-tile') as HTMLElement;

      // Two rapid clicks = double-click
      userTile.click();
      userTile.click();

      await new Promise(resolve => setTimeout(resolve, 50));
      await page.waitForChanges();

      expect(dblclickEvents.length).toBe(1);
      expect(dblclickEvents[0].detail.userId).toBe('1');
      expect(dblclickEvents[0].detail.user.firstName).toBe('Alice');
    });
  });

  // ==========================================
  // Users @Watch handler
  // ==========================================

  describe('users @Watch handler', () => {
    it('rebuilds tree when users prop changes', async () => {
      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      // Initially empty
      expect(page.root?.shadowRoot?.querySelector('.no-data')).toBeTruthy();

      // Set users via prop assignment (triggers @Watch)
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
        { id: '2', firstName: 'Bob', lastName: 'Smith', role: 'CTO', reportsTo: '1' },
      ];
      page.rootInstance.users = users;
      await page.waitForChanges();

      expect(page.root?.shadowRoot?.querySelector('.no-data')).toBeFalsy();
      const tiles = page.root?.shadowRoot?.querySelectorAll('.user-tile');
      expect(tiles?.length).toBe(2);
    });

    it('resets branchFilterResults when users prop changes', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO', branchId: 'branch-1' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      // Set a filter
      page.rootInstance.filterMode = 'highlight';
      page.rootInstance.filterBranchId = 'branch-1';
      page.rootInstance['applyBranchFilter']();
      await page.waitForChanges();
      expect(page.rootInstance.branchFilterResults).not.toBeNull();

      // Change users (triggers handleUsersChange watch) — clears branchFilterResults
      page.rootInstance.users = [{ id: '2', firstName: 'Bob', lastName: 'Smith', role: 'CTO' }];
      await page.waitForChanges();

      expect(page.rootInstance.branchFilterResults).toBeNull();
    });
  });

  // ==========================================
  // Drag-and-drop interactions
  // ==========================================

  describe('drag-and-drop interactions', () => {
    it('sets draggedUserId, draggedUser and shows drop zones on dragstart', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
        { id: '2', firstName: 'Bob', lastName: 'Smith', role: 'CTO', reportsTo: '1' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      // Directly call the drag start handler
      const mockDataTransfer = {
        effectAllowed: '',
        setData: jest.fn(),
        setDragImage: jest.fn(),
      };
      const mockDragEvent = {
        stopPropagation: jest.fn(),
        dataTransfer: mockDataTransfer,
      } as unknown as DragEvent;

      page.rootInstance.handleDragStart(mockDragEvent, '1');
      await page.waitForChanges();

      expect(page.rootInstance.draggedUserId).toBe('1');
      expect(page.rootInstance.draggedUser).toBeTruthy();
      expect(page.rootInstance.draggedUser?.firstName).toBe('Alice');
      expect(page.rootInstance.showDropZones).toBe(true);
      expect(mockDataTransfer.setData).toHaveBeenCalledWith('text/plain', '1');
    });

    it('hides native drag image when Image is available (setDragImage called with transparent img)', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      // Manually set transparentImg to simulate browser environment with Image available
      const fakeImg = {} as HTMLImageElement;
      page.rootInstance['transparentImg'] = fakeImg;

      const mockDataTransfer = {
        effectAllowed: '',
        setData: jest.fn(),
        setDragImage: jest.fn(),
      };
      const mockDragEvent = {
        stopPropagation: jest.fn(),
        dataTransfer: mockDataTransfer,
      } as unknown as DragEvent;

      page.rootInstance.handleDragStart(mockDragEvent, '1');
      await page.waitForChanges();

      // setDragImage should be called to hide the native drag ghost (when transparentImg is available)
      expect(mockDataTransfer.setDragImage).toHaveBeenCalled();
      expect(mockDataTransfer.setDragImage).toHaveBeenCalledWith(fakeImg, 0, 0);
    });

    it('renders floating drag preview when draggedUser and dragPreviewPos are set', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      // No drag preview initially
      expect(page.root?.shadowRoot?.querySelector('.drag-preview')).toBeFalsy();

      // Simulate drag in progress
      page.rootInstance.draggedUser = users[0];
      page.rootInstance.dragPreviewPos = { x: 200, y: 150 };
      await page.waitForChanges();

      const preview = page.root?.shadowRoot?.querySelector('.drag-preview');
      expect(preview).toBeTruthy();

      // Should contain name
      const previewName = preview?.querySelector('.drag-preview__name');
      expect(previewName?.textContent).toBe('Alice Johnson');
    });

    it('drag preview shows avatar initials when no avatar URL', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      page.rootInstance.draggedUser = users[0];
      page.rootInstance.dragPreviewPos = { x: 100, y: 100 };
      await page.waitForChanges();

      const preview = page.root?.shadowRoot?.querySelector('.drag-preview');
      const avatarInitials = preview?.querySelector('.avatar-initials');
      expect(avatarInitials?.textContent).toBe('AJ');
    });

    it('drag preview shows avatar image when user has avatar URL', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO', avatar: 'https://example.com/alice.jpg' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      page.rootInstance.draggedUser = users[0];
      page.rootInstance.dragPreviewPos = { x: 100, y: 100 };
      await page.waitForChanges();

      const preview = page.root?.shadowRoot?.querySelector('.drag-preview');
      const avatarImg = preview?.querySelector('.avatar-img') as HTMLImageElement;
      expect(avatarImg?.src).toBe('https://example.com/alice.jpg');
    });

    it('drag preview is not rendered when dragPreviewPos is null', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      // draggedUser set but no position
      page.rootInstance.draggedUser = users[0];
      page.rootInstance.dragPreviewPos = null;
      await page.waitForChanges();

      expect(page.root?.shadowRoot?.querySelector('.drag-preview')).toBeFalsy();
    });

    it('sets dropTargetId on dragover with target', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
        { id: '2', firstName: 'Bob', lastName: 'Smith', role: 'CTO', reportsTo: '1' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const mockDataTransfer = { dropEffect: '' };
      const mockDragEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: mockDataTransfer,
      } as unknown as DragEvent;

      page.rootInstance.handleDragOver(mockDragEvent, '2');
      await page.waitForChanges();

      expect(page.rootInstance.dropTargetId).toBe('2');
    });

    it('clears dropTargetId on dragleave', async () => {
      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.dropTargetId = '2';
      await page.waitForChanges();

      const mockDragEvent = {
        stopPropagation: jest.fn(),
      } as unknown as DragEvent;

      page.rootInstance.handleDragLeave(mockDragEvent);
      await page.waitForChanges();

      expect(page.rootInstance.dropTargetId).toBeNull();
    });

    it('emits hierarchyChange event on drop with new manager', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
        { id: '2', firstName: 'Bob', lastName: 'Smith', role: 'CTO', reportsTo: '1' },
        { id: '3', firstName: 'Carol', lastName: 'Lee', role: 'Engineer', reportsTo: '1' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const hierarchyEvents: CustomEvent[] = [];
      page.root?.addEventListener('hierarchyChange', (ev: Event) => hierarchyEvents.push(ev as CustomEvent));

      const mockDragEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: { getData: jest.fn().mockReturnValue('3') },
      } as unknown as DragEvent;

      // Drop Carol onto Bob (make Carol report to Bob instead of Alice)
      page.rootInstance.handleDrop(mockDragEvent, '2');
      await page.waitForChanges();

      expect(hierarchyEvents.length).toBe(1);
      expect(hierarchyEvents[0].detail.userId).toBe('3');
      expect(hierarchyEvents[0].detail.oldManagerId).toBe('1');
      expect(hierarchyEvents[0].detail.newManagerId).toBe('2');
    });

    it('emits hierarchyChange with null manager on unlink drop', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
        { id: '2', firstName: 'Bob', lastName: 'Smith', role: 'CTO', reportsTo: '1' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const hierarchyEvents: CustomEvent[] = [];
      page.root?.addEventListener('hierarchyChange', (ev: Event) => hierarchyEvents.push(ev as CustomEvent));

      const mockDragEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: { getData: jest.fn().mockReturnValue('2') },
      } as unknown as DragEvent;

      // Unlink Bob by dropping to null manager
      page.rootInstance.handleDrop(mockDragEvent, null);
      await page.waitForChanges();

      expect(hierarchyEvents.length).toBe(1);
      expect(hierarchyEvents[0].detail.userId).toBe('2');
      expect(hierarchyEvents[0].detail.newManagerId).toBeNull();
    });

    it('cleans up drag state when same user dropped on themselves', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      page.rootInstance.showDropZones = true;
      page.rootInstance.draggedUserId = '1';
      await page.waitForChanges();

      const mockDragEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: { getData: jest.fn().mockReturnValue('1') },
      } as unknown as DragEvent;

      // Drop same user on themselves - no-op
      page.rootInstance.handleDrop(mockDragEvent, '1');
      await page.waitForChanges();

      expect(page.rootInstance.showDropZones).toBe(false);
      expect(page.rootInstance.draggedUserId).toBeNull();
    });

    it('cleans up drop state on drag end', async () => {
      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.showDropZones = true;
      page.rootInstance.draggedUserId = '1';
      page.rootInstance.dropTargetId = '2';
      await page.waitForChanges();

      const mockDragEvent = {
        stopPropagation: jest.fn(),
      } as unknown as DragEvent;

      page.rootInstance.handleDragEnd(mockDragEvent);
      await page.waitForChanges();

      expect(page.rootInstance.showDropZones).toBe(false);
      expect(page.rootInstance.draggedUserId).toBeNull();
      expect(page.rootInstance.dropTargetId).toBeNull();
    });

    it('handles drop when user is not found gracefully', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      page.rootInstance.showDropZones = true;
      await page.waitForChanges();

      const mockDragEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: { getData: jest.fn().mockReturnValue('nonexistent-id') },
      } as unknown as DragEvent;

      // Should not throw even with unknown user ID
      page.rootInstance.handleDrop(mockDragEvent, '1');
      await page.waitForChanges();

      expect(page.rootInstance.showDropZones).toBe(false);
    });
  });

  // ==========================================
  // SVG Drop zones
  // ==========================================

  describe('SVG drop zones', () => {
    it('drop zones render with SVG icons (not emoji) when showDropZones is true', async () => {
      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance['showDropZones'] = true;
      await page.waitForChanges();

      const dropZoneContainer = page.root?.shadowRoot?.querySelector('.drop-zone-container');
      expect(dropZoneContainer).toBeTruthy();

      // SVG icons should be present
      const svgIcons = page.root?.shadowRoot?.querySelectorAll('.drop-zone__icon');
      expect(svgIcons?.length).toBeGreaterThanOrEqual(2);

      // Each icon should be an SVG element
      Array.from(svgIcons || []).forEach(icon => {
        expect(icon.tagName.toLowerCase()).toBe('svg');
      });
    });

    it('drop zones use drop-zone-container class (not old drop-zones)', async () => {
      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance['showDropZones'] = true;
      await page.waitForChanges();

      // New class name
      expect(page.root?.shadowRoot?.querySelector('.drop-zone-container')).toBeTruthy();
      // Old class name should be gone
      expect(page.root?.shadowRoot?.querySelector('.drop-zones')).toBeFalsy();
    });

    it('drop zones render with Unlink and Delete labels', async () => {
      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance['showDropZones'] = true;
      await page.waitForChanges();

      const labels = page.root?.shadowRoot?.querySelectorAll('.drop-zone__label');
      const labelTexts = Array.from(labels || []).map(l => l.textContent);
      expect(labelTexts).toContain('Unlink');
      expect(labelTexts).toContain('Delete');
    });

    it('delete zone has drop-zone--delete class', async () => {
      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance['showDropZones'] = true;
      await page.waitForChanges();

      const deleteZone = page.root?.shadowRoot?.querySelector('.drop-zone--delete');
      expect(deleteZone).toBeTruthy();
    });

    it('unlink zone has drop-zone--unlink class', async () => {
      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance['showDropZones'] = true;
      await page.waitForChanges();

      const unlinkZone = page.root?.shadowRoot?.querySelector('.drop-zone--unlink');
      expect(unlinkZone).toBeTruthy();
    });
  });

  // ==========================================
  // Timed delete countdown
  // ==========================================

  describe('timed delete countdown', () => {
    it('renders countdown overlay when deleteHoldActive and deleteCountdownPos are set', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      // Show drop zones first
      page.rootInstance['showDropZones'] = true;
      page.rootInstance.deleteHoldActive = true;
      page.rootInstance.deleteHoldProgress = 0.5;
      page.rootInstance.deleteCountdownPos = { x: 200, y: 200 };
      await page.waitForChanges();

      const countdownOverlay = page.root?.shadowRoot?.querySelector('.countdown-overlay');
      expect(countdownOverlay).toBeTruthy();
    });

    it('countdown overlay contains SVG ring with countdown number', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      page.rootInstance['showDropZones'] = true;
      page.rootInstance.deleteHoldActive = true;
      page.rootInstance.deleteHoldProgress = 0.5;
      page.rootInstance.deleteCountdownPos = { x: 300, y: 300 };
      await page.waitForChanges();

      const overlay = page.root?.shadowRoot?.querySelector('.countdown-overlay');
      expect(overlay).toBeTruthy();

      const svgInOverlay = overlay?.querySelector('svg');
      expect(svgInOverlay).toBeTruthy();

      // Should show "2" seconds (0.5 progress = 2 seconds remaining)
      const textEl = overlay?.querySelector('text');
      expect(textEl?.textContent).toBe('2');
    });

    it('delete-holding class is applied to delete zone when deleteHoldActive is true', async () => {
      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance['showDropZones'] = true;
      page.rootInstance.deleteHoldActive = true;
      await page.waitForChanges();

      const deleteZone = page.root?.shadowRoot?.querySelector('.drop-zone--delete');
      expect(deleteZone).toHaveClass('delete-holding');
    });

    it('delete-holding class is NOT applied when deleteHoldActive is false', async () => {
      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance['showDropZones'] = true;
      page.rootInstance.deleteHoldActive = false;
      await page.waitForChanges();

      const deleteZone = page.root?.shadowRoot?.querySelector('.drop-zone--delete');
      expect(deleteZone).not.toHaveClass('delete-holding');
    });

    it('cancelDeleteHold resets deleteHoldActive to false and deleteHoldProgress to 0', async () => {
      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.deleteHoldActive = true;
      page.rootInstance.deleteHoldProgress = 0.75;
      page.rootInstance.deleteCountdownPos = { x: 100, y: 100 };
      await page.waitForChanges();

      page.rootInstance['cancelDeleteHold']();
      await page.waitForChanges();

      expect(page.rootInstance.deleteHoldActive).toBe(false);
      expect(page.rootInstance.deleteHoldProgress).toBe(0);
      expect(page.rootInstance.deleteCountdownPos).toBeNull();
    });

    it('handleDeleteZoneDragLeave cancels delete hold and clears dropTargetId', async () => {
      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      // No fake timers needed — we set state directly without starting any intervals
      page.rootInstance.deleteHoldActive = true;
      page.rootInstance.deleteHoldProgress = 0.5;
      page.rootInstance.deleteCountdownPos = { x: 100, y: 100 };
      page.rootInstance.dropTargetId = 'delete-zone';
      await page.waitForChanges();

      const mockEvent = {
        stopPropagation: jest.fn(),
      } as unknown as DragEvent;

      page.rootInstance['handleDeleteZoneDragLeave'](mockEvent);
      await page.waitForChanges();

      expect(page.rootInstance.deleteHoldActive).toBe(false);
      expect(page.rootInstance.deleteHoldProgress).toBe(0);
      expect(page.rootInstance.dropTargetId).toBeNull();
    });

    it('handleDeleteZoneRelease cancels delete hold without deleting user', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      page.rootInstance.draggedUserId = '1';
      page.rootInstance['showDropZones'] = true;
      page.rootInstance.deleteHoldActive = true;
      page.rootInstance.deleteHoldProgress = 0.5;
      await page.waitForChanges();

      const deleteEvents: CustomEvent[] = [];
      page.root?.addEventListener('userDelete', (ev: Event) => deleteEvents.push(ev as CustomEvent));

      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as unknown as DragEvent;

      page.rootInstance['handleDeleteZoneRelease'](mockEvent);
      await page.waitForChanges();

      // Should NOT have deleted user
      expect(deleteEvents.length).toBe(0);
      expect(page.rootInstance.deleteHoldActive).toBe(false);
      expect(page.rootInstance['showDropZones']).toBe(false);
    });

    it('emits userDelete after deleteHoldProgress reaches 1', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
        { id: '2', firstName: 'Bob', lastName: 'Smith', role: 'CTO', reportsTo: '1' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const deleteEvents: CustomEvent[] = [];
      page.root?.addEventListener('userDelete', (ev: Event) => deleteEvents.push(ev as CustomEvent));

      // Directly call deleteUser (what cancelDeleteHold + deleteUser chain does)
      page.rootInstance['deleteUser']('2');
      await page.waitForChanges();

      expect(deleteEvents.length).toBe(1);
      expect(deleteEvents[0].detail.userId).toBe('2');
    });

    it('does not delete non-existent user', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const deleteEvents: CustomEvent[] = [];
      page.root?.addEventListener('userDelete', (ev: Event) => deleteEvents.push(ev as CustomEvent));

      // Try to delete non-existent user
      page.rootInstance['deleteUser']('nonexistent-id');
      await page.waitForChanges();

      expect(deleteEvents.length).toBe(0);
    });
  });

  // ==========================================
  // Three-level tree rendering
  // ==========================================

  describe('three-level tree rendering', () => {
    it('renders correct parent-child relationships in 3-level deep tree', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
        { id: '2', firstName: 'Bob', lastName: 'Smith', role: 'VP', reportsTo: '1' },
        { id: '3', firstName: 'Carol', lastName: 'Lee', role: 'Manager', reportsTo: '2' },
        { id: '4', firstName: 'Dave', lastName: 'Park', role: 'Engineer', reportsTo: '3' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const treeNodes = page.root?.shadowRoot?.querySelectorAll('.tree-node');
      expect(treeNodes?.length).toBe(4);

      const userNames = Array.from(page.root?.shadowRoot?.querySelectorAll('.user-name') || [])
        .map(el => el.textContent);
      expect(userNames).toContain('Alice Johnson');
      expect(userNames).toContain('Bob Smith');
      expect(userNames).toContain('Carol Lee');
      expect(userNames).toContain('Dave Park');
    });

    it('renders with avatar img when user has avatar URL', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO', avatar: 'https://example.com/alice.jpg' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const avatarImg = page.root?.shadowRoot?.querySelector('.avatar-img') as HTMLImageElement;
      expect(avatarImg).toBeTruthy();
      expect(avatarImg?.src).toBe('https://example.com/alice.jpg');
    });

    it('renders avatar initials when no avatar URL', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const avatarInitials = page.root?.shadowRoot?.querySelector('.avatar-initials');
      expect(avatarInitials).toBeTruthy();
      expect(avatarInitials?.textContent).toBe('AJ');
    });

    it('renders branch entity (no lastName) initials using first char of firstName only', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Acme', role: 'Branch' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const avatarInitials = page.root?.shadowRoot?.querySelector('.avatar-initials');
      expect(avatarInitials?.textContent).toBe('A');
    });
  });

  // ==========================================
  // Drag-over visual feedback
  // ==========================================

  describe('drag-over visual feedback', () => {
    it('applies drag-over CSS class when drop target matches tile', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
        { id: '2', firstName: 'Bob', lastName: 'Smith', role: 'CTO', reportsTo: '1' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      // No drag-over initially
      const tiles = page.root?.shadowRoot?.querySelectorAll('.user-tile');
      Array.from(tiles || []).forEach(tile => {
        expect(tile).not.toHaveClass('drag-over');
      });

      // Simulate dragover on Bob's tile
      page.rootInstance.dropTargetId = '2';
      await page.waitForChanges();

      const tilesAfter = Array.from(page.root?.shadowRoot?.querySelectorAll('.user-tile') || []);
      const bobTile = tilesAfter.find(t => t.querySelector('.user-name')?.textContent === 'Bob Smith');
      expect(bobTile).toHaveClass('drag-over');
    });
  });

  // ==========================================
  // Fallback rendering without DWC theme
  // ==========================================

  describe('fallback rendering without DWC theme', () => {
    it('renders without errors when no DWC tokens are loaded', async () => {
      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      expect(page.root).toBeTruthy();
      expect(page.root?.shadowRoot).toBeTruthy();
    });

    it('renders user tiles with text content when users are provided', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'Chief Executive Officer' },
        { id: '2', firstName: 'Bob', lastName: 'Smith', role: 'Chief Technology Officer', reportsTo: '1' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const tiles = page.root?.shadowRoot?.querySelectorAll('.user-tile');
      expect(tiles?.length).toBe(2);

      Array.from(tiles || []).forEach(tile => {
        const name = tile.querySelector('.user-name');
        const role = tile.querySelector('.user-role');
        expect(name?.textContent?.trim().length).toBeGreaterThan(0);
        expect(role?.textContent?.trim().length).toBeGreaterThan(0);
      });
    });

    it('renders no-data message when users is empty', async () => {
      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      const noData = page.root?.shadowRoot?.querySelector('.no-data');
      expect(noData).toBeTruthy();
      expect(noData?.textContent?.trim()).toBe('No data available');
    });

    it('renders tree-container with children when data is provided', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
        { id: '2', firstName: 'Bob', lastName: 'Smith', role: 'CTO', reportsTo: '1' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const treeContainer = page.root?.shadowRoot?.querySelector('.tree-container');
      expect(treeContainer).toBeTruthy();
      expect(treeContainer?.children.length).toBeGreaterThan(0);
    });

    it('component structure has no toolbar (filter input removed)', async () => {
      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      // toolbar and filter-input are removed in Plan 02
      const toolbar = page.root?.shadowRoot?.querySelector('.org-chart-toolbar');
      expect(toolbar).toBeFalsy();

      const filterInput = page.root?.shadowRoot?.querySelector('.filter-input');
      expect(filterInput).toBeFalsy();
    });

    it('renders with theme-light class providing visual fallback', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart theme="light"></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      expect(page.root).toHaveClass('theme-light');
      const tile = page.root?.shadowRoot?.querySelector('.user-tile');
      expect(tile).toBeTruthy();
    });

    it('renders with theme-dark class providing visual fallback', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart theme="dark"></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      expect(page.root).toHaveClass('theme-dark');
    });

    it('avatar initials are readable as text content (fallback to initials when no image)', async () => {
      const users: User[] = [
        { id: '1', firstName: 'John', lastName: 'Doe', role: 'Director' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const initials = page.root?.shadowRoot?.querySelector('.avatar-initials');
      expect(initials?.textContent).toBe('JD');
    });

    it('drop zones render with labels when editable and dragging active', async () => {
      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.showDropZones = true;
      await page.waitForChanges();

      const dropZones = page.root?.shadowRoot?.querySelectorAll('.drop-zone');
      expect(dropZones?.length).toBeGreaterThanOrEqual(2);

      // Verify labels are present
      const labels = page.root?.shadowRoot?.querySelectorAll('.drop-zone__label');
      expect(labels?.length).toBeGreaterThanOrEqual(2);
      const labelTexts = Array.from(labels || []).map(l => l.textContent);
      expect(labelTexts).toContain('Unlink');
      expect(labelTexts).toContain('Delete');
    });
  });

  // ==========================================
  // disconnectedCallback cleanup
  // ==========================================

  describe('disconnectedCallback cleanup', () => {
    it('cleans up timers when component disconnects', async () => {
      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      // Manually set a timer to simulate pending timers
      page.rootInstance['clickTimer'] = window.setTimeout(() => {}, 10000);
      page.rootInstance['deleteHoldTimer'] = window.setInterval(() => {}, 100);

      // Call disconnectedCallback to trigger cleanup
      page.rootInstance.disconnectedCallback();

      expect(page.rootInstance['clickTimer']).toBeNull();
      expect(page.rootInstance['deleteHoldTimer']).toBeNull();
    });
  });

  // ==========================================
  // scrollToUser method
  // ==========================================

  describe('scrollToUser method', () => {
    it('calls scrollIntoView when element is found', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      // Mock customElements.whenDefined to resolve immediately
      const originalWhenDefined = customElements.whenDefined;
      customElements.whenDefined = jest.fn().mockResolvedValue(undefined);

      // Mock scrollIntoView on the element
      const userEl = page.root?.shadowRoot?.querySelector('[data-user-id="1"]') as HTMLElement;
      const scrollIntoViewMock = jest.fn();
      if (userEl) {
        userEl.scrollIntoView = scrollIntoViewMock;
      }

      await page.rootInstance.scrollToUser('1');

      expect(customElements.whenDefined).toHaveBeenCalledWith('sp-org-chart');
      if (userEl) {
        expect(scrollIntoViewMock).toHaveBeenCalledWith({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }

      customElements.whenDefined = originalWhenDefined;
    });

    it('does not throw when user element is not found', async () => {
      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      const originalWhenDefined = customElements.whenDefined;
      customElements.whenDefined = jest.fn().mockResolvedValue(undefined);

      // Should not throw even when no matching element
      await expect(page.rootInstance.scrollToUser('nonexistent-id')).resolves.toBeUndefined();

      customElements.whenDefined = originalWhenDefined;
    });
  });

  // ==========================================
  // Drop zone event handlers via direct method calls
  // ==========================================

  describe('drop zone event handlers via direct method calls', () => {
    it('handleDragOver without targetId does not set dropTargetId', async () => {
      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.showDropZones = true;
      await page.waitForChanges();

      const mockDragEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: { dropEffect: '' },
      } as unknown as DragEvent;

      page.rootInstance.handleDragOver(mockDragEvent);
      await page.waitForChanges();

      expect(page.rootInstance.dropTargetId).toBeNull();
    });

    it('handleDragLeave on drop zone clears dropTargetId', async () => {
      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.showDropZones = true;
      page.rootInstance.dropTargetId = 'some-id';
      await page.waitForChanges();

      const mockDragEvent = {
        stopPropagation: jest.fn(),
      } as unknown as DragEvent;

      page.rootInstance.handleDragLeave(mockDragEvent);
      await page.waitForChanges();

      expect(page.rootInstance.dropTargetId).toBeNull();
    });

    it('handles drop on unlink drop zone (null manager)', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
        { id: '2', firstName: 'Bob', lastName: 'Smith', role: 'CTO', reportsTo: '1' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      page.rootInstance.showDropZones = true;
      await page.waitForChanges();

      const hierarchyEvents: CustomEvent[] = [];
      page.root?.addEventListener('hierarchyChange', (ev: Event) => hierarchyEvents.push(ev as CustomEvent));

      const mockDragEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: { getData: jest.fn().mockReturnValue('2') },
      } as unknown as DragEvent;

      page.rootInstance.handleDrop(mockDragEvent, null);
      await page.waitForChanges();

      expect(hierarchyEvents.length).toBe(1);
      expect(hierarchyEvents[0].detail.newManagerId).toBeNull();
    });
  });

  // ==========================================
  // Editable tile event handlers in rendered DOM
  // ==========================================

  describe('editable tile event handlers in rendered DOM', () => {
    it('dragstart event handler on tile triggers drag start state', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      const tile = page.root?.shadowRoot?.querySelector('.user-tile') as HTMLElement;
      expect(tile).toBeTruthy();

      // Create and dispatch dragstart event
      const mockDataTransfer = {
        effectAllowed: '',
        setData: jest.fn(),
        setDragImage: jest.fn(),
      };
      const dragStartEvent = Object.assign(
        new Event('dragstart', { bubbles: false }),
        { stopPropagation: jest.fn(), dataTransfer: mockDataTransfer }
      );

      tile.dispatchEvent(dragStartEvent);
      await page.waitForChanges();

      expect(page.rootInstance.draggedUserId).toBe('1');
      expect(page.rootInstance.showDropZones).toBe(true);
    });

    it('dragend event handler on tile cleans up drag state', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      page.rootInstance.showDropZones = true;
      page.rootInstance.draggedUserId = '1';
      await page.waitForChanges();

      const tile = page.root?.shadowRoot?.querySelector('.user-tile') as HTMLElement;
      const dragEndEvent = Object.assign(
        new Event('dragend', { bubbles: false }),
        { stopPropagation: jest.fn() }
      );

      tile.dispatchEvent(dragEndEvent);
      await page.waitForChanges();

      expect(page.rootInstance.showDropZones).toBe(false);
      expect(page.rootInstance.draggedUserId).toBeNull();
    });
  });
});
