import { useCallback, useRef } from 'react';
import { Platform } from 'react-native';

/**
 * GSAP-based page flip hook for web platform.
 * Provides realistic book-like page turning with 3D rotation,
 * drag-to-flip interaction, and spring-back animations.
 *
 * This hook only works on web (Platform.OS === 'web') since GSAP
 * manipulates DOM elements directly.
 */

// Dynamically import gsap only on web to avoid issues on native
let gsap: any = null;
if (Platform.OS === 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    gsap = require('gsap').gsap;
  } catch {
    // gsap not available
  }
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentRotation: number;
  currentTilt: number;
}

interface UsePageFlipWebOptions {
  currentPage: number;
  maxPages: number;
  onPageChange: (page: number) => void;
  /** Callback when drag direction changes (for showing background page) */
  onDirectionChange?: (direction: 'next' | 'prev' | null) => void;
  /** Sensitivity for drag-to-rotation mapping (default: 0.5) */
  sensitivity?: number;
  /** Tilt sensitivity for vertical movement (default: 0.1) */
  tiltSensitivity?: number;
  /** Rotation threshold in degrees to trigger a page flip (default: 60) */
  flipThreshold?: number;
  /** Duration for flip completion animation in seconds (default: 0.5) */
  flipDuration?: number;
  /** Duration for snap-back animation in seconds (default: 0.35) */
  snapBackDuration?: number;
}

