/**
 * Type definitions for sp-org-chart component
 */

/**
 * User data structure with reporting relationships
 */
export interface User {
  id: string;
  name: string;
  role: string;
  reportsTo?: string;
  avatar?: string;
}

/**
 * Tree node extending User with hierarchical information
 */
export interface TreeNode extends User {
  children: TreeNode[];
  level: number;
}

/**
 * Filter result containing match information and tree context
 */
export interface FilterResult {
  node: TreeNode;
  matched: boolean;
  hasMatchingDescendant: boolean;
  isAncestorOfMatch: boolean;
}

/**
 * Event detail for hierarchy change events (drag-and-drop)
 */
export interface HierarchyChangeDetail {
  userId: string;
  oldManagerId: string | null;
  newManagerId: string | null;
}

/**
 * Event detail for user click/delete events
 */
export interface UserEventDetail {
  userId: string;
  user: User;
}
