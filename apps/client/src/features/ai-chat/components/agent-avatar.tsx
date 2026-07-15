import Image from "next/image";
import { cn } from "@/lib/utils";

type AgentAvatarProps = {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "hero";
  variant?: "friendly" | "action";
  showStatus?: boolean;
  preload?: boolean;
};

const SIZE_CLASSES = {
  xs: "size-7 rounded-lg",
  sm: "size-8 rounded-xl",
  md: "size-10 rounded-2xl",
  lg: "size-16 rounded-[1.4rem]",
  hero: "size-28 rounded-[2rem] sm:size-32",
};

const IMAGE_SIZES = {
  xs: 24,
  sm: 29,
  md: 37,
  lg: 58,
  hero: 116,
};

const MASCOT_SOURCES = {
  friendly: "/icon/mascot1.webp",
  action: "/icon/mascot2.webp",
} as const;

export function AgentAvatar({
  className,
  size = "md",
  variant = "friendly",
  showStatus = true,
  preload = false,
}: AgentAvatarProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center border border-amber-200/80 bg-[linear-gradient(145deg,#fff7e6,#ffffff)] shadow-[0_8px_24px_rgba(245,158,11,0.14)]",
        SIZE_CLASSES[size],
        className
      )}
      aria-hidden
    >
      <Image
        src={MASCOT_SOURCES[variant]}
        alt=""
        width={IMAGE_SIZES[size]}
        height={IMAGE_SIZES[size]}
        preload={preload}
        className="object-contain drop-shadow-[0_5px_8px_rgba(124,58,237,0.12)]"
      />
      {showStatus ? (
        <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-500" />
      ) : null}
    </span>
  );
}
