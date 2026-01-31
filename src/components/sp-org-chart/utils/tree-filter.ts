import { TreeNode, FilterResult } from '../types/org-chart.types';

/**
 * Filter tree to show matching nodes plus all descendants and ancestors
 * Uses two-pass DFS algorithm for complete context preservation
 *
 * @param roots - Array of root TreeNode(s)
 * @param predicate - Function to test if a node matches the filter
 * @returns Map of user ID to FilterResult
 */
export function filterTree(
  roots: TreeNode[],
  predicate: (node: TreeNode) => boolean
): Map<string, FilterResult> {
  const results = new Map<string, FilterResult>();

  // Pass 1: DFS bottom-up to mark direct matches and hasMatchingDescendant
  function markMatches(node: TreeNode): boolean {
    const directMatch = predicate(node);
    let hasMatchingDescendant = false;

    // Check all children first (bottom-up)
    for (const child of node.children) {
      if (markMatches(child)) {
        hasMatchingDescendant = true;
      }
    }

    results.set(node.id, {
      node,
      matched: directMatch,
      hasMatchingDescendant,
      isAncestorOfMatch: false,
    });

    // Node is relevant if it matches or has matching descendants
    return directMatch || hasMatchingDescendant;
  }

  // Pass 2: DFS top-down to mark ancestors of matches
  function markAncestors(node: TreeNode): boolean {
    let hasMatchInSubtree = false;

    // Check all children
    for (const child of node.children) {
      if (markAncestors(child)) {
        hasMatchInSubtree = true;
      }
    }

    const nodeResult = results.get(node.id)!;

    // If any child has a match, this node is an ancestor of a match
    if (hasMatchInSubtree) {
      nodeResult.isAncestorOfMatch = true;
    }

    // Return true if this node or its subtree has matches
    return nodeResult.matched || nodeResult.hasMatchingDescendant || nodeResult.isAncestorOfMatch;
  }

  // Execute both passes
  roots.forEach(root => markMatches(root));
  roots.forEach(root => markAncestors(root));

  return results;
}
