import { TreeNode, getDisplayName } from '../types/org-chart.types';

/**
 * Sort tree nodes alphabetically by display name within each level
 * Recursively sorts children, preserving hierarchical structure
 * Uses getDisplayName(node) which returns "firstName lastName" or just "firstName" for branches
 *
 * @param nodes - Array of TreeNode(s) to sort
 * @returns New sorted array (does not mutate input)
 */
export function sortTree(nodes: TreeNode[]): TreeNode[] {
  // Sort nodes at current level alphabetically by display name
  const sorted = [...nodes].sort((a, b) =>
    getDisplayName(a).localeCompare(getDisplayName(b), undefined, { sensitivity: 'base' })
  );

  // Recursively sort children for each node
  sorted.forEach(node => {
    if (node.children.length > 0) {
      node.children = sortTree(node.children);
    }
  });

  return sorted;
}
