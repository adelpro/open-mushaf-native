type LongPressHandlers = {
  onPointerDown: () => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
};

type CreateLongPressHandlersArgs = {
  delay: number;
  isWeb: boolean;
  onLongPress: () => void;
};

export function createLongPressHandlers({
  delay,
  isWeb,
  onLongPress,
}: CreateLongPressHandlersArgs): LongPressHandlers {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let active = false;

  const clearTimer = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const start = () => {
    if (!isWeb) return;
    clearTimer();
    active = true;
    timeoutId = setTimeout(() => {
      if (!active) return;
      active = false;
      onLongPress();
    }, delay);
  };

  const cancel = () => {
    active = false;
    clearTimer();
  };

  return {
    onPointerDown: start,
    onPointerUp: cancel,
    onPointerLeave: cancel,
  };
}
