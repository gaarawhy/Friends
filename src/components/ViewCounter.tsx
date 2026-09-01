"use client";

import { useEffect, useState } from "react";

export default function ViewCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/views", { method: "POST" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && typeof data?.count === "number") setCount(data.count);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="hud hud-right views">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="views-icon">
        <path
          d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z"
          fill="none"
          strokeWidth="1.7"
        />
        <circle cx="12" cy="12" r="3.1" fill="none" strokeWidth="1.7" />
      </svg>

      <span className="views-count font-sora">
        {count === null ? "—" : count.toLocaleString("pt-BR")}
      </span>
    </div>
  );
}
