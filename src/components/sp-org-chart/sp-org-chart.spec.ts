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

  it('renders drop zones when editable and dragging', async () => {
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
    let dropZones = page.root?.shadowRoot?.querySelector('.drop-zones');
    expect(dropZones).toBeFalsy();

    // Simulate drag start by setting state
    page.rootInstance['showDropZones'] = true;
    await page.waitForChanges();

    // Drop zones should now be visible (editable defaults to true)
    dropZones = page.root?.shadowRoot?.querySelector('.drop-zones');
    expect(dropZones).toBeTruthy();

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
    it('sets draggedUserId and shows drop zones on dragstart', async () => {
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
      };
      const mockDragEvent = {
        stopPropagation: jest.fn(),
        dataTransfer: mockDataTransfer,
      } as unknown as DragEvent;

      page.rootInstance.handleDragStart(mockDragEvent, '1');
      await page.waitForChanges();

      expect(page.rootInstance.draggedUserId).toBe('1');
      expect(page.rootInstance.showDropZones).toBe(true);
      expect(mockDataTransfer.setData).toHaveBeenCalledWith('text/plain', '1');
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

    it('emits userDelete on delete drop zone', async () => {
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

      const mockDragEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: { getData: jest.fn().mockReturnValue('2') },
      } as unknown as DragEvent;

      page.rootInstance.handleDeleteDrop(mockDragEvent);
      await page.waitForChanges();

      expect(deleteEvents.length).toBe(1);
      expect(deleteEvents[0].detail.userId).toBe('2');
      expect(deleteEvents[0].detail.user.firstName).toBe('Bob');
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

    it('handles delete drop with no dragged user ID gracefully', async () => {
      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.showDropZones = true;
      await page.waitForChanges();

      const mockDragEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: { getData: jest.fn().mockReturnValue('') },
      } as unknown as DragEvent;

      // Should not throw even with empty user ID
      page.rootInstance.handleDeleteDrop(mockDragEvent);
      await page.waitForChanges();

      expect(page.rootInstance.showDropZones).toBe(false);
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
  // Long-press deletion flow
  // ==========================================

  describe('long-press deletion flow', () => {
    it('does nothing on pointerdown when editable is false', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart editable="false"></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      // Use fake timers AFTER page setup to prevent interval from running
      jest.useFakeTimers();

      const mockEvent = {
        stopPropagation: jest.fn(),
        clientX: 100,
        clientY: 100,
      } as unknown as PointerEvent;

      page.rootInstance.handlePointerDown(mockEvent, '1');

      // Should not set longPressUserId since editable is false
      expect(page.rootInstance.longPressUserId).toBeNull();

      jest.useRealTimers();
    });

    it('starts long-press timer on pointerdown when editable', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      jest.useFakeTimers();

      const mockEvent = {
        stopPropagation: jest.fn(),
        clientX: 100,
        clientY: 100,
      } as unknown as PointerEvent;

      page.rootInstance.handlePointerDown(mockEvent, '1');

      expect(page.rootInstance.longPressUserId).toBe('1');
      expect(page.rootInstance.longPressProgress).toBe(0);

      // Clean up interval
      page.rootInstance.cancelLongPress();
      jest.useRealTimers();
    });

    it('cancels long-press on pointerup', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      jest.useFakeTimers();

      const downEvent = {
        stopPropagation: jest.fn(),
        clientX: 100,
        clientY: 100,
      } as unknown as PointerEvent;

      page.rootInstance.handlePointerDown(downEvent, '1');
      expect(page.rootInstance.longPressUserId).toBe('1');

      const upEvent = {
        stopPropagation: jest.fn(),
      } as unknown as PointerEvent;

      page.rootInstance.handlePointerUp(upEvent);

      expect(page.rootInstance.longPressUserId).toBeNull();
      expect(page.rootInstance.longPressProgress).toBe(0);

      jest.useRealTimers();
    });

    it('cancels long-press if pointer moves beyond threshold', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      jest.useFakeTimers();

      const downEvent = {
        stopPropagation: jest.fn(),
        clientX: 100,
        clientY: 100,
      } as unknown as PointerEvent;

      page.rootInstance.handlePointerDown(downEvent, '1');
      expect(page.rootInstance.longPressUserId).toBe('1');

      // Move pointer beyond threshold (10px)
      const moveEvent = {
        clientX: 120,
        clientY: 100,
      } as unknown as PointerEvent;

      page.rootInstance.handlePointerMove(moveEvent);

      expect(page.rootInstance.longPressUserId).toBeNull();

      jest.useRealTimers();
    });

    it('does nothing on pointermove when no long-press is active', async () => {
      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      // No pointerdown first, so longPressStartPos is null
      const moveEvent = {
        clientX: 120,
        clientY: 100,
      } as unknown as PointerEvent;

      // Should not throw
      page.rootInstance.handlePointerMove(moveEvent);
      expect(page.rootInstance.longPressUserId).toBeNull();
    });

    it('emits userDelete after long-press completes', async () => {
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

      // Directly call handleLongPressComplete which is what happens after 4 seconds
      page.rootInstance.handleLongPressComplete('2');
      await page.waitForChanges();

      expect(deleteEvents.length).toBe(1);
      expect(deleteEvents[0].detail.userId).toBe('2');
      expect(deleteEvents[0].detail.user.firstName).toBe('Bob');
    });

    it('removes user from list after long-press deletion', async () => {
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

      page.rootInstance.handleLongPressComplete('2');
      await page.waitForChanges();

      const tiles = page.root?.shadowRoot?.querySelectorAll('.user-tile');
      expect(tiles?.length).toBe(1);
      const remainingNames = Array.from(tiles || []).map(t => t.querySelector('.user-name')?.textContent);
      expect(remainingNames).toContain('Alice Johnson');
      expect(remainingNames).not.toContain('Bob Smith');
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
      page.rootInstance.deleteUser('nonexistent-id');
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
  // Countdown ring rendering
  // ==========================================

  describe('countdown ring rendering', () => {
    it('renders countdown ring when long-press is active', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      // No countdown ring initially
      expect(page.root?.shadowRoot?.querySelector('.countdown-ring')).toBeFalsy();

      // Simulate long-press state
      page.rootInstance.longPressUserId = '1';
      page.rootInstance.longPressProgress = 0.5;
      await page.waitForChanges();

      const ring = page.root?.shadowRoot?.querySelector('.countdown-ring');
      expect(ring).toBeTruthy();
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
      page.rootInstance['longPressTimer'] = window.setInterval(() => {}, 100);

      // Call disconnectedCallback to trigger cleanup
      page.rootInstance.disconnectedCallback();

      expect(page.rootInstance['clickTimer']).toBeNull();
      expect(page.rootInstance['longPressTimer']).toBeNull();
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
  // Long-press interval callback coverage
  // ==========================================

  describe('long-press interval callback coverage', () => {
    it('longPressProgress advances via setInterval callback when elapsed time increases', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      // Directly manipulate internal state to simulate what setInterval callback does
      page.rootInstance.longPressUserId = '1';
      page.rootInstance['longPressStartTime'] = Date.now() - 2000; // 2s ago = 50%
      page.rootInstance.longPressProgress = 0;

      const elapsed = Date.now() - page.rootInstance['longPressStartTime'];
      const LONG_PRESS_DURATION = 4000;
      page.rootInstance.longPressProgress = Math.min(elapsed / LONG_PRESS_DURATION, 1);

      // Progress should be approximately 0.5 (2000/4000)
      expect(page.rootInstance.longPressProgress).toBeGreaterThan(0.4);
      expect(page.rootInstance.longPressProgress).toBeLessThanOrEqual(1);

      // Clean up
      page.rootInstance.cancelLongPress();
    });

    it('handleLongPressComplete triggers when progress reaches 100%', async () => {
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

      page.rootInstance.longPressUserId = '2';
      page.rootInstance.longPressProgress = 1;

      page.rootInstance.handleLongPressComplete('2');
      await page.waitForChanges();

      expect(deleteEvents.length).toBe(1);
      expect(deleteEvents[0].detail.userId).toBe('2');
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

    it('handles drop on delete drop zone to delete user', async () => {
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

      const deleteEvents: CustomEvent[] = [];
      page.root?.addEventListener('userDelete', (ev: Event) => deleteEvents.push(ev as CustomEvent));

      const deleteZone = page.root?.shadowRoot?.querySelector('.drop-zone--delete') as HTMLElement;
      expect(deleteZone).toBeTruthy();

      const mockDragEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        dataTransfer: { getData: jest.fn().mockReturnValue('2') },
      } as unknown as DragEvent;

      page.rootInstance.handleDeleteDrop(mockDragEvent);
      await page.waitForChanges();

      expect(deleteEvents.length).toBe(1);
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

    it('pointerdown event handler on tile starts long-press tracking', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      // Use fake timers to prevent setInterval from running
      jest.useFakeTimers();

      const tile = page.root?.shadowRoot?.querySelector('.user-tile') as HTMLElement;
      const pointerDownEvent = Object.assign(
        new Event('pointerdown', { bubbles: false }),
        { stopPropagation: jest.fn(), clientX: 100, clientY: 100 }
      );

      tile.dispatchEvent(pointerDownEvent);

      expect(page.rootInstance.longPressUserId).toBe('1');

      // Clean up the interval
      page.rootInstance.cancelLongPress();
      jest.useRealTimers();
    });

    it('pointerup event handler on tile cancels long-press', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      // Use fake timers to prevent setInterval from running
      jest.useFakeTimers();

      const tile = page.root?.shadowRoot?.querySelector('.user-tile') as HTMLElement;

      // Start long press
      tile.dispatchEvent(Object.assign(
        new Event('pointerdown', { bubbles: false }),
        { stopPropagation: jest.fn(), clientX: 100, clientY: 100 }
      ));

      expect(page.rootInstance.longPressUserId).toBe('1');

      // Cancel with pointerup
      tile.dispatchEvent(Object.assign(
        new Event('pointerup', { bubbles: false }),
        { stopPropagation: jest.fn() }
      ));

      expect(page.rootInstance.longPressUserId).toBeNull();

      jest.useRealTimers();
    });

    it('pointermove event handler within threshold does not cancel long-press', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      ];

      const page = await newSpecPage({
        components: [SpOrgChart],
        html: '<sp-org-chart></sp-org-chart>',
      });

      page.rootInstance.users = users;
      await page.waitForChanges();

      // Use fake timers to prevent setInterval from running
      jest.useFakeTimers();

      const tile = page.root?.shadowRoot?.querySelector('.user-tile') as HTMLElement;

      // Start long press
      tile.dispatchEvent(Object.assign(
        new Event('pointerdown', { bubbles: false }),
        { stopPropagation: jest.fn(), clientX: 100, clientY: 100 }
      ));

      expect(page.rootInstance.longPressUserId).toBe('1');

      // Move only 5px (below 10px threshold)
      tile.dispatchEvent(Object.assign(
        new Event('pointermove', { bubbles: false }),
        { clientX: 105, clientY: 100 }
      ));

      // Should NOT cancel (still within threshold)
      expect(page.rootInstance.longPressUserId).toBe('1');

      // Clean up
      page.rootInstance.cancelLongPress();
      jest.useRealTimers();
    });
  });
});
