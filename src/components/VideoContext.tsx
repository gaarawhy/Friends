"use client";

import {
  createContext,
  useContext,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";

type VideoRef = RefObject<HTMLVideoElement | null>;

const VideoContext = createContext<VideoRef | null>(null);

/** Dá ao portão e ao controle de volume acesso ao mesmo elemento de vídeo. */
export function VideoProvider({ children }: { children: ReactNode }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  return (
    <VideoContext.Provider value={videoRef}>{children}</VideoContext.Provider>
  );
}

export function useVideoRef(): VideoRef {
  const ref = useContext(VideoContext);
  if (!ref) throw new Error("useVideoRef precisa estar dentro de VideoProvider");
  return ref;
}
