import { buildTree } from './tree-builder';
import { User, TreeNode } from '../types/org-chart.types';

describe('buildTree', () => {
  it('returns empty array when given empty array', () => {
    const result = buildTree([]);
    expect(result).toEqual([]);
  });

  it('returns single root when user has no reportsTo', () => {
    const users: User[] = [
      { id: '1', name: 'Alice', role: 'CEO' },
    ];

    const result = buildTree(users);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
    expect(result[0].name).toBe('Alice');
    expect(result[0].children).toEqual([]);
    expect(result[0].level).toBe(0);
  });

  it('creates parent-child relationship when user has reportsTo', () => {
    const users: User[] = [
      { id: '1', name: 'Alice', role: 'CEO' },
      { id: '2', name: 'Bob', role: 'CTO', reportsTo: '1' },
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
      { id: '1', name: 'Alice', role: 'CEO' },
      { id: '2', name: 'Bob', role: 'COO' },
      { id: '3', name: 'Carol', role: 'CFO' },
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
      { id: '1', name: 'Alice', role: 'CEO' },
      { id: '2', name: 'Bob', role: 'CTO', reportsTo: 'non-existent' },
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
      { id: '1', name: 'Alice', role: 'CEO', reportsTo: '2' },
      { id: '2', name: 'Bob', role: 'CTO', reportsTo: '1' },
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
      { id: '1', name: 'Alice', role: 'CEO' },
      { id: '2', name: 'Bob', role: 'CTO', reportsTo: '1' },
      { id: '3', name: 'Carol', role: 'Engineer', reportsTo: '2' },
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
      { id: '1', name: 'Alice', role: 'CEO' },
      { id: '2', name: 'Bob', role: 'CTO', reportsTo: '1' },
      { id: '3', name: 'Carol', role: 'CFO', reportsTo: '1' },
      { id: '4', name: 'Dave', role: 'Engineer', reportsTo: '2' },
      { id: '5', name: 'Eve', role: 'Engineer', reportsTo: '2' },
      { id: '6', name: 'Frank', role: 'Analyst', reportsTo: '3' },
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
        name: 'Alice Johnson',
        role: 'CEO',
        avatar: 'https://example.com/alice.jpg',
      },
    ];

    const result = buildTree(users);

    expect(result[0].id).toBe('1');
    expect(result[0].name).toBe('Alice Johnson');
    expect(result[0].role).toBe('CEO');
    expect(result[0].avatar).toBe('https://example.com/alice.jpg');
  });
});
