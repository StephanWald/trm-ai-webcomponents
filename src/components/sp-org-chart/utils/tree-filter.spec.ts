import { filterTree, filterByBranch } from './tree-filter';
import { TreeNode, getDisplayName } from '../types/org-chart.types';

describe('filterTree', () => {
  it('marks all nodes as not matched when predicate matches nothing', () => {
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
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'CEO',
        children: [
          {
            id: '2',
            firstName: 'Bob',
            lastName: 'Smith',
            role: 'CTO',
            children: [
              {
                id: '3',
                firstName: 'Carol',
                lastName: 'Williams',
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

    // Filter for Carol by display name
    const result = filterTree(tree, node => getDisplayName(node) === 'Carol Williams');

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
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'CEO',
        children: [
          {
            id: '2',
            firstName: 'Bob',
            lastName: 'Smith',
            role: 'Engineer',
            children: [],
            level: 1,
          },
          {
            id: '3',
            firstName: 'Carol',
            lastName: 'Williams',
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
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'CEO',
        children: [
          {
            id: '2',
            firstName: 'Bob',
            lastName: 'Smith',
            role: 'CTO',
            children: [],
            level: 1,
          },
        ],
        level: 0,
      },
    ];

    const result = filterTree(tree, node => getDisplayName(node) === 'Bob Smith');

    const parent = result.get('1');
    expect(parent?.matched).toBe(false);
    expect(parent?.isAncestorOfMatch).toBe(true);
    expect(parent?.hasMatchingDescendant).toBe(true);
  });

  it('marks children of matched node correctly', () => {
    const tree: TreeNode[] = [
      {
        id: '1',
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'CEO',
        children: [
          {
            id: '2',
            firstName: 'Bob',
            lastName: 'Smith',
            role: 'CTO',
            children: [
              {
                id: '3',
                firstName: 'Carol',
                lastName: 'Williams',
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
    const result = filterTree(tree, node => getDisplayName(node) === 'Bob Smith');

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
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'CEO',
        children: [
          {
            id: '2',
            firstName: 'Bob',
            lastName: 'Smith',
            role: 'Manager',
            children: [
              {
                id: '3',
                firstName: 'Carol',
                lastName: 'Williams',
                role: 'Engineer',
                children: [],
                level: 2,
              },
            ],
            level: 1,
          },
          {
            id: '4',
            firstName: 'Dave',
            lastName: 'Brown',
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
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'CEO',
        children: [
          {
            id: '2',
            firstName: 'Bob',
            lastName: 'Smith',
            role: 'CTO',
            children: [],
            level: 1,
          },
        ],
        level: 0,
      },
    ];

    const result = filterTree(tree, node => getDisplayName(node) === 'NonExistent');

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
        firstName: 'Alice',
        lastName: 'Johnson',
        role: 'CEO',
        children: [],
        level: 0,
      },
      {
        id: '2',
        firstName: 'Bob',
        lastName: 'Smith',
        role: 'COO',
        children: [],
        level: 0,
      },
    ];

    const result = filterTree(tree, node => getDisplayName(node) === 'Bob Smith');

    expect(result.size).toBe(2);
    expect(result.get('1')?.matched).toBe(false);
    expect(result.get('2')?.matched).toBe(true);
  });

  it('filters with mixed user and branch entities by role', () => {
    const tree: TreeNode[] = [
      {
        id: 'branch-1',
        firstName: 'North Division',
        role: 'Branch',
        branchId: 'branch-1',
        branchName: 'North Division',
        children: [
          {
            id: '10',
            firstName: 'Alice',
            lastName: 'Johnson',
            role: 'Engineer',
            branchId: 'branch-1',
            children: [],
            level: 1,
          },
        ],
        level: 0,
      },
    ];

    const result = filterTree(tree, node => node.role === 'Engineer');

    // Engineer matches
    expect(result.get('10')?.matched).toBe(true);
    // Branch entity is ancestor of match
    expect(result.get('branch-1')?.matched).toBe(false);
    expect(result.get('branch-1')?.isAncestorOfMatch).toBe(true);
  });
});

describe('filterByBranch', () => {
  const buildBranchTree = (): TreeNode[] => [
    // Branch A
    {
      id: 'branch-a',
      firstName: 'Branch A',
      role: 'Branch',
      branchId: 'branch-a',
      branchName: 'Branch A',
      children: [
        {
          id: '1',
          firstName: 'Alice',
          lastName: 'Johnson',
          role: 'Manager',
          branchId: 'branch-a',
          children: [
            {
              id: '2',
              firstName: 'Bob',
              lastName: 'Smith',
              role: 'Engineer',
              branchId: 'branch-a',
              children: [],
              level: 2,
            },
          ],
          level: 1,
        },
      ],
      level: 0,
    },
    // Branch B
    {
      id: 'branch-b',
      firstName: 'Branch B',
      role: 'Branch',
      branchId: 'branch-b',
      branchName: 'Branch B',
      children: [
        {
          id: '3',
          firstName: 'Carol',
          lastName: 'Williams',
          role: 'Manager',
          branchId: 'branch-b',
          children: [],
          level: 1,
        },
      ],
      level: 0,
    },
  ];

  it('filterByBranch highlight mode matches branch entity and its users by branchId', () => {
    const tree = buildBranchTree();
    const result = filterByBranch(tree, 'branch-a', 'highlight');

    // Branch A entity matched (its id === branchId)
    expect(result.get('branch-a')?.matched).toBe(true);

    // Alice and Bob matched (their branchId === 'branch-a')
    expect(result.get('1')?.matched).toBe(true);
    expect(result.get('2')?.matched).toBe(true);

    // Branch B and Carol do NOT match
    expect(result.get('branch-b')?.matched).toBe(false);
    expect(result.get('3')?.matched).toBe(false);
  });

  it('filterByBranch isolate mode produces same filter results as highlight mode', () => {
    const tree = buildBranchTree();
    const highlightResult = filterByBranch(tree, 'branch-a', 'highlight');
    const isolateResult = filterByBranch(tree, 'branch-a', 'isolate');

    // Filter results should be identical — the component handles the visual difference
    highlightResult.forEach((filterResult, id) => {
      expect(isolateResult.get(id)?.matched).toBe(filterResult.matched);
      expect(isolateResult.get(id)?.hasMatchingDescendant).toBe(filterResult.hasMatchingDescendant);
      expect(isolateResult.get(id)?.isAncestorOfMatch).toBe(filterResult.isAncestorOfMatch);
    });
  });

  it('filterByBranch matches branch entity by its own id (branch entity id === branchId)', () => {
    const tree: TreeNode[] = [
      {
        id: 'branch-hq',
        firstName: 'Headquarters',
        role: 'Branch',
        branchId: 'branch-hq',
        branchName: 'Headquarters',
        children: [],
        level: 0,
      },
    ];

    const result = filterByBranch(tree, 'branch-hq', 'highlight');
    expect(result.get('branch-hq')?.matched).toBe(true);
  });

  it('filterByBranch returns no matches for unknown branchId', () => {
    const tree = buildBranchTree();
    const result = filterByBranch(tree, 'branch-unknown', 'highlight');

    result.forEach(filterResult => {
      expect(filterResult.matched).toBe(false);
    });
  });

  it('filterByBranch preserves ancestor chain for matching users', () => {
    const tree = buildBranchTree();
    // Filter for branch-a — Bob (id: '2') is at level 2
    // branch-a -> Alice -> Bob
    const result = filterByBranch(tree, 'branch-a', 'highlight');

    // Branch A is matched (its id === branchId)
    expect(result.get('branch-a')?.matched).toBe(true);
    // Alice is matched and is also ancestor
    expect(result.get('1')?.matched).toBe(true);
    // Bob is matched
    expect(result.get('2')?.matched).toBe(true);
  });

  it('filterByBranch with mixed user and branch entities in same tree', () => {
    const tree: TreeNode[] = [
      {
        id: 'branch-a',
        firstName: 'Branch A',
        role: 'Branch',
        branchId: 'branch-a',
        branchName: 'Branch A',
        children: [
          {
            id: '1',
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
      {
        // A branch entity that belongs to branch-a by branchId, not id
        id: 'sub-branch',
        firstName: 'Sub Branch',
        role: 'Branch',
        branchId: 'branch-a',
        branchName: 'Sub Branch',
        children: [],
        level: 0,
      },
    ];

    const result = filterByBranch(tree, 'branch-a', 'highlight');

    // branch-a matched by id
    expect(result.get('branch-a')?.matched).toBe(true);
    // Alice matched by branchId
    expect(result.get('1')?.matched).toBe(true);
    // sub-branch (branch entity) matched by its branchId === 'branch-a'
    expect(result.get('sub-branch')?.matched).toBe(true);
  });
});