export function usePageFlipWeb({
  currentPage,
  maxPages,
  onPageChange,
  onDirectionChange,
  sensitivity = 0.5,
  tiltSensitivity = 0.08,
  flipThreshold = 60,
  flipDuration = 0.5,
  snapBackDuration = 0.35,
}: UsePageFlipWebOptions) {
  const pageRef = useRef<any>(null);
  const overlayRef = useRef<any>(null);
  const dragRef = useRef<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentRotation: 0,
    currentTilt: 0,
  });

  const isWeb = Platform.OS === 'web';
  const isAnimatingRef = useRef(false);
  const lastDirectionRef = useRef<'next' | 'prev' | null>(null);
  const onDirectionChangeRef = useRef(onDirectionChange);
  onDirectionChangeRef.current = onDirectionChange;

  /**
   * Get the underlying DOM element from a React Native Web ref
   */
  const getDomElement = useCallback(
    (ref: React.RefObject<any>): HTMLElement | null => {
      if (!isWeb || !ref.current) return null;
      // React Native Web stores the DOM node directly or via _nativeTag
      if (ref.current instanceof HTMLElement) return ref.current;
      if (ref.current._nativeTag) return ref.current._nativeTag;
      // Animated.View wraps - try to find the node
      if (ref.current.getNode) return ref.current.getNode();
      return ref.current;
    },
    [isWeb],
  );

  /**
   * Handle pointer down - start drag tracking
   */
  const handlePointerDown = useCallback(
    (e: any) => {
      if (!isWeb || !gsap || isAnimatingRef.current) return;

      e.preventDefault?.();
      e.stopPropagation?.();

      dragRef.current = {
        isDragging: true,
        startX: e.clientX ?? e.nativeEvent?.pageX ?? 0,
        startY: e.clientY ?? e.nativeEvent?.pageY ?? 0,
        currentRotation: 0,
        currentTilt: 0,
      };

      // Capture pointer
      const target = e.target as Element;
      if (target?.setPointerCapture && e.pointerId !== undefined) {
        target.setPointerCapture(e.pointerId);
      }
    },
    [isWeb],
  );

  /**
   * Handle pointer move - update page rotation based on drag
   */
  const handlePointerMove = useCallback(
    (e: any) => {
      if (!isWeb || !gsap || !dragRef.current.isDragging) return;

      const pageEl = getDomElement(pageRef);
      const overlayEl = getDomElement(overlayRef);
      if (!pageEl) return;

      const clientX = e.clientX ?? e.nativeEvent?.pageX ?? 0;
      const clientY = e.clientY ?? e.nativeEvent?.pageY ?? 0;

      const deltaX = clientX - dragRef.current.startX;
      const deltaY = clientY - dragRef.current.startY;

      // Calculate rotation from drag distance (reversed for RTL)
      // Negative deltaX (drag left) = positive rotation = next page
      // Positive deltaX (drag right) = negative rotation = previous page
      let rotationY = -deltaX * sensitivity;
      rotationY = Math.max(-180, Math.min(180, rotationY));

      // Calculate tilt from vertical movement
      let rotationZ = deltaY * tiltSensitivity;
      rotationZ = Math.max(-10, Math.min(10, rotationZ));

      // Reduce tilt as rotation increases (page becomes flatter)
      const progress = Math.abs(rotationY) / 180;
      rotationZ = rotationZ * (1 - progress * 0.8);

      dragRef.current.currentRotation = rotationY;
      dragRef.current.currentTilt = rotationZ;

      // Notify parent of drag direction change (for background page rendering)
      const newDirection: 'next' | 'prev' | null =
        rotationY > 5
          ? 'next'
          : rotationY < -5
            ? 'prev'
            : lastDirectionRef.current;
      if (newDirection !== lastDirectionRef.current) {
        lastDirectionRef.current = newDirection;
        onDirectionChangeRef.current?.(newDirection);
      }

      // Calculate visual properties based on progress
      const absProgress = Math.abs(rotationY) / 180;
      const liftY = -absProgress * 20; // Lift page as it rotates
      const scale = 1 - absProgress * 0.05;
      const shadowSpread = absProgress * 30;

      gsap.set(pageEl, {
        rotationY: rotationY,
        rotationZ: rotationZ,
        y: liftY,
        scale: scale,
        transformOrigin: rotationY >= 0 ? 'right center' : 'left center',
        transformPerspective: 1200,
        boxShadow: `${rotationY > 0 ? '-' : ''}${shadowSpread}px ${absProgress * 10}px ${shadowSpread * 2}px rgba(0,0,0,${absProgress * 0.4})`,
      });

      // Update overlay for depth effect
      if (overlayEl) {
        gsap.set(overlayEl, {
          opacity: absProgress * 0.3,
          background:
            rotationY > 0
              ? 'linear-gradient(to right, rgba(0,0,0,0.3), transparent)'
              : 'linear-gradient(to left, rgba(0,0,0,0.3), transparent)',
        });
      }
    },
    [isWeb, getDomElement, sensitivity, tiltSensitivity],
  );

  /**
   * Handle pointer up - complete or revert the flip animation
   */
  const handlePointerUp = useCallback(
    (e: any) => {
      if (!isWeb || !gsap || !dragRef.current.isDragging) return;

      dragRef.current.isDragging = false;

      // Release pointer capture
      const target = e.target as Element;
      if (target?.releasePointerCapture && e.pointerId !== undefined) {
        try {
          target.releasePointerCapture(e.pointerId);
        } catch {
          // Ignore if already released
        }
      }

      const pageEl = getDomElement(pageRef);
      const overlayEl = getDomElement(overlayRef);
      if (!pageEl) return;

      const rotation = dragRef.current.currentRotation;
      const absRotation = Math.abs(rotation);
      isAnimatingRef.current = true;

      if (absRotation > flipThreshold) {
        // Complete the flip - determine direction
        // Positive rotation (dragged right) = next page in RTL
        // Negative rotation (dragged left) = previous page in RTL
        const targetRotation = rotation > 0 ? 180 : -180;

        gsap.to(pageEl, {
          rotationY: targetRotation,
          rotationZ: 0,
          y: 0,
          scale: 1,
          boxShadow: '0px 0px 0px rgba(0,0,0,0)',
          duration: flipDuration,
          ease: 'power2.out',
          onComplete: () => {
            // Reset transform before page change
            gsap.set(pageEl, { clearProps: 'all' });
            if (overlayEl) gsap.set(overlayEl, { clearProps: 'all' });
            isAnimatingRef.current = false;
            lastDirectionRef.current = null;
            onDirectionChangeRef.current?.(null);

            // Determine new page number (reversed for RTL)
            if (rotation > 0 && currentPage < maxPages) {
              // Dragged left → next page (RTL)
              onPageChange(currentPage + 1);
            } else if (rotation < 0 && currentPage > 1) {
              // Dragged right → previous page (RTL)
              onPageChange(currentPage - 1);
            }
          },
        });

        // Fade out overlay
        if (overlayEl) {
          gsap.to(overlayEl, {
            opacity: 0,
            duration: flipDuration,
            ease: 'power2.out',
          });
        }
      } else {
        // Snap back - threshold not met
        gsap.to(pageEl, {
          rotationY: 0,
          rotationZ: 0,
          y: 0,
          scale: 1,
          boxShadow: '0px 0px 0px rgba(0,0,0,0)',
          duration: snapBackDuration,
          ease: 'elastic.out(1, 0.5)',
          onComplete: () => {
            isAnimatingRef.current = false;
            lastDirectionRef.current = null;
            onDirectionChangeRef.current?.(null);
          },
        });

        // Reset overlay
        if (overlayEl) {
          gsap.to(overlayEl, {
            opacity: 0,
            duration: snapBackDuration * 0.5,
          });
        }
      }
    },
    [
      isWeb,
      getDomElement,
      flipThreshold,
      flipDuration,
      snapBackDuration,
      currentPage,
      maxPages,
      onPageChange,
    ],
  );

  return {
    pageRef,
    overlayRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isWeb,
  };
}
