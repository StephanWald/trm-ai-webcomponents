# Phase 2: OrgChart Component - Research

**Researched:** 2026-01-31
**Domain:** Hierarchical tree visualization, drag-and-drop interactions, web components
**Confidence:** HIGH

## Summary

The OrgChart component requires implementing a hierarchical tree visualization with drag-and-drop reorganization, filtering, and comprehensive interaction patterns. The standard approach for 2026 involves using native HTML5 drag-and-drop API with Stencil's component lifecycle, implementing tree structure using flat-to-hierarchy transformation algorithms, and using either SVG or CSS-based visual connectors for parent-child relationships.

Key technical decisions include: using native drag-and-drop over third-party libraries for maximum control and minimal dependencies; implementing tree filtering with ancestor-chain preservation using depth-first traversal; exposing component methods via Stencil's @Method() decorator for programmatic control; and using native scrollIntoView with smooth behavior for scroll-to-user functionality.

The component should implement ARIA tree/treeitem roles with proper keyboard navigation for accessibility, though for an org chart focused on visual hierarchy rather than file navigation, a simpler role="list" approach may be more appropriate depending on user needs.

**Primary recommendation:** Build with native HTML5 drag-and-drop API, implement flat-to-tree transformation with Map-based lookups for O(n) performance, use CSS flexbox/grid for layout with SVG or CSS borders for connectors, and expose all required methods via @Method() decorator following Stencil async patterns.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Native HTML5 Drag-and-Drop API | - | Drag-and-drop functionality | Built-in browser API, zero dependencies, well-supported across browsers, provides full control over drag behavior |
| Stencil @Method() decorator | 4.41.0+ | Exposing public API methods | Official Stencil pattern for public component methods, ensures async compatibility with lazy loading |
| Stencil @Event() decorator | 4.41.0+ | Custom event emission | Official Stencil pattern for component events, provides standardized event handling |
| scrollIntoView() API | - | Scroll-to-user functionality | Native browser API with smooth behavior support, no dependencies needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| SortableJS | 1.15+ | Alternative drag-and-drop | Only if requiring complex sortable lists with animations; adds 30kb to bundle |
| D3-hierarchy | 3.x | Tree layout algorithms | Only if requiring complex tree layouts beyond simple vertical/horizontal; adds significant bundle size |
| long-press-event | 2.5+ | Long-press detection | Lightweight (1kb) library for cross-device long-press; alternative to manual implementation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native drag-and-drop | SortableJS | SortableJS provides animations and polished UX but adds 30kb and another dependency; use only if animations are critical |
| Manual long-press | long-press-event library | Library is 1kb and battle-tested; manual implementation is acceptable for learning but library handles edge cases |
| CSS connectors | SVG connectors | SVG provides more flexibility for curved lines but CSS borders are simpler for straight orthogonal lines |
| Flat array with Map | Nested tree structure | Flat array with reportsTo is more flexible for updates; nested structure is harder to modify dynamically |

**Installation:**
```bash
# No additional libraries required for core functionality
npm install @stencil/core@^4.41.0

# Optional: If choosing long-press library approach
npm install long-press-event@^2.5.0
```

## Architecture Patterns

### Recommended Project Structure
```
src/components/sp-org-chart/
├── sp-org-chart.tsx           # Main component class
├── sp-org-chart.css           # Component styles
├── sp-org-chart.spec.ts       # Jest unit tests
├── sp-org-chart.e2e.ts        # Playwright E2E tests
├── utils/
│   ├── tree-builder.ts        # Flat-to-hierarchy transformation
│   ├── tree-filter.ts         # Filter with ancestor chain preservation
│   └── tree-sorter.ts         # Alphabetical sorting within levels
└── types/
    └── org-chart.types.ts     # User, TreeNode, FilterResult interfaces
```

### Pattern 1: Flat Array to Tree Hierarchy Transformation
**What:** Convert flat array with `reportsTo` relationships into hierarchical tree structure
**When to use:** On component initialization and when user array updates
**Example:**
```typescript
// Source: GeeksforGeeks "Build tree array from flat array in JavaScript"
interface User {
  id: string;
  name: string;
  role: string;
  reportsTo?: string;
}

interface TreeNode extends User {
  children: TreeNode[];
  level: number;
}

function buildTree(users: User[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // First pass: Create all nodes with empty children
  users.forEach(user => {
    nodeMap.set(user.id, {
      ...user,
      children: [],
      level: 0
    });
  });

  // Second pass: Build parent-child relationships
  users.forEach(user => {
    const node = nodeMap.get(user.id)!;

    if (user.reportsTo) {
      const parent = nodeMap.get(user.reportsTo);
      if (parent) {
        parent.children.push(node);
        node.level = parent.level + 1;
      } else {
        // Parent not found, treat as root
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}
```

