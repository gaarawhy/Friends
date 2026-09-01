"use client";

import { useEffect } from "react";

/**
 * Publica o progresso do scroll da primeira tela como a variável CSS
 * `--scroll` (0 no topo, 1 depois de uma tela inteira). O resto da
 * animação é só CSS lendo essa variável.
 */
export default function ScrollProgress() {
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight || 1;
      const progress = Math.min(Math.max(window.scrollY / viewport, 0), 1);
      document.documentElement.style.setProperty("--scroll", progress.toFixed(4));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
