import { TreeNode, FilterResult } from '../types/org-chart.types';
import { isBranch } from '../types/org-chart.types';

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

/**
 * Filter tree by branch ID. Returns a Map of FilterResult entries.
 * - mode 'highlight': dims non-matching users, keeps all branches visible
 * - mode 'isolate': hides unrelated branches entirely, dims non-matching users
 *
 * @param roots - Array of root TreeNode(s)
 * @param branchId - The branch ID to filter by
 * @param mode - Filter mode: 'highlight' or 'isolate'
 * @returns Map of user ID to FilterResult
 */
export function filterByBranch(
  roots: TreeNode[],
  branchId: string,
  mode: 'highlight' | 'isolate'
): Map<string, FilterResult> {
  // Use existing filterTree with a predicate that checks user.branchId === branchId
  // For 'highlight' mode: predicate matches users with matching branchId
  // For 'isolate' mode: same predicate, but the component will use the results
  //   to hide (display:none) branches that have zero matching users
  void mode; // mode consumed by the component layer, not the filter logic
  return filterTree(roots, (node) => {
    // Branch entities match if their branchId or id matches
    if (isBranch(node)) {
      return node.id === branchId || node.branchId === branchId;
    }
    // Regular users match if their branchId matches
    return node.branchId === branchId;
  });
}
