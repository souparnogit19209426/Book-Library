"use client";

import { useState } from "react";
import { catEmoji } from "@/lib/constants";
import { coverImageUrl } from "@/lib/openLibrary";

export function CoverThumb({
  coverId,
  categoryId,
  background,
  size = "M",
  fill = false,
  widthClassName = "w-16",
  heightClassName = "h-[88px]",
  emojiTextClassName = "text-[22px]",
}: {
  coverId: number | null;
  categoryId: string | null;
  background: string;
  size?: "S" | "M" | "L";
  /** Fill the parent (which should be `relative`), instead of sizing itself. */
  fill?: boolean;
  widthClassName?: string;
  heightClassName?: string;
  emojiTextClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  const boxClass = fill ? "absolute inset-0 h-full w-full" : `${widthClassName} ${heightClassName}`;
  const decorationClass = fill ? "" : "rounded-[3px] shadow-[2px_2px_8px_rgba(0,0,0,0.12)]";

  if (coverId && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={coverImageUrl(coverId, size)}
        alt=""
        onError={() => setFailed(true)}
        className={`${boxClass} ${decorationClass} object-cover`}
      />
    );
  }

  return (
    <div
      className={`flex ${boxClass} items-center justify-center ${decorationClass} ${emojiTextClassName}`}
      style={{ background }}
    >
      {catEmoji(categoryId)}
    </div>
  );
}
