/**
 * Type definitions for sp-org-chart component
 */

/**
 * User data structure with reporting relationships and branch information.
 * Branch entities are users without a lastName field.
 */
export interface User {
  id: string;
  firstName: string;
  lastName?: string;       // Absent for branch entities
  email?: string;
  phone?: string;
  role: string;
  avatar?: string;
  reportsTo?: string;
  branchId?: string;
  branchName?: string;
  branchLogo?: string;     // URL for branch square logo
}

/**
 * Get display name: "firstName lastName" or just "firstName" for branches
 */
export function getDisplayName(user: User): string {
  return user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
}

/**
 * Check if a user entry represents a branch entity (no lastName)
 */
export function isBranch(user: User): boolean {
  return !user.lastName;
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

/**
 * Branch filter mode for branch-based filtering
 */
export type BranchFilterMode = 'none' | 'highlight' | 'isolate';
