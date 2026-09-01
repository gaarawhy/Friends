"use client";

import { memo, useEffect, useRef, useState, type RefObject } from "react";
import { useVideoRef } from "./VideoContext";

const FADE_START = 700;
const UNMOUNT_AT = 1350;
const VOLUME_RAMP_MS = 900;
const PLAY_ATTEMPTS = 3;
const READY_TIMEOUT_MS = 4000;
/** HTMLMediaElement.HAVE_CURRENT_DATA (a constante não existe no servidor). */
const HAVE_CURRENT_DATA = 2;

/**
 * Isolado em memo de propósito: o áudio é ligado direto no elemento, e
 * qualquer re-render do pai faria o React reaplicar `muted` e mutar de novo.
 */
const Video = memo(function Video({
  videoRef,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
}) {
  return (
    <video
      ref={videoRef}
      className="bg-video fixed left-0 top-0 -z-20 h-screen w-screen object-cover"
      src="/video/background.mp4"
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
    />
  );
});

export default function BackgroundVideo() {
  const videoRef = useVideoRef();
  const rampRef = useRef(0);

  const [locked, setLocked] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  // Enquanto o portão está de pé, a página não rola.
  useEffect(() => {
    if (!locked) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);

  useEffect(() => () => cancelAnimationFrame(rampRef.current), []);

  /** Sobe o volume do zero até o fim, para o som não estourar de uma vez. */
  const rampVolume = (video: HTMLVideoElement) => {
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / VOLUME_RAMP_MS, 1);
      video.volume = progress;
      if (progress < 1) {
        rampRef.current = requestAnimationFrame(step);
      }
    };

    rampRef.current = requestAnimationFrame(step);
  };

  /** Espera o vídeo ter dados para tocar, com teto para não travar. */
  const waitUntilReady = (video: HTMLVideoElement) =>
    new Promise<void>((resolve) => {
      if (video.readyState >= HAVE_CURRENT_DATA) return resolve();

      const done = () => {
        video.removeEventListener("canplay", done);
        clearTimeout(timer);
        resolve();
      };

      const timer = setTimeout(done, READY_TIMEOUT_MS);
      video.addEventListener("canplay", done);
    });

  /**
   * Em F5 seguidos o play() é rejeitado com AbortError, porque um novo load
   * interrompeu o anterior. Isso é transitório: espera ficar pronto e tenta
   * de novo. Só cai pro mudo se o navegador barrar o áudio de verdade.
   */
  const startWithSound = async (video: HTMLVideoElement) => {
    for (let attempt = 0; attempt < PLAY_ATTEMPTS; attempt++) {
      try {
        await video.play();
        rampVolume(video);
        return;
      } catch (err) {
        if ((err as DOMException)?.name === "NotAllowedError") {
          console.error("O navegador bloqueou o áudio do clipe:", err);
          video.muted = true;
          video.volume = 1;
          void video.play().catch(() => {});
          return;
        }

        await waitUntilReady(video);
      }
    }

    console.error("Não foi possível iniciar o clipe após várias tentativas.");
  };

  const unlock = () => {
    if (unlocking) return;
    setUnlocking(true);

    const video = videoRef.current;
    if (video) {
      // Síncrono e antes de qualquer await: o navegador só libera áudio
      // dentro do gesto do usuário.
      video.muted = false;
      video.volume = 0;
      void startWithSound(video);
    }

    setTimeout(() => setFadingOut(true), FADE_START);
    setTimeout(() => setLocked(false), UNMOUNT_AT);
  };

  return (
    <>
      <Video videoRef={videoRef} />
      <div className="bg-overlay pointer-events-none fixed left-0 top-0 -z-10 h-screen w-screen" />

      {locked && (
        <button
          type="button"
          onClick={unlock}
          aria-label="Clique para entrar"
          className={`intro-gate ${fadingOut ? "intro-gate-out" : ""}`}
        >
          <span
            className={`intro-gate-label font-sora ${unlocking ? "intro-gate-label-out" : ""}`}
          >
            clique aqui
          </span>
        </button>
      )}
    </>
  );
}
