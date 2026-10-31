import React, { useRef, useState } from "react";
import { ArrowDown, Loader2 } from "lucide-react";

const THRESHOLD = 70;

export default function PullToRefresh({ onRefresh, children }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);

  const onTouchStart = (e) => {
    startY.current = window.scrollY <= 0 ? e.touches[0].clientY : null;
  };

  const onTouchMove = (e) => {
    if (startY.current == null || refreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    setPull(dy > 0 ? Math.min(dy * 0.5, 100) : 0);
  };

  const onTouchEnd = async () => {
    const shouldRefresh = pull >= THRESHOLD && !refreshing;
    startY.current = null;
    if (!shouldRefresh) {
      setPull(0);
      return;
    }
    setRefreshing(true);
    setPull(THRESHOLD);
    try {
      await onRefresh?.();
    } finally {
      setRefreshing(false);
      setPull(0);
    }
  };

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div
        className="flex items-center justify-center overflow-hidden text-muted-foreground transition-[height] duration-150"
        style={{ height: pull }}
        aria-live="polite"
      >
        {refreshing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ArrowDown
            className="w-5 h-5 transition-transform"
            style={{ transform: `rotate(${pull >= THRESHOLD ? 180 : 0}deg)` }}
          />
        )}
      </div>
      {children}
    </div>
  );
}