### Pattern 2: Tree Filtering with Ancestor Chain Preservation
**What:** Filter tree to show matching nodes plus all descendants and all ancestors to root
**When to use:** When user types in filter input
**Example:**
```typescript
// Source: Inspired by Tabulator issue #3020 and GeeksforGeeks DFS patterns
interface FilterResult {
  node: TreeNode;
  matched: boolean;
  hasMatchingDescendant: boolean;
  hasMatchingAncestor: boolean;
}

function filterTreeWithChain(
  nodes: TreeNode[],
  predicate: (node: TreeNode) => boolean
): FilterResult[] {
  const results = new Map<string, FilterResult>();

  // First pass: Mark direct matches and check descendants (DFS)
  function markMatches(node: TreeNode): boolean {
    const directMatch = predicate(node);
    let hasMatchingDescendant = false;

    for (const child of node.children) {
      if (markMatches(child)) {
        hasMatchingDescendant = true;
      }
    }

    results.set(node.id, {
      node,
      matched: directMatch,
      hasMatchingDescendant,
      hasMatchingAncestor: false
    });

    return directMatch || hasMatchingDescendant;
  }

  nodes.forEach(root => markMatches(root));

  // Second pass: Mark ancestors of matches
  function markAncestors(node: TreeNode): void {
    for (const child of node.children) {
      const childResult = results.get(child.id)!;
      if (childResult.matched || childResult.hasMatchingDescendant) {
        const nodeResult = results.get(node.id)!;
        nodeResult.hasMatchingAncestor = true;
      }
      markAncestors(child);
    }
  }

  nodes.forEach(root => markAncestors(root));

  return Array.from(results.values());
}
```

### Pattern 3: Native Drag-and-Drop Implementation
**What:** Use HTML5 drag-and-drop API with proper event handling
**When to use:** For user tile reorganization
**Example:**
```typescript
// Source: MDN HTML Drag and Drop API
private handleDragStart = (ev: DragEvent, userId: string) => {
  ev.dataTransfer!.effectAllowed = 'move';
  ev.dataTransfer!.setData('text/plain', userId);

  // Store dragged user ID in component state
  this.draggedUserId = userId;

  // Show drop zones
  this.showDropZones = true;
};

private handleDragOver = (ev: DragEvent) => {
  // CRITICAL: Must preventDefault to allow drop
  ev.preventDefault();
  ev.dataTransfer!.dropEffect = 'move';
};

private handleDrop = (ev: DragEvent, newManagerId: string) => {
  ev.preventDefault();
  ev.stopPropagation();

  const draggedId = ev.dataTransfer!.getData('text/plain');

  // Update hierarchy and emit event
  this.updateHierarchy(draggedId, newManagerId);

  // Hide drop zones
  this.showDropZones = false;
  this.draggedUserId = null;
};

private handleDragEnd = (ev: DragEvent) => {
  // Cleanup regardless of drop success
  this.showDropZones = false;
  this.draggedUserId = null;
};
```

