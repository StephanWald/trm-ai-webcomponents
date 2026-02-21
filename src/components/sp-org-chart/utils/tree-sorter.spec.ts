import { sortTree } from './tree-sorter';
import { TreeNode, getDisplayName } from '../types/org-chart.types';

describe('sortTree', () => {
  it('returns empty array when given empty array', () => {
    const result = sortTree([]);
    expect(result).toEqual([]);
  });

  it('returns same node when given single node', () => {
    const tree: TreeNode[] = [
      {
        id: '1',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'CEO',
        children: [],
        level: 0,
      },
    ];

    const result = sortTree(tree);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('sorts two nodes alphabetically by display name (firstName lastName)', () => {
    const tree: TreeNode[] = [
      {
        id: '2',
        firstName: 'Bob',
        lastName: 'Smith',
        role: 'CTO',
        children: [],
        level: 0,
      },
      {
        id: '1',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'CEO',
        children: [],
        level: 0,
      },
    ];

    const result = sortTree(tree);

    expect(result).toHaveLength(2);
    expect(getDisplayName(result[0])).toBe('Alice Johnson');
    expect(getDisplayName(result[1])).toBe('Bob Smith');
  });

  it('performs case-insensitive sorting', () => {
    const tree: TreeNode[] = [
      {
        id: '2',
        firstName: 'bob',
        lastName: 'smith',
        role: 'CTO',
        children: [],
        level: 0,
      },
      {
        id: '1',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'CEO',
        children: [],
        level: 0,
      },
      {
        id: '3',
        firstName: 'CHARLIE',
        lastName: 'BROWN',
        role: 'CFO',
        children: [],
        level: 0,
      },
    ];

    const result = sortTree(tree);

    expect(result).toHaveLength(3);
    expect(getDisplayName(result[0])).toBe('Alice Johnson');
    expect(getDisplayName(result[1])).toBe('bob smith');
    expect(getDisplayName(result[2])).toBe('CHARLIE BROWN');
  });

  it('recursively sorts children', () => {
    const tree: TreeNode[] = [
      {
        id: '1',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'CEO',
        children: [
          {
            id: '3',
            firstName: 'Carol',
            lastName: 'Williams',
            role: 'CTO',
            children: [],
            level: 1,
          },
          {
            id: '2',
            firstName: 'Bob',
            lastName: 'Smith',
            role: 'CFO',
            children: [],
            level: 1,
          },
        ],
        level: 0,
      },
    ];

    const result = sortTree(tree);

    expect(result[0].children).toHaveLength(2);
    expect(getDisplayName(result[0].children[0])).toBe('Bob Smith');
    expect(getDisplayName(result[0].children[1])).toBe('Carol Williams');
  });

  it('does not mutate original array', () => {
    const tree: TreeNode[] = [
      {
        id: '2',
        firstName: 'Bob',
        lastName: 'Smith',
        role: 'CTO',
        children: [],
        level: 0,
      },
      {
        id: '1',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'CEO',
        children: [],
        level: 0,
      },
    ];

    const originalOrder = tree.map(n => n.firstName);
    const result = sortTree(tree);

    // Original array unchanged
    expect(tree.map(n => n.firstName)).toEqual(originalOrder);

    // Result is sorted
    expect(getDisplayName(result[0])).toBe('Alice Johnson');
    expect(getDisplayName(result[1])).toBe('Bob Smith');
  });

  it('sorts each level independently in nested tree', () => {
    const tree: TreeNode[] = [
      {
        id: '2',
        firstName: 'Zoe',
        lastName: 'Zhang',
        role: 'Division Head',
        children: [
          {
            id: '4',
            firstName: 'Yvonne',
            lastName: 'Young',
            role: 'Manager',
            children: [
              {
                id: '6',
                firstName: 'Xavier',
                lastName: 'Xu',
                role: 'Engineer',
                children: [],
                level: 2,
              },
              {
                id: '5',
                firstName: 'Walter',
                lastName: 'White',
                role: 'Engineer',
                children: [],
                level: 2,
              },
            ],
            level: 1,
          },
          {
            id: '3',
            firstName: 'Vincent',
            lastName: 'Vega',
            role: 'Manager',
            children: [],
            level: 1,
          },
        ],
        level: 0,
      },
      {
        id: '1',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'CEO',
        children: [],
        level: 0,
      },
    ];

    const result = sortTree(tree);

    // Level 0 sorted
    expect(getDisplayName(result[0])).toBe('Alice Johnson');
    expect(getDisplayName(result[1])).toBe('Zoe Zhang');

    // Level 1 sorted (under Zoe)
    expect(getDisplayName(result[1].children[0])).toBe('Vincent Vega');
    expect(getDisplayName(result[1].children[1])).toBe('Yvonne Young');

    // Level 2 sorted (under Yvonne)
    expect(getDisplayName(result[1].children[1].children[0])).toBe('Walter White');
    expect(getDisplayName(result[1].children[1].children[1])).toBe('Xavier Xu');
  });

  it('handles nodes with same display name', () => {
    const tree: TreeNode[] = [
      {
        id: '1',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'CEO',
        children: [],
        level: 0,
      },
      {
        id: '2',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'CTO',
        children: [],
        level: 0,
      },
    ];

    const result = sortTree(tree);

    expect(result).toHaveLength(2);
    expect(getDisplayName(result[0])).toBe('Alice Johnson');
    expect(getDisplayName(result[1])).toBe('Alice Johnson');
  });

  it('sorts branch entities by firstName only (no lastName)', () => {
    const tree: TreeNode[] = [
      {
        id: 'branch-c',
        firstName: 'Cedar Branch',
        role: 'Branch',
        branchId: 'branch-c',
        branchName: 'Cedar Branch',
        children: [],
        level: 0,
      },
      {
        id: 'branch-a',
        firstName: 'Aspen Branch',
        role: 'Branch',
        branchId: 'branch-a',
        branchName: 'Aspen Branch',
        children: [],
        level: 0,
      },
      {
        id: 'branch-b',
        firstName: 'Birch Branch',
        role: 'Branch',
        branchId: 'branch-b',
        branchName: 'Birch Branch',
        children: [],
        level: 0,
      },
    ];

    const result = sortTree(tree);

    expect(result).toHaveLength(3);
    expect(getDisplayName(result[0])).toBe('Aspen Branch');
    expect(getDisplayName(result[1])).toBe('Birch Branch');
    expect(getDisplayName(result[2])).toBe('Cedar Branch');
  });

  it('sorts mixed tree with branch entities and regular users', () => {
    const tree: TreeNode[] = [
      // Branch entity (no lastName) — sorts by firstName only
      {
        id: 'branch-a',
        firstName: 'Zeta Corp',
        role: 'Branch',
        branchId: 'branch-a',
        branchName: 'Zeta Corp',
        children: [
          {
            id: '3',
            firstName: 'Carol',
            lastName: 'Williams',
            role: 'Director',
            branchId: 'branch-a',
            children: [],
            level: 1,
          },
          {
            id: '2',
            firstName: 'Alice',
            lastName: 'Johnson',
            role: 'Manager',
            branchId: 'branch-a',
            children: [],
            level: 1,
          },
        ],
        level: 0,
      },
      // Regular user (has lastName) — sorts by "firstName lastName"
      {
        id: '1',
        firstName: 'Abel',
        lastName: 'Anderson',
        role: 'CEO',
        children: [],
        level: 0,
      },
    ];

    const result = sortTree(tree);

    // "Abel Anderson" < "Zeta Corp" alphabetically
    expect(getDisplayName(result[0])).toBe('Abel Anderson');
    expect(getDisplayName(result[1])).toBe('Zeta Corp');

    // Children under Zeta Corp sorted
    expect(getDisplayName(result[1].children[0])).toBe('Alice Johnson');
    expect(getDisplayName(result[1].children[1])).toBe('Carol Williams');
  });
});
