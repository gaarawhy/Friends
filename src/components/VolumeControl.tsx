"use client";

import { useEffect, useState } from "react";
import { useVideoRef } from "./VideoContext";

const DEFAULT_VOLUME = 0.5;

function SpeakerIcon({ level }: { level: number }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="volume-icon">
      <path d="M11 5.5v13a1 1 0 0 1-1.66.75L5.5 15.8H3.5a1 1 0 0 1-1-1v-5.6a1 1 0 0 1 1-1h2l3.84-3.45A1 1 0 0 1 11 5.5Z" />

      {level === 0 ? (
        <path
          d="m15.5 9.5 5 5m0-5-5 5"
          fill="none"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path
            d="M14.8 9.6a3.4 3.4 0 0 1 0 4.8"
            fill="none"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {level > 0.5 && (
            <path
              d="M17.4 7.2a7 7 0 0 1 0 9.6"
              fill="none"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          )}
        </>
      )}
    </svg>
  );
}

export default function VolumeControl() {
  const videoRef = useVideoRef();
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(true);

  // Segue o elemento: o portão sobe o volume sozinho ao liberar o áudio.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const sync = () => {
      setVolume(video.volume);
      setMuted(video.muted);
    };

    sync();
    video.addEventListener("volumechange", sync);
    return () => video.removeEventListener("volumechange", sync);
  }, [videoRef]);

  const level = muted ? 0 : volume;

  const change = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value;
    video.muted = value === 0;
  };

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.muted || video.volume === 0) {
      video.muted = false;
      // Sair do mudo com o volume zerado não faria som nenhum.
      if (video.volume === 0) video.volume = DEFAULT_VOLUME;
      return;
    }

    video.muted = true;
  };

  return (
    <div className="hud hud-left volume">
      <button
        type="button"
        onClick={toggle}
        className="volume-button"
        aria-label={level === 0 ? "Ativar som" : "Desativar som"}
      >
        <SpeakerIcon level={level} />
      </button>

      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={level}
        onChange={(event) => change(Number(event.target.value))}
        className="volume-slider"
        style={{ "--level": level } as React.CSSProperties}
        aria-label="Volume"
      />
    </div>
  );
}