### Pattern 4: Long-Press Detection with Countdown
**What:** Detect 4-second long-press with visual countdown timer
**When to use:** For user deletion via long-press interaction
**Example:**
```typescript
// Source: CSS-Tricks "How to Create an Animated Countdown Timer"
private longPressTimer: number | null = null;
private longPressStartTime: number = 0;
private longPressProgress: number = 0;
private readonly LONG_PRESS_DURATION = 4000; // 4 seconds

private handlePointerDown = (ev: PointerEvent, userId: string) => {
  this.longPressStartTime = Date.now();
  this.longPressProgress = 0;

  // Start countdown animation
  this.longPressTimer = window.setInterval(() => {
    const elapsed = Date.now() - this.longPressStartTime;
    this.longPressProgress = Math.min(elapsed / this.LONG_PRESS_DURATION, 1);

    if (this.longPressProgress >= 1) {
      this.handleLongPressComplete(userId);
    }
  }, 16); // ~60fps
};

private handlePointerUp = (ev: PointerEvent) => {
  this.cancelLongPress();
};

private handlePointerMove = (ev: PointerEvent) => {
  // Cancel if moved more than 10px (tolerance for touch screens)
  if (this.isMovedBeyondThreshold(ev, 10)) {
    this.cancelLongPress();
  }
};

private cancelLongPress() {
  if (this.longPressTimer) {
    window.clearInterval(this.longPressTimer);
    this.longPressTimer = null;
    this.longPressProgress = 0;
  }
}

private handleLongPressComplete(userId: string) {
  this.cancelLongPress();
  this.deleteUser(userId);
}

// In render: Show circular progress indicator
renderLongPressIndicator() {
  const circumference = 2 * Math.PI * 20; // radius = 20
  const offset = circumference * (1 - this.longPressProgress);

  return (
    <svg class="countdown-ring">
      <circle
        class="countdown-ring__circle"
        stroke="red"
        stroke-width="3"
        fill="transparent"
        r="20"
        cx="25"
        cy="25"
        style={{
          strokeDasharray: `${circumference} ${circumference}`,
          strokeDashoffset: `${offset}`
        }}
      />
    </svg>
  );
}
```

### Pattern 5: Exposing Public Methods
**What:** Use @Method() decorator for component API methods
**When to use:** For all public methods: getSelected(), highlightUser(), clearHighlight(), scrollToUser()
**Example:**
```typescript
// Source: Stencil.js Methods documentation
import { Component, Method, h } from '@stencil/core';

@Component({
  tag: 'sp-org-chart',
  styleUrl: 'sp-org-chart.css',
  shadow: true,
})
export class SpOrgChart {
  private selectedUserId: string | null = null;
  private highlightedUserId: string | null = null;

  /**
   * Get the currently selected user
   * @returns The selected user object or null
   */
  @Method()
  async getSelected(): Promise<User | null> {
    if (!this.selectedUserId) return null;
    return this.users.find(u => u.id === this.selectedUserId) || null;
  }

  /**
   * Highlight a specific user by ID
   * @param userId - The user ID to highlight
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
   * Scroll a user into view with smooth animation
   * @param userId - The user ID to scroll to
   */
  @Method()
  async scrollToUser(userId: string): Promise<void> {
    await customElements.whenDefined('sp-org-chart');

    const userElement = this.el.shadowRoot?.querySelector(
      `[data-user-id="${userId}"]`
    );

    if (userElement) {
      userElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }
}
```

### Pattern 6: Alphabetical Sorting Within Tree Levels
**What:** Sort children alphabetically at each level while preserving hierarchy
**When to use:** After building tree, before rendering
**Example:**
```typescript
// Source: D3-hierarchy documentation patterns
function sortTreeAlphabetically(nodes: TreeNode[]): TreeNode[] {
  // Sort at current level
  const sorted = [...nodes].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  // Recursively sort children
  sorted.forEach(node => {
    if (node.children.length > 0) {
      node.children = sortTreeAlphabetically(node.children);
    }
  });

  return sorted;
}
```

### Anti-Patterns to Avoid
- **Don't hand-roll tree layout algorithms** - Use flexbox/grid for simple vertical/horizontal layouts; only use D3 if requiring radial/dendrogram layouts
- **Don't modify drag data outside dragstart** - Data transfer store is read-only except in dragstart and drop events
- **Don't forget preventDefault on dragover** - Drop events won't fire without it
- **Don't use nested tree structures as component prop** - Flat array with reportsTo is more flexible and easier to update
- **Don't implement custom scroll with requestAnimationFrame** - Use native scrollIntoView with smooth behavior
- **Don't skip stopPropagation on drag events** - Events fire rapidly on child elements and can cause flickering

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Long-press detection | Custom timer with touch/mouse tracking | Native PointerEvent API with interval timer | PointerEvent unifies touch/mouse/pen, handles edge cases like pointer leave, cancel events |
| Smooth scrolling | requestAnimationFrame-based scroll animation | scrollIntoView({ behavior: 'smooth' }) | Native API handles easing, respects prefers-reduced-motion, zero dependencies |
| Flat-to-tree conversion | Nested loops searching for parents | Map-based two-pass algorithm | O(n) instead of O(n²), handles orphaned nodes, industry standard pattern |
| Tree filtering | Recursive filtering with separate ancestor marking | Single DFS pass with result memoization | Prevents multiple tree traversals, cleaner code, better performance |
| Drag visual feedback | CSS transitions triggered by state | Native drag image with dataTransfer.setDragImage() | Browser-optimized, works across all platforms, respects system settings |
| Countdown timer | setInterval with manual calculation | setInterval with elapsed time delta | More accurate, handles tab backgrounding, self-correcting |

