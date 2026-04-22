import { useCallback, useRef, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

export type ScrollDirection = "up" | "down";

interface UseScrollDirectionOptions {
  threshold?: number;
  onDirectionChange?: (direction: ScrollDirection) => void;
}

export const useScrollDirection = (options: UseScrollDirectionOptions = {}) => {
  const { threshold = 12, onDirectionChange } = options;
  const [direction, setDirection] = useState<ScrollDirection>("up");
  const previousOffset = useRef(0);
  const previousDirection = useRef<ScrollDirection>("up");

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentOffset = Math.max(0, event.nativeEvent.contentOffset.y);
      const delta = currentOffset - previousOffset.current;

      if (Math.abs(delta) < threshold) {
        previousOffset.current = currentOffset;
        return;
      }

      const nextDirection: ScrollDirection = delta > 0 ? "down" : "up";
      previousOffset.current = currentOffset;

      if (nextDirection === previousDirection.current) {
        return;
      }

      previousDirection.current = nextDirection;
      setDirection(nextDirection);
      onDirectionChange?.(nextDirection);
    },
    [onDirectionChange, threshold],
  );

  return {
    direction,
    onScroll,
  };
};
