import { TreeNode } from '../types/org-chart.types';

/**
 * Sort tree nodes alphabetically by name within each level
 * Recursively sorts children, preserving hierarchical structure
 *
 * @param nodes - Array of TreeNode(s) to sort
 * @returns New sorted array (does not mutate input)
 */
export function sortTree(nodes: TreeNode[]): TreeNode[] {
  // Sort nodes at current level alphabetically by name
  const sorted = [...nodes].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  // Recursively sort children for each node
  sorted.forEach(node => {
    if (node.children.length > 0) {
      node.children = sortTree(node.children);
    }
  });

  return sorted;
}