**Key insight:** The browser provides powerful APIs for drag-and-drop, smooth scrolling, and pointer events that handle cross-browser differences, accessibility, and edge cases. Custom implementations add code without adding value.

## Common Pitfalls

### Pitfall 1: Drag Events Fire Rapidly on Child Elements
**What goes wrong:** dragenter/dragleave events fire repeatedly as the cursor moves over nested child elements, causing drop zone highlights to flicker on/off
**Why it happens:** Each child element triggers its own dragenter/dragleave event, and events bubble up to parent
**How to avoid:** Call stopPropagation() on all drag event handlers before any other logic
**Warning signs:** Drop zone styling flickers, multiple event handlers fire for single drag action
```typescript
private handleDragOver = (ev: DragEvent) => {
  ev.stopPropagation(); // CRITICAL: Prevent event from firing on parent
  ev.preventDefault();
  // ... rest of handler
};
```

### Pitfall 2: Forgetting preventDefault on dragover
**What goes wrong:** Drop event never fires, dropped items snap back to origin
**Why it happens:** Browser default behavior for dragover is to reject drops
**How to avoid:** Always call ev.preventDefault() in dragover handler
**Warning signs:** Drop event listener exists but never executes, items return to starting position
```typescript
private handleDragOver = (ev: DragEvent) => {
  ev.preventDefault(); // REQUIRED or drop won't work
  ev.dataTransfer!.dropEffect = 'move';
};
```

### Pitfall 3: Tree Filter Hides Parent Nodes
**What goes wrong:** Filtering shows matching nodes but hides their parents, making tree structure unclear or broken
**Why it happens:** Simple filter only checks predicate on each node without considering hierarchy
**How to avoid:** Use two-pass algorithm: first mark matches and descendants, then mark all ancestors of matches
**Warning signs:** Filtered results appear disconnected, users don't see their position in hierarchy
**Pattern:** See "Pattern 2: Tree Filtering with Ancestor Chain Preservation" above

### Pitfall 4: Modifying Drag Data Outside dragstart
**What goes wrong:** Attempting to read or write dataTransfer data outside allowed events throws errors or returns empty
**Why it happens:** HTML5 drag-and-drop API restricts data access for security - write only in dragstart, read only in drop
**How to avoid:** Store drag state in component instance variables if needed elsewhere; only use dataTransfer in dragstart/drop
**Warning signs:** dataTransfer.getData() returns empty string, setData() has no effect
```typescript
// WRONG: Reading data in dragover
private handleDragOver = (ev: DragEvent) => {
  const data = ev.dataTransfer!.getData('text/plain'); // Returns empty!
};

// RIGHT: Store in component state during dragstart
private draggedUserId: string | null = null;
private handleDragStart = (ev: DragEvent, userId: string) => {
  ev.dataTransfer!.setData('text/plain', userId);
  this.draggedUserId = userId; // Store for use in other handlers
};
```

### Pitfall 5: Not Canceling Long-Press on Movement
**What goes wrong:** Long-press triggers even when user drags or scrolls, causing accidental deletions
**Why it happens:** Touch/mouse movement wasn't monitored, timer continues regardless of pointer position
**How to avoid:** Track pointer position on pointerdown, cancel timer if moved beyond threshold (suggest 10px for touch tolerance)
**Warning signs:** Users report accidental deletions when scrolling, long-press triggers during drag operations
```typescript
private longPressStartPos: { x: number; y: number } | null = null;

private handlePointerDown = (ev: PointerEvent, userId: string) => {
  this.longPressStartPos = { x: ev.clientX, y: ev.clientY };
  // ... start timer
};

private handlePointerMove = (ev: PointerEvent) => {
  if (!this.longPressStartPos) return;

  const dx = ev.clientX - this.longPressStartPos.x;
  const dy = ev.clientY - this.longPressStartPos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 10) { // 10px threshold
    this.cancelLongPress();
  }
};
```

