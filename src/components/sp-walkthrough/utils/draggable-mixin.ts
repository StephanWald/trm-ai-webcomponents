/**
 * Draggable mixin using PointerEvent API
 * Attaches drag behavior to element with viewport constraints
 */

/**
 * Make an element draggable by a handle
 * @param element The element to make draggable
 * @param handleSelector CSS selector for the drag handle (or use element if not found)
 * @returns Cleanup function to remove event listeners
 */
export function makeDraggable(element: HTMLElement, handleSelector: string): () => void {
  let isDragging = false;
  let dragStartPos: { x: number; y: number } | null = null;
  let elementStartPos: { x: number; y: number } | null = null;

  const abortController = new AbortController();
  const signal = abortController.signal;

  // Find drag handle or use element itself
  const handle = element.querySelector(handleSelector) as HTMLElement || element;

  const handlePointerDown = (ev: PointerEvent) => {
    isDragging = true;
    dragStartPos = { x: ev.clientX, y: ev.clientY };

    // Get current element position
    const rect = element.getBoundingClientRect();
    elementStartPos = { x: rect.left, y: rect.top };

    // Set pointer capture for consistent drag behavior
    handle.setPointerCapture(ev.pointerId);

    // Change cursor
    document.body.style.cursor = 'grabbing';

    ev.preventDefault();
  };

  const handlePointerMove = (ev: PointerEvent) => {
    if (!isDragging || !dragStartPos || !elementStartPos) return;

    // Calculate delta from drag start
    const deltaX = ev.clientX - dragStartPos.x;
    const deltaY = ev.clientY - dragStartPos.y;

    // Calculate new position
    let newX = elementStartPos.x + deltaX;
    let newY = elementStartPos.y + deltaY;

    // Constrain to viewport bounds
    const maxX = window.innerWidth - element.offsetWidth;
    const maxY = window.innerHeight - element.offsetHeight;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    // Apply position
    element.style.left = `${newX}px`;
    element.style.top = `${newY}px`;

    // Clear right/bottom positioning (switch to left/top during drag)
    element.style.right = '';
    element.style.bottom = '';

    ev.preventDefault();
  };

  const handlePointerUp = (ev: PointerEvent) => {
    if (!isDragging) return;

    isDragging = false;
    dragStartPos = null;
    elementStartPos = null;

    // Release pointer capture
    handle.releasePointerCapture(ev.pointerId);

    // Reset cursor
    document.body.style.cursor = '';

    ev.preventDefault();
  };

  // Attach event listeners
  handle.addEventListener('pointerdown', handlePointerDown, { signal });
  document.addEventListener('pointermove', handlePointerMove, { signal });
  document.addEventListener('pointerup', handlePointerUp, { signal });

  // Set cursor on handle
  handle.style.cursor = 'grab';

  // Return cleanup function
  return () => {
    abortController.abort();
    document.body.style.cursor = '';
    handle.style.cursor = '';
  };
}
