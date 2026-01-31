import { filterTree } from './tree-filter';
import { TreeNode } from '../types/org-chart.types';

describe('filterTree', () => {
  it('marks all nodes as not matched when predicate matches nothing', () => {
    const tree: TreeNode[] = [
      {
        id: '1',
        name: 'Alice',
        role: 'CEO',
        children: [],
        level: 0,
      },
    ];

    const result = filterTree(tree, () => false);

    expect(result.size).toBe(1);
    const nodeResult = result.get('1');
    expect(nodeResult?.matched).toBe(false);
    expect(nodeResult?.hasMatchingDescendant).toBe(false);
    expect(nodeResult?.isAncestorOfMatch).toBe(false);
  });

  it('marks matching node and preserves ancestor chain', () => {
    const tree: TreeNode[] = [
      {
        id: '1',
        name: 'Alice',
        role: 'CEO',
        children: [
          {
            id: '2',
            name: 'Bob',
            role: 'CTO',
            children: [
              {
                id: '3',
                name: 'Carol',
                role: 'Engineer',
                children: [],
                level: 2,
              },
            ],
            level: 1,
          },
        ],
        level: 0,
      },
    ];

    // Filter for Carol
    const result = filterTree(tree, node => node.name === 'Carol');

    expect(result.size).toBe(3);

    // Carol (matched)
    const carol = result.get('3');
    expect(carol?.matched).toBe(true);
    expect(carol?.hasMatchingDescendant).toBe(false);
    expect(carol?.isAncestorOfMatch).toBe(false);

    // Bob (ancestor of match)
    const bob = result.get('2');
    expect(bob?.matched).toBe(false);
    expect(bob?.hasMatchingDescendant).toBe(true);
    expect(bob?.isAncestorOfMatch).toBe(true);

    // Alice (ancestor of match)
    const alice = result.get('1');
    expect(alice?.matched).toBe(false);
    expect(alice?.hasMatchingDescendant).toBe(true);
    expect(alice?.isAncestorOfMatch).toBe(true);
  });

  it('marks all nodes with matching role', () => {
    const tree: TreeNode[] = [
      {
        id: '1',
        name: 'Alice',
        role: 'CEO',
        children: [
          {
            id: '2',
            name: 'Bob',
            role: 'Engineer',
            children: [],
            level: 1,
          },
          {
            id: '3',
            name: 'Carol',
            role: 'Engineer',
            children: [],
            level: 1,
          },
        ],
        level: 0,
      },
    ];

    const result = filterTree(tree, node => node.role === 'Engineer');

    expect(result.size).toBe(3);

    // Both engineers matched
    expect(result.get('2')?.matched).toBe(true);
    expect(result.get('3')?.matched).toBe(true);

    // Alice is ancestor of matches
    expect(result.get('1')?.matched).toBe(false);
    expect(result.get('1')?.hasMatchingDescendant).toBe(true);
    expect(result.get('1')?.isAncestorOfMatch).toBe(true);
  });

  it('marks parent as ancestor when child matches', () => {
    const tree: TreeNode[] = [
      {
        id: '1',
        name: 'Alice',
        role: 'CEO',
        children: [
          {
            id: '2',
            name: 'Bob',
            role: 'CTO',
            children: [],
            level: 1,
          },
        ],
        level: 0,
      },
    ];

    const result = filterTree(tree, node => node.name === 'Bob');

    const parent = result.get('1');
    expect(parent?.matched).toBe(false);
    expect(parent?.isAncestorOfMatch).toBe(true);
    expect(parent?.hasMatchingDescendant).toBe(true);
  });

  it('marks children of matched node correctly', () => {
    const tree: TreeNode[] = [
      {
        id: '1',
        name: 'Alice',
        role: 'CEO',
        children: [
          {
            id: '2',
            name: 'Bob',
            role: 'CTO',
            children: [
              {
                id: '3',
                name: 'Carol',
                role: 'Engineer',
                children: [],
                level: 2,
              },
            ],
            level: 1,
          },
        ],
        level: 0,
      },
    ];

    // Match Bob (middle level)
    const result = filterTree(tree, node => node.name === 'Bob');

    // Bob is matched
    expect(result.get('2')?.matched).toBe(true);

    // Carol (child) is not matched but parent has match
    expect(result.get('3')?.matched).toBe(false);
    expect(result.get('3')?.hasMatchingDescendant).toBe(false);
    expect(result.get('3')?.isAncestorOfMatch).toBe(false);

    // Alice (parent) is ancestor of match
    expect(result.get('1')?.isAncestorOfMatch).toBe(true);
  });

  it('handles multiple matches at different levels', () => {
    const tree: TreeNode[] = [
      {
        id: '1',
        name: 'Alice',
        role: 'CEO',
        children: [
          {
            id: '2',
            name: 'Bob',
            role: 'Manager',
            children: [
              {
                id: '3',
                name: 'Carol',
                role: 'Engineer',
                children: [],
                level: 2,
              },
            ],
            level: 1,
          },
          {
            id: '4',
            name: 'Dave',
            role: 'Manager',
            children: [],
            level: 1,
          },
        ],
        level: 0,
      },
    ];

    // Match all managers
    const result = filterTree(tree, node => node.role === 'Manager');

    expect(result.get('2')?.matched).toBe(true);
    expect(result.get('4')?.matched).toBe(true);
    expect(result.get('1')?.isAncestorOfMatch).toBe(true);
    expect(result.get('3')?.matched).toBe(false);
  });

  it('returns correct results when no nodes match', () => {
    const tree: TreeNode[] = [
      {
        id: '1',
        name: 'Alice',
        role: 'CEO',
        children: [
          {
            id: '2',
            name: 'Bob',
            role: 'CTO',
            children: [],
            level: 1,
          },
        ],
        level: 0,
      },
    ];

    const result = filterTree(tree, node => node.name === 'NonExistent');

    expect(result.size).toBe(2);
    expect(result.get('1')?.matched).toBe(false);
    expect(result.get('1')?.hasMatchingDescendant).toBe(false);
    expect(result.get('1')?.isAncestorOfMatch).toBe(false);
    expect(result.get('2')?.matched).toBe(false);
    expect(result.get('2')?.hasMatchingDescendant).toBe(false);
    expect(result.get('2')?.isAncestorOfMatch).toBe(false);
  });

  it('handles multiple root nodes', () => {
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
        name: 'Bob',
        role: 'COO',
        children: [],
        level: 0,
      },
    ];

    const result = filterTree(tree, node => node.name === 'Bob');

    expect(result.size).toBe(2);
    expect(result.get('1')?.matched).toBe(false);
    expect(result.get('2')?.matched).toBe(true);
  });
});
