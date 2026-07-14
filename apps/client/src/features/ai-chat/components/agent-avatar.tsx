import Image from "next/image";
import { cn } from "@/lib/utils";

type AgentAvatarProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const SIZE_CLASSES = {
  sm: "size-8 rounded-xl",
  md: "size-10 rounded-2xl",
  lg: "size-14 rounded-[1.25rem]",
};

const IMAGE_SIZES = {
  sm: 19,
  md: 24,
  lg: 32,
};

export function AgentAvatar({ className, size = "md" }: AgentAvatarProps) {
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
        src="/hivek-icon.png"
        alt=""
        width={IMAGE_SIZES[size]}
        height={IMAGE_SIZES[size]}
        className="object-contain"
      />
      <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-500" />
    </span>
  );
}
