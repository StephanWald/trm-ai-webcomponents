import { Component, Prop, State, Event, EventEmitter, Method, Watch, Element, h, Host } from '@stencil/core';
import { User, TreeNode, FilterResult, HierarchyChangeDetail, UserEventDetail, BranchFilterMode, getDisplayName, isBranch } from './types/org-chart.types';
import { buildTree } from './utils/tree-builder';
import { filterByBranch } from './utils/tree-filter';
import { sortTree } from './utils/tree-sorter';

/**
 * @part no-data - No data message container
 * @part tree-container - Main tree container
 * @part user-tile - Individual user tile
 * @part drop-zone - Drop zone for drag-and-drop
 */
@Component({
  tag: 'sp-org-chart',
  styleUrl: 'sp-org-chart.css',
  shadow: true,
})
export class SpOrgChart {
  @Element() el: HTMLElement;

  /**
   * Flat array of users with reporting relationships
   */
  @Prop() users: User[] = [];

  /**
   * Enable/disable edit mode for drag-and-drop and deletion
   */
  @Prop() editable: boolean = true;

  /**
   * Custom message when users array is empty
   */
  @Prop() noDataMessage: string = 'No data available';

  /**
   * Theme override for standalone usage
   */
  @Prop() theme: 'light' | 'dark' | 'auto' = 'auto';

  /**
   * Branch filter mode — 'none' shows all, 'highlight' dims non-matching, 'isolate' hides unrelated branches
   */
  @Prop() filterMode: BranchFilterMode = 'none';

  /**
   * Branch ID to filter by when filterMode is not 'none'
   */
  @Prop() filterBranchId: string = '';

  @State() treeData: TreeNode[] = [];
  @State() selectedUserId: string | null = null;
  @State() highlightedUserId: string | null = null;
  @State() branchFilterResults: Map<string, FilterResult> | null = null;
  @State() draggedUserId: string | null = null;
  @State() showDropZones: boolean = false;
  @State() dropTargetId: string | null = null;
  @State() longPressUserId: string | null = null;
  @State() longPressProgress: number = 0;

  /**
   * Emitted when a user tile is clicked
   */
  @Event() userClick: EventEmitter<UserEventDetail>;

  /**
   * Emitted when a user tile is double-clicked
   */
  @Event() userDblclick: EventEmitter<UserEventDetail>;

  /**
   * Emitted when hierarchy changes via drag-and-drop
   */
  @Event() hierarchyChange: EventEmitter<HierarchyChangeDetail>;

  /**
   * Emitted when a user is deleted
   */
  @Event() userDelete: EventEmitter<UserEventDetail>;

  private clickTimer: number | null = null;
  private longPressTimer: number | null = null;
  private longPressStartTime: number = 0;
  private longPressStartPos: { x: number; y: number } | null = null;
  private readonly DOUBLE_CLICK_DELAY = 300;
  private readonly LONG_PRESS_DURATION = 4000;
  private readonly MOVEMENT_THRESHOLD = 10;

  @Watch('users')
  handleUsersChange() {
    this.rebuildTree();
  }

  @Watch('filterMode')
  handleFilterModeChange() {
    this.applyBranchFilter();
  }

  @Watch('filterBranchId')
  handleFilterBranchIdChange() {
    this.applyBranchFilter();
  }

  componentWillLoad() {
    this.rebuildTree();
  }

  disconnectedCallback() {
    this.cleanupTimers();
  }

