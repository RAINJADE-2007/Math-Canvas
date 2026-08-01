"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function RouteLoadingBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setLoading(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setLoading(false), 500);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [pathname]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1" aria-hidden="true">
      <div
        className={`h-full bg-primary-600 transition-all duration-500 ease-out ${
          loading ? "w-full opacity-100" : "w-0 opacity-0"
        }`}
      />
    </div>
  );
}
