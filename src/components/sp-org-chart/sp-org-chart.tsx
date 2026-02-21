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
  @State() draggedUser: User | null = null;
  @State() dragPreviewPos: { x: number; y: number } | null = null;
  @State() showDropZones: boolean = false;
  @State() dropTargetId: string | null = null;
  @State() deleteHoldActive: boolean = false;
  @State() deleteHoldProgress: number = 0;
  @State() deleteCountdownPos: { x: number; y: number } | null = null;

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
  private deleteHoldTimer: number | null = null;
  private deleteHoldStartTime: number = 0;
  private transparentImg: HTMLImageElement;
  private readonly DOUBLE_CLICK_DELAY = 300;
  private readonly LONG_PRESS_DURATION = 4000;

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
    // Create 1x1 transparent image for hiding native drag ghost
    // Guard against JSDOM/test environment where Image may not be available
    if (typeof Image !== 'undefined') {
      this.transparentImg = new Image(1, 1);
      this.transparentImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }
  }

  disconnectedCallback() {
    this.cleanupTimers();
    document.removeEventListener('dragover', this.handleDocumentDragOver);
  }

  private cleanupTimers() {
    if (this.clickTimer) {
      window.clearTimeout(this.clickTimer);
      this.clickTimer = null;
    }
    if (this.deleteHoldTimer) {
      window.clearInterval(this.deleteHoldTimer);
      this.deleteHoldTimer = null;
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

  // Document-level dragover to track cursor position for floating preview
  private handleDocumentDragOver = (ev: DragEvent) => {
    ev.preventDefault();
    this.dragPreviewPos = { x: ev.clientX, y: ev.clientY };
  };

  // Drag-and-drop handling
  private handleDragStart = (ev: DragEvent, userId: string) => {
    ev.stopPropagation();
    ev.dataTransfer!.effectAllowed = 'move';
    ev.dataTransfer!.setData('text/plain', userId);

    // Hide native drag ghost
    if (this.transparentImg) {
      ev.dataTransfer!.setDragImage(this.transparentImg, 0, 0);
    }

    this.draggedUserId = userId;
    this.draggedUser = this.users.find(u => u.id === userId) || null;
    this.showDropZones = true;

    // Attach document-level dragover for preview tracking
    document.addEventListener('dragover', this.handleDocumentDragOver);
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

  private handleDragEnd = (ev: DragEvent) => {
    ev.stopPropagation();
    this.cleanupDragState();
  };

  // Delete drop zone handlers — timed 4-second hold
  private handleDeleteZoneDragOver = (ev: DragEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    ev.dataTransfer!.dropEffect = 'move';
    this.deleteCountdownPos = { x: ev.clientX, y: ev.clientY };

    if (!this.deleteHoldActive) {
      this.deleteHoldActive = true;
      this.deleteHoldStartTime = Date.now();
      this.deleteHoldProgress = 0;

      this.deleteHoldTimer = window.setInterval(() => {
        const elapsed = Date.now() - this.deleteHoldStartTime;
        this.deleteHoldProgress = Math.min(elapsed / this.LONG_PRESS_DURATION, 1);

        if (this.deleteHoldProgress >= 1) {
          // 4 seconds elapsed — execute delete
          this.cancelDeleteHold();
          const draggedId = this.draggedUserId;
          if (draggedId) {
            this.deleteUser(draggedId);
          }
          this.cleanupDragState();
        }
      }, 16);
    }
  };

  private handleDeleteZoneDragLeave = (ev: DragEvent) => {
    ev.stopPropagation();
    this.cancelDeleteHold();
    this.dropTargetId = null;
  };

  private handleDeleteZoneRelease = (ev: DragEvent) => {
    // Released before 4 seconds — cancel, no instant delete
    ev.preventDefault();
    ev.stopPropagation();
    this.cancelDeleteHold();
    this.cleanupDragState();
  };

  private cancelDeleteHold() {
    if (this.deleteHoldTimer) {
      window.clearInterval(this.deleteHoldTimer);
      this.deleteHoldTimer = null;
    }
    this.deleteHoldActive = false;
    this.deleteHoldProgress = 0;
    this.deleteCountdownPos = null;
  }

  private cleanupDragState() {
    document.removeEventListener('dragover', this.handleDocumentDragOver);
    this.showDropZones = false;
    this.draggedUserId = null;
    this.draggedUser = null;
    this.dragPreviewPos = null;
    this.dropTargetId = null;
    this.cancelDeleteHold();
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

  private renderDeleteCountdown() {
    if (!this.deleteCountdownPos) return null;

    const circumference = 2 * Math.PI * 20;
    const offset = circumference * (1 - this.deleteHoldProgress);
    const seconds = Math.ceil((1 - this.deleteHoldProgress) * 4);

    return (
      <div class="countdown-overlay" style={{
        left: `${this.deleteCountdownPos.x}px`,
        top: `${this.deleteCountdownPos.y - 60}px`,
      }}>
        <svg width="50" height="50" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="rgba(0,0,0,0.7)" />
          <circle
            class="countdown-ring__circle"
            cx="25" cy="25" r="20"
            fill="transparent"
            stroke="var(--dwc-color-danger, #dc3545)"
            stroke-width="3"
            style={{
              strokeDasharray: `${circumference} ${circumference}`,
              strokeDashoffset: `${offset}`,
            }}
          />
          <text x="25" y="30" text-anchor="middle" fill="white" font-size="16" font-weight="bold">{seconds}</text>
        </svg>
      </div>
    );
  }

  private renderTreeNode = (node: TreeNode) => {
    const isSelected = this.selectedUserId === node.id;
    const isHighlighted = this.highlightedUserId === node.id;
    const isDimmed = this.shouldDimNode(node);
    const isHidden = this.shouldHideNode(node);
    const isDragOver = this.dropTargetId === node.id;
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
      <div class="drop-zone-container">
        <div
          class="drop-zone drop-zone--unlink"
          part="drop-zone"
          onDragOver={ev => this.handleDragOver(ev)}
          onDrop={ev => this.handleDrop(ev, null)}
          onDragLeave={ev => this.handleDragLeave(ev)}
        >
          <svg class="drop-zone__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          <span class="drop-zone__label">Unlink</span>
        </div>

        <div
          class={{ 'drop-zone': true, 'drop-zone--delete': true, 'delete-holding': this.deleteHoldActive }}
          part="drop-zone"
          onDragOver={ev => this.handleDeleteZoneDragOver(ev)}
          onDrop={ev => this.handleDeleteZoneRelease(ev)}
          onDragLeave={ev => this.handleDeleteZoneDragLeave(ev)}
        >
          <svg class="drop-zone__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
          <span class="drop-zone__label">Delete</span>
          {this.deleteHoldActive && this.renderDeleteCountdown()}
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

        {/* Floating drag preview — renders outside shadow scroll */}
        {this.draggedUser && this.dragPreviewPos && (
          <div class="drag-preview" style={{
            left: `${this.dragPreviewPos.x + 12}px`,
            top: `${this.dragPreviewPos.y + 12}px`,
          }}>
            <div class="drag-preview__avatar">
              {this.draggedUser.avatar ? (
                <img src={this.draggedUser.avatar} alt="" class="avatar-img" />
              ) : (
                <div class="avatar-initials">{this.getUserInitials(this.draggedUser as unknown as TreeNode)}</div>
              )}
            </div>
            <div class="drag-preview__name">{getDisplayName(this.draggedUser)}</div>
          </div>
        )}
      </Host>
    );
  }
}