  private cleanupTimers() {
    if (this.clickTimer) {
      window.clearTimeout(this.clickTimer);
      this.clickTimer = null;
    }
    if (this.longPressTimer) {
      window.clearInterval(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  private rebuildTree() {
    const tree = buildTree(this.users);
    this.treeData = sortTree(tree);
    this.branchFilterResults = null;
  }

  private applyBranchFilter() {
    if (this.filterMode === 'none' || !this.filterBranchId) {
      this.branchFilterResults = null;
    } else {
      this.branchFilterResults = filterByBranch(this.treeData, this.filterBranchId, this.filterMode);
    }
  }

  /**
   * Get the currently selected user
   */
  @Method()
  async getSelected(): Promise<User | null> {
    if (!this.selectedUserId) return null;
    return this.users.find(u => u.id === this.selectedUserId) || null;
  }

  /**
   * Highlight a specific user by ID
   */
  @Method()
  async highlightUser(userId: string): Promise<void> {
    this.highlightedUserId = userId;
  }

  /**
   * Clear all highlights
   */
  @Method()
  async clearHighlight(): Promise<void> {
    this.highlightedUserId = null;
  }

  /**
   * Scroll a user tile into view with smooth animation
   */
  @Method()
  async scrollToUser(userId: string): Promise<void> {
    await customElements.whenDefined('sp-org-chart');

    const userElement = this.el.shadowRoot?.querySelector(`[data-user-id="${userId}"]`);

    if (userElement) {
      userElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }

  // Click and double-click handling
  private handleUserClick = (ev: MouseEvent, node: TreeNode) => {
    ev.preventDefault();
    ev.stopPropagation();

    if (this.clickTimer) {
      // Double-click detected
      window.clearTimeout(this.clickTimer);
      this.clickTimer = null;
      this.handleDoubleClick(node);
    } else {
      // Single-click - wait to see if double-click comes
      this.clickTimer = window.setTimeout(() => {
        this.handleSingleClick(node);
        this.clickTimer = null;
      }, this.DOUBLE_CLICK_DELAY);
    }
  };

  private handleSingleClick(node: TreeNode) {
    this.selectedUserId = node.id;
    const user = this.users.find(u => u.id === node.id);
    if (user) {
      this.userClick.emit({ userId: node.id, user });
    }
  }

  private handleDoubleClick(node: TreeNode) {
    const user = this.users.find(u => u.id === node.id);
    if (user) {
      this.userDblclick.emit({ userId: node.id, user });
    }
  }

  // Drag-and-drop handling
  private handleDragStart = (ev: DragEvent, userId: string) => {
    ev.stopPropagation();
    ev.dataTransfer!.effectAllowed = 'move';
    ev.dataTransfer!.setData('text/plain', userId);
    this.draggedUserId = userId;
    this.showDropZones = true;
  };

  private handleDragOver = (ev: DragEvent, targetId?: string) => {
    ev.preventDefault();
    ev.stopPropagation();
    ev.dataTransfer!.dropEffect = 'move';
    if (targetId) {
      this.dropTargetId = targetId;
    }
  };

  private handleDragLeave = (ev: DragEvent) => {
    ev.stopPropagation();
    this.dropTargetId = null;
  };

  private handleDrop = (ev: DragEvent, newManagerId: string | null) => {
    ev.preventDefault();
    ev.stopPropagation();

    const draggedId = ev.dataTransfer!.getData('text/plain');
    if (!draggedId || draggedId === newManagerId) {
      this.cleanupDragState();
      return;
    }

    const user = this.users.find(u => u.id === draggedId);
    if (!user) {
      this.cleanupDragState();
      return;
    }

    const oldManagerId = user.reportsTo || null;
    user.reportsTo = newManagerId || undefined;

    this.hierarchyChange.emit({
      userId: draggedId,
      oldManagerId,
      newManagerId,
    });

    this.rebuildTree();
    this.cleanupDragState();
  };

  private handleDeleteDrop = (ev: DragEvent) => {
    ev.preventDefault();
    ev.stopPropagation();

    const draggedId = ev.dataTransfer!.getData('text/plain');
    if (!draggedId) {
      this.cleanupDragState();
      return;
    }

    this.deleteUser(draggedId);
    this.cleanupDragState();
  };

  private handleDragEnd = (ev: DragEvent) => {
    ev.stopPropagation();
    this.cleanupDragState();
  };

  private cleanupDragState() {
    this.showDropZones = false;
    this.draggedUserId = null;
    this.dropTargetId = null;
  }

  // Long-press handling
  private handlePointerDown = (ev: PointerEvent, userId: string) => {
    if (!this.editable) return;

    ev.stopPropagation();
    this.longPressStartTime = Date.now();
    this.longPressStartPos = { x: ev.clientX, y: ev.clientY };
    this.longPressUserId = userId;
    this.longPressProgress = 0;

    this.longPressTimer = window.setInterval(() => {
      const elapsed = Date.now() - this.longPressStartTime;
      this.longPressProgress = Math.min(elapsed / this.LONG_PRESS_DURATION, 1);

      if (this.longPressProgress >= 1) {
        this.handleLongPressComplete(userId);
      }
    }, 16); // ~60fps
  };

  private handlePointerMove = (ev: PointerEvent) => {
    if (!this.longPressStartPos || !this.longPressTimer) return;

    const dx = ev.clientX - this.longPressStartPos.x;
    const dy = ev.clientY - this.longPressStartPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.MOVEMENT_THRESHOLD) {
      this.cancelLongPress();
    }
  };

  private handlePointerUp = (ev: PointerEvent) => {
    ev.stopPropagation();
    this.cancelLongPress();
  };

  private cancelLongPress() {
    if (this.longPressTimer) {
      window.clearInterval(this.longPressTimer);
      this.longPressTimer = null;
    }
    this.longPressUserId = null;
    this.longPressProgress = 0;
    this.longPressStartPos = null;
  }

  private handleLongPressComplete(userId: string) {
    this.cancelLongPress();
    this.deleteUser(userId);
  }

  private deleteUser(userId: string) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    // Remove user from array
    this.users = this.users.filter(u => u.id !== userId);

    // Emit delete event
    this.userDelete.emit({ userId, user });

    // Rebuild tree
    this.rebuildTree();
  }

  // Rendering helpers
  private shouldHideNode(node: TreeNode): boolean {
    if (!this.branchFilterResults || this.filterMode !== 'isolate') return false;
    const result = this.branchFilterResults.get(node.id);
    if (!result) return true;
    // Hide if branch entity and not matching and no matching descendants
    if (isBranch(node)) {
      return !(result.matched || result.hasMatchingDescendant);
    }
    return false;
  }

  private shouldDimNode(node: TreeNode): boolean {
    if (!this.branchFilterResults) return false;
    const result = this.branchFilterResults.get(node.id);
    if (!result) return true;
    return !(result.matched || result.hasMatchingDescendant || result.isAncestorOfMatch);
  }

  private getUserInitials(node: TreeNode): string {
    const parts = [node.firstName];
    if (node.lastName) parts.push(node.lastName);
    return parts.map(p => p.charAt(0)).join('').toUpperCase();
  }

  private renderCountdownRing() {
    const circumference = 2 * Math.PI * 20;
    const offset = circumference * (1 - this.longPressProgress);

    return (
      <svg class="countdown-ring" width="50" height="50">
        <circle
          class="countdown-ring__circle"
          stroke="var(--dwc-color-danger, #dc3545)"
          stroke-width="3"
          fill="transparent"
          r="20"
          cx="25"
          cy="25"
          style={{
            strokeDasharray: `${circumference} ${circumference}`,
            strokeDashoffset: `${offset}`,
          }}
        />
      </svg>
    );
  }

  private renderTreeNode = (node: TreeNode) => {
    const isSelected = this.selectedUserId === node.id;
    const isHighlighted = this.highlightedUserId === node.id;
    const isDimmed = this.shouldDimNode(node);
    const isHidden = this.shouldHideNode(node);
    const isDragOver = this.dropTargetId === node.id;
    const isLongPressing = this.longPressUserId === node.id;
    const branchEntity = isBranch(node);

    if (isHidden) return null;

    const tileClasses = {
      'user-tile': true,
      'branch-tile': branchEntity,
      selected: isSelected,
      highlighted: isHighlighted,
      dimmed: isDimmed,
      'drag-over': isDragOver,
    };

    return (
      <div class="tree-node">
        <div
          class={tileClasses}
          part="user-tile"
          data-user-id={node.id}
          draggable={this.editable}
          onClick={ev => this.handleUserClick(ev, node)}
          onDragStart={this.editable ? ev => this.handleDragStart(ev, node.id) : undefined}
          onDragOver={this.editable ? ev => this.handleDragOver(ev, node.id) : undefined}
          onDragLeave={this.editable ? ev => this.handleDragLeave(ev) : undefined}
          onDrop={this.editable ? ev => this.handleDrop(ev, node.id) : undefined}
          onDragEnd={this.editable ? ev => this.handleDragEnd(ev) : undefined}
          onPointerDown={this.editable ? ev => this.handlePointerDown(ev, node.id) : undefined}
          onPointerMove={this.editable ? ev => this.handlePointerMove(ev) : undefined}
          onPointerUp={this.editable ? ev => this.handlePointerUp(ev) : undefined}
        >
          {/* Avatar — circular for users, square for branches */}
          <div class={{ 'user-avatar': true, 'branch-avatar': branchEntity }}>
            {node.avatar || node.branchLogo ? (
              <img src={branchEntity ? (node.branchLogo || node.avatar) : node.avatar} alt={getDisplayName(node)} class="avatar-img" />
            ) : (
              <div class="avatar-initials">{this.getUserInitials(node)}</div>
            )}
          </div>

          {/* Info section — horizontal layout to the right of avatar */}
          <div class="user-info">
            <div class="user-name">{getDisplayName(node)}</div>
            <div class="user-role">{node.role}</div>
            {node.email && <div class="user-email">{node.email}</div>}
            {node.phone && <div class="user-phone">{node.phone}</div>}
            {node.branchName && !branchEntity && (
              <div class="user-branch-badge">{node.branchName}</div>
            )}
          </div>

          {isLongPressing && this.renderCountdownRing()}
        </div>

        {/* Children indented below */}
        {node.children.length > 0 && (
          <div class="tree-children">
            {node.children.map(child => this.renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  private renderDropZones() {
    if (!this.showDropZones) return null;

    return (
      <div class="drop-zones">
        <div
          class="drop-zone drop-zone--unlink"
          part="drop-zone"
          onDragOver={ev => this.handleDragOver(ev)}
          onDrop={ev => this.handleDrop(ev, null)}
          onDragLeave={ev => this.handleDragLeave(ev)}
        >
          <span class="drop-zone__icon">&#x1F517;</span>
          <span class="drop-zone__label">Unlink</span>
        </div>

        <div
          class="drop-zone drop-zone--delete"
          part="drop-zone"
          onDragOver={ev => this.handleDragOver(ev)}
          onDrop={ev => this.handleDeleteDrop(ev)}
          onDragLeave={ev => this.handleDragLeave(ev)}
        >
          <span class="drop-zone__icon">&#x1F5D1;</span>
          <span class="drop-zone__label">Delete</span>
        </div>
      </div>
    );
  }

  render() {
    const hostClass = {
      'theme-light': this.theme === 'light',
      'theme-dark': this.theme === 'dark',
    };

    return (
      <Host class={hostClass}>
        {this.users.length === 0 && (
          <div class="no-data" part="no-data">
            {this.noDataMessage}
          </div>
        )}

        {this.users.length > 0 && (
          <div class="tree-container" part="tree-container">
            {this.treeData.map(root => this.renderTreeNode(root))}
          </div>
        )}

        {this.editable && this.renderDropZones()}
      </Host>
    );
  }
}