### Pitfall 6: Circular Reporting Relationships
**What goes wrong:** User A reports to User B who reports to User A creates infinite loop during tree building
**Why it happens:** Data validation doesn't check for cycles before tree construction
**How to avoid:** Detect cycles during tree building using Set to track visited nodes in ancestry chain
**Warning signs:** Maximum call stack exceeded, page freezes during rendering
```typescript
function buildTree(users: User[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // Build nodes
  users.forEach(user => {
    nodeMap.set(user.id, { ...user, children: [], level: 0 });
  });

  // Build relationships with cycle detection
  users.forEach(user => {
    const node = nodeMap.get(user.id)!;

    if (user.reportsTo) {
      // Check for cycles
      const ancestors = new Set<string>();
      let current = user.reportsTo;

      while (current) {
        if (current === user.id) {
          console.warn(`Circular relationship detected for user ${user.id}`);
          roots.push(node);
          return;
        }
        ancestors.add(current);
        const parent = nodeMap.get(current);
        current = parent?.reportsTo;
      }

      const parent = nodeMap.get(user.reportsTo);
      if (parent) {
        parent.children.push(node);
        node.level = parent.level + 1;
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}
```

### Pitfall 7: Not Cleaning Up Event Listeners and Timers
**What goes wrong:** Memory leaks, timers continue after component unmounts, events fire on destroyed component
**Why it happens:** Event listeners and intervals created but never removed
**How to avoid:** Use disconnectedCallback to clean up all timers and event listeners
**Warning signs:** Memory usage grows over time, console errors about calling methods on undefined
```typescript
disconnectedCallback() {
  // Clean up long-press timer
  if (this.longPressTimer) {
    window.clearInterval(this.longPressTimer);
    this.longPressTimer = null;
  }

  // Remove any global event listeners
  document.removeEventListener('pointermove', this.handlePointerMove);
  document.removeEventListener('pointerup', this.handlePointerUp);
}
```

## Code Examples

Verified patterns from official sources:

### Custom Event Emission
```typescript
// Source: Stencil Events documentation
import { Event, EventEmitter } from '@stencil/core';

export class SpOrgChart {
  @Event() hierarchyChange: EventEmitter<{
    userId: string;
    oldManagerId: string | null;
    newManagerId: string | null;
  }>;

  @Event() userClick: EventEmitter<{ userId: string }>;
  @Event() userDblclick: EventEmitter<{ userId: string }>;
  @Event() userDelete: EventEmitter<{ userId: string }>;

  private updateHierarchy(userId: string, newManagerId: string) {
    const user = this.users.find(u => u.id === userId);
    const oldManagerId = user?.reportsTo || null;

    // Update user data
    user!.reportsTo = newManagerId;

    // Emit event
    this.hierarchyChange.emit({
      userId,
      oldManagerId,
      newManagerId
    });

    // Rebuild tree
    this.treeData = buildTree(this.users);
  }
}
```

### Drop Zone Rendering with Visual Feedback
```typescript
// Source: Drag-and-drop UX best practices from NN/G and Pencil & Paper
renderDropZones() {
  if (!this.showDropZones) return null;

  return (
    <div class="drop-zones">
      <div
        class="drop-zone drop-zone--unlink"
        onDragOver={this.handleDragOver}
        onDrop={(ev) => this.handleDrop(ev, null)}
        onDragLeave={(ev) => this.handleDragLeave(ev)}
      >
        <span class="drop-zone__icon">🔗</span>
        <span class="drop-zone__label">Unlink</span>
      </div>

      <div
        class="drop-zone drop-zone--delete"
        onDragOver={this.handleDragOver}
        onDrop={this.handleDeleteDrop}
        onDragLeave={(ev) => this.handleDragLeave(ev)}
      >
        <span class="drop-zone__icon">🗑️</span>
        <span class="drop-zone__label">Delete</span>
      </div>
    </div>
  );
}

// CSS for drop zones with dashed border feedback
/*
.drop-zone {
  border: 2px dashed var(--dwc-color-border);
  border-radius: var(--dwc-border-radius);
  padding: var(--dwc-spacing-lg);
  transition: all var(--dwc-transition-fast);
}

.drop-zone:hover {
  border-color: var(--dwc-color-primary);
  background-color: var(--dwc-color-surface-secondary);
  transform: scale(1.05);
}
*/
```

