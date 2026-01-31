import { sortTree } from './tree-sorter';
import { TreeNode } from '../types/org-chart.types';

describe('sortTree', () => {
  it('returns empty array when given empty array', () => {
    const result = sortTree([]);
    expect(result).toEqual([]);
  });

  it('returns same node when given single node', () => {
    const tree: TreeNode[] = [
      {
        id: '1',
        name: 'Alice',
        role: 'CEO',
        children: [],
        level: 0,
      },
    ];

    const result = sortTree(tree);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('sorts two nodes alphabetically by name', () => {
    const tree: TreeNode[] = [
      {
        id: '2',
        name: 'Bob',
        role: 'CTO',
        children: [],
        level: 0,
      },
      {
        id: '1',
        name: 'Alice',
        role: 'CEO',
        children: [],
        level: 0,
      },
    ];

    const result = sortTree(tree);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
  });

  it('performs case-insensitive sorting', () => {
    const tree: TreeNode[] = [
      {
        id: '2',
        name: 'bob',
        role: 'CTO',
        children: [],
        level: 0,
      },
      {
        id: '1',
        name: 'Alice',
        role: 'CEO',
        children: [],
        level: 0,
      },
      {
        id: '3',
        name: 'CHARLIE',
        role: 'CFO',
        children: [],
        level: 0,
      },
    ];

    const result = sortTree(tree);

    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('bob');
    expect(result[2].name).toBe('CHARLIE');
  });

  it('recursively sorts children', () => {
    const tree: TreeNode[] = [
      {
        id: '1',
        name: 'Alice',
        role: 'CEO',
        children: [
          {
            id: '3',
            name: 'Carol',
            role: 'CTO',
            children: [],
            level: 1,
          },
          {
            id: '2',
            name: 'Bob',
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
    expect(result[0].children[0].name).toBe('Bob');
    expect(result[0].children[1].name).toBe('Carol');
  });

  it('does not mutate original array', () => {
    const tree: TreeNode[] = [
      {
        id: '2',
        name: 'Bob',
        role: 'CTO',
        children: [],
        level: 0,
      },
      {
        id: '1',
        name: 'Alice',
        role: 'CEO',
        children: [],
        level: 0,
      },
    ];

    const originalOrder = tree.map(n => n.name);
    const result = sortTree(tree);

    // Original array unchanged
    expect(tree.map(n => n.name)).toEqual(originalOrder);

    // Result is sorted
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
  });

  it('sorts each level independently in nested tree', () => {
    const tree: TreeNode[] = [
      {
        id: '2',
        name: 'Zoe',
        role: 'Division Head',
        children: [
          {
            id: '4',
            name: 'Yvonne',
            role: 'Manager',
            children: [
              {
                id: '6',
                name: 'Xavier',
                role: 'Engineer',
                children: [],
                level: 2,
              },
              {
                id: '5',
                name: 'Walter',
                role: 'Engineer',
                children: [],
                level: 2,
              },
            ],
            level: 1,
          },
          {
            id: '3',
            name: 'Vincent',
            role: 'Manager',
            children: [],
            level: 1,
          },
        ],
        level: 0,
      },
      {
        id: '1',
        name: 'Alice',
        role: 'CEO',
        children: [],
        level: 0,
      },
    ];

    const result = sortTree(tree);

    // Level 0 sorted
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Zoe');

    // Level 1 sorted (under Zoe)
    expect(result[1].children[0].name).toBe('Vincent');
    expect(result[1].children[1].name).toBe('Yvonne');

    // Level 2 sorted (under Yvonne)
    expect(result[1].children[1].children[0].name).toBe('Walter');
    expect(result[1].children[1].children[1].name).toBe('Xavier');
  });

  it('handles nodes with same name', () => {
    const tree: TreeNode[] = [
      {
        id: '1',
        name: 'Alice',
        role: 'CEO',
        children: [],
        level: 0,
      },
      {
        id: '2',
        name: 'Alice',
        role: 'CTO',
        children: [],
        level: 0,
      },
    ];

    const result = sortTree(tree);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Alice');
  });
});
