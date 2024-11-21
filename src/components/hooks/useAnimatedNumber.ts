import { useState, useEffect, useRef } from 'react';

// Easing function for smooth animation (ease-in-out cubic)
const easeInOutCubic = (t: number): number => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function useAnimatedNumber(endValue: number, duration: number = 1500) {
  const [displayValue, setDisplayValue] = useState(0);
  const currentValueRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = null;
    currentValueRef.current = displayValue;

    const updateValue = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      const newValue = currentValueRef.current + (endValue - currentValueRef.current) * easedProgress;
      setDisplayValue(Number(newValue.toFixed(2)));

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };

    const animationFrame = requestAnimationFrame(updateValue);

    return () => cancelAnimationFrame(animationFrame);
  }, [endValue, duration]);

  return Number(displayValue.toFixed(0)).toLocaleString('en-IN');
}

