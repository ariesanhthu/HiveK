"use client";

import React, { useState } from "react";
import type { CertificateKol } from "@/features/certificate-product/types";

type VideoPlayerProps = {
  kol: CertificateKol;
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ kol }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (isPlaying) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg">
        <iframe
          src={`${kol.videoEmbedUrl}?autoplay=1`}
          title={`Review bởi ${kol.name}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <div
      className="group relative aspect-video w-full cursor-pointer overflow-hidden rounded-2xl bg-zinc-900 shadow-lg"
      onClick={() => setIsPlaying(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && setIsPlaying(true)}
      aria-label={`Phát video review từ ${kol.name}`}
    >
      {/* Thumbnail */}
      <img
        src={kol.videoThumbnailUrl}
        alt={`Video review bởi ${kol.name}`}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-[0_4px_20px_rgba(245,158,11,0.5)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_6px_28px_rgba(245,158,11,0.6)]">
          <span className="material-symbols-outlined ml-1 text-3xl text-background-dark">
            play_arrow
          </span>
        </div>
      </div>

      {/* Duration badge */}
      <div className="absolute bottom-3 right-3 rounded-lg bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
        5:42
      </div>
    </div>
  );
};