### Interaction State Management
```typescript
// Click, double-click, and selection handling
private clickTimer: number | null = null;
private readonly DOUBLE_CLICK_DELAY = 300;

private handleUserClick = (ev: MouseEvent, userId: string) => {
  // Prevent text selection during double-click
  ev.preventDefault();

  if (this.clickTimer) {
    // Double-click detected
    window.clearTimeout(this.clickTimer);
    this.clickTimer = null;
    this.handleDoubleClick(userId);
  } else {
    // Single-click - wait to see if double-click comes
    this.clickTimer = window.setTimeout(() => {
      this.handleSingleClick(userId);
      this.clickTimer = null;
    }, this.DOUBLE_CLICK_DELAY);
  }
};

private handleSingleClick(userId: string) {
  this.selectedUserId = userId;
  this.userClick.emit({ userId });
}

private handleDoubleClick(userId: string) {
  this.userDblclick.emit({ userId });
}
```

### Editable Mode Toggle
```typescript
// Source: Stencil Props documentation
import { Prop } from '@stencil/core';

export class SpOrgChart {
  /**
   * Enable or disable edit mode (drag-and-drop, deletion)
   */
  @Prop() editable: boolean = false;

  render() {
    return (
      <Host>
        {this.treeData.map(root => this.renderTreeNode(root))}

        {/* Only show drop zones when editable and dragging */}
        {this.editable && this.renderDropZones()}
      </Host>
    );
  }

  private renderTreeNode(node: TreeNode) {
    return (
      <div
        class="user-tile"
        draggable={this.editable}
        onDragStart={this.editable ? (ev) => this.handleDragStart(ev, node.id) : undefined}
        onClick={(ev) => this.handleUserClick(ev, node.id)}
        onPointerDown={this.editable ? (ev) => this.handlePointerDown(ev, node.id) : undefined}
        onPointerUp={this.editable ? (ev) => this.handlePointerUp(ev) : undefined}
        onPointerMove={this.editable ? (ev) => this.handlePointerMove(ev) : undefined}
      >
        {/* User tile content */}
      </div>
    );
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| jQuery-based tree plugins | Native web components with Shadow DOM | 2018-2020 | Better encapsulation, framework-agnostic, no jQuery dependency |
| SVG for all tree rendering | Flexbox/Grid for layout, SVG/CSS for connectors | 2020-2022 | Simpler layout code, better accessibility, easier responsive design |
| Nested tree data structures | Flat arrays with relational IDs | 2021-2023 | Easier updates, better for REST APIs, simpler state management |
| MouseEvent for drag | PointerEvent API | 2019-2021 | Unified touch/mouse/pen handling, better mobile support |
| Manual scroll animation | scrollIntoView with smooth behavior | 2017-2019 | Native browser optimization, respects accessibility preferences |
| role="tree" for all hierarchical views | Consider role="list" for non-navigational trees | 2023-2025 | Better screen reader UX for org charts vs file explorers |
| Jest only | Jest + Playwright for E2E | 2022-2024 | Better coverage of real browser interactions, visual testing |

**Deprecated/outdated:**
- jQuery orgchart plugins: Still functional but add unnecessary dependencies; use native web components instead
- Touch-specific event handlers (touchstart, touchend): Use PointerEvent API which unifies all pointer types
- role="tree" with full keyboard navigation for org charts: Consider simpler role="list" unless keyboard navigation is required
- dragenter/dragleave for drop highlighting: Unreliable due to child element event firing; use dragover with state tracking
- setInterval for animations: Use CSS transitions/animations where possible, requestAnimationFrame for complex animations

## Open Questions

Things that couldn't be fully resolved:

1. **Visual Connector Approach: SVG vs CSS**
   - What we know: Both SVG and CSS borders can create connectors; SVG is more flexible for curves, CSS is simpler for orthogonal lines
   - What's unclear: Which provides better performance with 100+ nodes; whether curved connectors add value to UX
   - Recommendation: Start with CSS borders (simpler, less code); migrate to SVG only if curved connectors are explicitly requested

2. **ARIA Tree Role vs List Role**
   - What we know: ARIA tree role requires complex keyboard navigation (arrow keys, expand/collapse); ARIA list role is simpler but less semantic
   - What's unclear: Whether org chart users expect/need keyboard tree navigation or just mouse/touch interaction
   - Recommendation: Implement role="list" initially for simpler accessibility; add full role="tree" with keyboard nav in Phase 3 if user testing shows need

3. **Long-Press Implementation: Library vs Manual**
   - What we know: long-press-event library is 1kb and handles edge cases; manual implementation with PointerEvent is straightforward
   - What's unclear: Whether library provides enough value to justify dependency
   - Recommendation: Implement manual PointerEvent approach first (learning value, zero dependencies); switch to library if edge cases emerge

4. **Filter Performance with Large Trees**
   - What we know: Two-pass DFS algorithm is O(n) but requires full tree traversal twice
   - What's unclear: Performance threshold where memoization or debouncing becomes necessary
   - Recommendation: Implement basic two-pass filter; add debouncing (300ms) if trees exceed 200 nodes; consider memoization if exceeds 500 nodes

## Sources

### Primary (HIGH confidence)
- [Stencil Methods Documentation](https://stenciljs.com/docs/methods) - @Method() decorator patterns and async requirements
- [Stencil Events Documentation](https://stenciljs.com/docs/events) - @Event() decorator and event configuration
- [Stencil Testing Overview](https://stenciljs.com/docs/testing-overview) - Spec vs E2E testing approaches
- [MDN HTML Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API) - Event order, data transfer, best practices
- [MDN ARIA treeitem role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/treeitem_role) - ARIA requirements for tree views
- [W3C Tree View Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/) - Keyboard interactions and ARIA requirements
- [MDN scrollIntoView](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) - Smooth scrolling API
- [GeeksforGeeks: Build tree array from flat array](https://www.geeksforgeeks.org/build-tree-array-from-flat-array-in-javascript/) - Flat-to-hierarchy transformation patterns

### Secondary (MEDIUM confidence)
- [Josh Morony: Stencil Public API Methods](https://www.joshmorony.com/using-stencil-to-create-a-custom-web-component-with-a-public-api-method/) - Public method patterns verified with official docs
- [CSS-Tricks: Animated Countdown Timer](https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/) - Countdown timer patterns
- [Building with Stencil: Drag-and-Drop Components - Ionic Blog](https://ionic.io/blog/building-with-stencil-drag-and-drop-components) - SortableJS integration patterns
- [NN/G: Drag-and-Drop Design](https://www.nngroup.com/articles/drag-drop/) - UX best practices for drag-and-drop
- [Pencil & Paper: Drag & Drop UX Best Practices](https://www.pencilandpaper.io/articles/ux-pattern-drag-and-drop) - Visual feedback patterns
- [GitHub: dabeng/OrgChart-Webcomponents](https://github.com/dabeng/OrgChart-Webcomponents) - Reference implementation patterns
- [Medium: Common Pitfalls with HTML5 Drag 'n' Drop API](https://medium.com/@reiberdatschi/common-pitfalls-with-html5-drag-n-drop-api-9f011a09ee6c) - Event handling gotchas
- [Nucamp: Testing in 2026](https://www.nucamp.co/blog/testing-in-2026-jest-react-testing-library-and-full-stack-testing-strategies) - Jest + Playwright strategy

### Tertiary (LOW confidence)
- [10 Best Organization Chart JavaScript/CSS Libraries (2026 Update)](https://www.jqueryscript.net/blog/best-organizational-chart.html) - Library landscape, marked for validation
- [10 Best Countdown Timer JavaScript Libraries (2026 Update)](https://www.cssscript.com/best-countdown-timer/) - Timer library options
- [Tabulator Issue #3020: Filter for tree data](https://github.com/olifolkerd/tabulator/issues/3020) - Tree filtering discussion, community solution

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All core technologies are native browser APIs or documented Stencil patterns
- Architecture: HIGH - Patterns verified against official documentation and established algorithmic approaches
- Pitfalls: HIGH - Based on official MDN documentation and community-validated issues with drag-and-drop API

**Research date:** 2026-01-31
**Valid until:** 2026-03-01 (30 days - stable domain with mature APIs)

**Notes:**
- No Context7 queries needed as Stencil, drag-and-drop, and web APIs are well-documented on official sources
- Flat-to-tree transformation is a classic CS problem with established O(n) solutions
- Native browser APIs (drag-and-drop, scrollIntoView, PointerEvent) are mature and stable
- Main uncertainty is UX decisions (SVG vs CSS connectors, tree vs list ARIA role) which should be resolved through user testing
