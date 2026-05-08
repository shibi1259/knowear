import { useState, useEffect } from "react";

export const useCounter = (targetNumber: number, duration: number, active: boolean) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return; // Do nothing if not active

    let start = 0;
    const increment = targetNumber / (duration * 60);
    const updateCounter = () => {
      start += increment;
      if (start >= targetNumber) {
        setCount(targetNumber);
      } else {
        setCount(Math.floor(start));
        requestAnimationFrame(updateCounter);
      }
    };
    requestAnimationFrame(updateCounter);
  }, [targetNumber, duration, active]);

  return count;
};

