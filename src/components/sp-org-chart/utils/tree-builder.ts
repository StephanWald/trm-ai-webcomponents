import { User, TreeNode } from '../types/org-chart.types';

/**
 * Build hierarchical tree structure from flat user array
 * Uses two-pass Map-based algorithm for O(n) performance
 * Handles cycles, orphaned nodes, and empty arrays
 *
 * @param users - Flat array of users with reportsTo relationships
 * @returns Array of root TreeNode(s)
 */
export function buildTree(users: User[]): TreeNode[] {
  if (!users || users.length === 0) {
    return [];
  }

  const nodeMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // Pass 1: Create all nodes with empty children arrays
  users.forEach(user => {
    nodeMap.set(user.id, {
      ...user,
      children: [],
      level: 0,
    });
  });

  // Pass 2: Build parent-child relationships with cycle detection
  users.forEach(user => {
    const node = nodeMap.get(user.id)!;

    if (user.reportsTo) {
      // Check for cycles by traversing ancestor chain
      const ancestors = new Set<string>();
      let current: string | undefined = user.reportsTo;

      while (current) {
        if (current === user.id) {
          console.warn(`Circular reporting relationship detected for user ${user.id} (${user.name}). Treating as root.`);
          roots.push(node);
          return;
        }

        if (ancestors.has(current)) {
          // Cycle in ancestor chain (not involving current user directly)
          console.warn(`Cycle detected in ancestor chain for user ${user.id} (${user.name}). Treating as root.`);
          roots.push(node);
          return;
        }

        ancestors.add(current);
        const parent = nodeMap.get(current);
        current = parent?.reportsTo;
      }

      // No cycle detected, establish parent-child relationship
      const parent = nodeMap.get(user.reportsTo);
      if (parent) {
        parent.children.push(node);
        node.level = parent.level + 1;
      } else {
        // Parent not found in user array, treat as root (orphaned node)
        roots.push(node);
      }
    } else {
      // No reportsTo means this is a root node
      roots.push(node);
    }
  });

  return roots;
}
