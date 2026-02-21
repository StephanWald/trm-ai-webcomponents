import { buildTree } from './tree-builder';
import { User } from '../types/org-chart.types';

describe('buildTree', () => {
  it('returns empty array when given empty array', () => {
    const result = buildTree([]);
    expect(result).toEqual([]);
  });

  it('returns single root when user has no reportsTo', () => {
    const users: User[] = [
      { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
    ];

    const result = buildTree(users);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
    expect(result[0].firstName).toBe('Alice');
    expect(result[0].lastName).toBe('Johnson');
    expect(result[0].children).toEqual([]);
    expect(result[0].level).toBe(0);
  });

  it('creates parent-child relationship when user has reportsTo', () => {
    const users: User[] = [
      { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      { id: '2', firstName: 'Bob', lastName: 'Smith', role: 'CTO', reportsTo: '1' },
    ];

    const result = buildTree(users);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children[0].id).toBe('2');
    expect(result[0].children[0].level).toBe(1);
  });

  it('returns multiple roots when multiple users have no reportsTo', () => {
    const users: User[] = [
      { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      { id: '2', firstName: 'Bob', lastName: 'Smith', role: 'COO' },
      { id: '3', firstName: 'Carol', lastName: 'Williams', role: 'CFO' },
    ];

    const result = buildTree(users);

    expect(result).toHaveLength(3);
    expect(result.map(r => r.id)).toEqual(expect.arrayContaining(['1', '2', '3']));
    result.forEach(root => {
      expect(root.level).toBe(0);
      expect(root.children).toEqual([]);
    });
  });

  it('treats orphaned user (reportsTo non-existent parent) as root', () => {
    const users: User[] = [
      { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      { id: '2', firstName: 'Bob', lastName: 'Smith', role: 'CTO', reportsTo: 'non-existent' },
    ];

    const result = buildTree(users);

    expect(result).toHaveLength(2);
    const orphan = result.find(r => r.id === '2');
    expect(orphan).toBeTruthy();
    expect(orphan?.level).toBe(0);
  });

  it('detects and handles circular reference (A -> B, B -> A)', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    const users: User[] = [
      { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO', reportsTo: '2' },
      { id: '2', firstName: 'Bob', lastName: 'Smith', role: 'CTO', reportsTo: '1' },
    ];

    const result = buildTree(users);

    // Both should be treated as roots
    expect(result).toHaveLength(2);
    expect(result.map(r => r.id)).toEqual(expect.arrayContaining(['1', '2']));

    // Console warning should be emitted
    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(consoleWarnSpy.mock.calls[0][0]).toContain('Circular');

    consoleWarnSpy.mockRestore();
  });

  it('calculates correct levels for multi-level hierarchy', () => {
    const users: User[] = [
      { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      { id: '2', firstName: 'Bob', lastName: 'Smith', role: 'CTO', reportsTo: '1' },
      { id: '3', firstName: 'Carol', lastName: 'Williams', role: 'Engineer', reportsTo: '2' },
    ];

    const result = buildTree(users);

    expect(result).toHaveLength(1);
    const root = result[0];
    expect(root.level).toBe(0);
    expect(root.children[0].level).toBe(1);
    expect(root.children[0].children[0].level).toBe(2);
  });

  it('builds correct tree structure for larger dataset with multiple levels', () => {
    const users: User[] = [
      { id: '1', firstName: 'Alice', lastName: 'Johnson', role: 'CEO' },
      { id: '2', firstName: 'Bob', lastName: 'Smith', role: 'CTO', reportsTo: '1' },
      { id: '3', firstName: 'Carol', lastName: 'Williams', role: 'CFO', reportsTo: '1' },
      { id: '4', firstName: 'Dave', lastName: 'Brown', role: 'Engineer', reportsTo: '2' },
      { id: '5', firstName: 'Eve', lastName: 'Davis', role: 'Engineer', reportsTo: '2' },
      { id: '6', firstName: 'Frank', lastName: 'Miller', role: 'Analyst', reportsTo: '3' },
    ];

    const result = buildTree(users);

    // Single root
    expect(result).toHaveLength(1);
    const ceo = result[0];
    expect(ceo.id).toBe('1');
    expect(ceo.level).toBe(0);

    // Two direct reports (CTO and CFO)
    expect(ceo.children).toHaveLength(2);
    const cto = ceo.children.find(c => c.id === '2');
    const cfo = ceo.children.find(c => c.id === '3');

    expect(cto).toBeTruthy();
    expect(cfo).toBeTruthy();
    expect(cto?.level).toBe(1);
    expect(cfo?.level).toBe(1);

    // CTO has two engineers reporting
    expect(cto?.children).toHaveLength(2);
    expect(cto?.children.map(c => c.id)).toEqual(expect.arrayContaining(['4', '5']));
    expect(cto?.children[0].level).toBe(2);

    // CFO has one analyst reporting
    expect(cfo?.children).toHaveLength(1);
    expect(cfo?.children[0].id).toBe('6');
    expect(cfo?.children[0].level).toBe(2);
  });

  it('preserves all user properties in tree nodes', () => {
    const users: User[] = [
      {
        id: '1',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'CEO',
        email: 'alice@example.com',
        phone: '555-0100',
        avatar: 'https://example.com/alice.jpg',
        branchId: 'branch-1',
        branchName: 'HQ',
        branchLogo: 'https://example.com/logo.png',
      },
    ];

    const result = buildTree(users);

    expect(result[0].id).toBe('1');
    expect(result[0].firstName).toBe('Alice');
    expect(result[0].lastName).toBe('Johnson');
    expect(result[0].role).toBe('CEO');
    expect(result[0].email).toBe('alice@example.com');
    expect(result[0].phone).toBe('555-0100');
    expect(result[0].avatar).toBe('https://example.com/alice.jpg');
    expect(result[0].branchId).toBe('branch-1');
    expect(result[0].branchName).toBe('HQ');
    expect(result[0].branchLogo).toBe('https://example.com/logo.png');
  });

  it('builds tree with branch entity (no lastName, has branchId/branchName/branchLogo)', () => {
    const users: User[] = [
      {
        id: 'branch-1',
        firstName: 'North Division',
        role: 'Branch',
        branchId: 'branch-1',
        branchName: 'North Division',
        branchLogo: 'https://example.com/north-logo.png',
      },
      {
        id: '2',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'Manager',
        reportsTo: 'branch-1',
        branchId: 'branch-1',
      },
    ];

    const result = buildTree(users);

    // Branch entity is root
    expect(result).toHaveLength(1);
    const branch = result[0];
    expect(branch.id).toBe('branch-1');
    expect(branch.firstName).toBe('North Division');
    expect(branch.lastName).toBeUndefined();
    expect(branch.branchLogo).toBe('https://example.com/north-logo.png');

    // Regular user reports to branch
    expect(branch.children).toHaveLength(1);
    expect(branch.children[0].id).toBe('2');
    expect(branch.children[0].level).toBe(1);
  });

  it('builds mixed tree with both regular users and branch entities', () => {
    const users: User[] = [
      // Branch entity at root
      {
        id: 'branch-1',
        firstName: 'West Coast',
        role: 'Branch',
        branchId: 'branch-1',
        branchName: 'West Coast',
        branchLogo: 'https://example.com/west-logo.png',
      },
      // Regular users under branch
      {
        id: '10',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'Director',
        reportsTo: 'branch-1',
        branchId: 'branch-1',
      },
      {
        id: '11',
        firstName: 'Bob',
        lastName: 'Smith',
        role: 'Engineer',
        reportsTo: '10',
        branchId: 'branch-1',
      },
    ];

    const result = buildTree(users);

    expect(result).toHaveLength(1);
    const branch = result[0];
    expect(branch.id).toBe('branch-1');
    expect(branch.children).toHaveLength(1);
    expect(branch.children[0].id).toBe('10');
    expect(branch.children[0].children).toHaveLength(1);
    expect(branch.children[0].children[0].id).toBe('11');
  });

  it('handles branch entity as standalone root node', () => {
    const users: User[] = [
      {
        id: 'branch-hq',
        firstName: 'Headquarters',
        role: 'Branch',
        branchId: 'branch-hq',
        branchName: 'Headquarters',
        branchLogo: 'https://example.com/hq-logo.png',
      },
    ];

    const result = buildTree(users);

    expect(result).toHaveLength(1);
    const branch = result[0];
    expect(branch.id).toBe('branch-hq');
    expect(branch.firstName).toBe('Headquarters');
    expect(branch.lastName).toBeUndefined();
    expect(branch.level).toBe(0);
    expect(branch.children).toHaveLength(0);
  });
});
