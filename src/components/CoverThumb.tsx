"use client";

import { useState } from "react";
import { catEmoji } from "@/lib/constants";
import { coverImageUrl } from "@/lib/openLibrary";

export function CoverThumb({
  coverId,
  categoryId,
  background,
  size = "M",
  widthClassName = "w-16",
  heightClassName = "h-[88px]",
  emojiTextClassName = "text-[22px]",
}: {
  coverId: number | null;
  categoryId: string | null;
  background: string;
  size?: "S" | "M" | "L";
  widthClassName?: string;
  heightClassName?: string;
  emojiTextClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (coverId && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={coverImageUrl(coverId, size)}
        alt=""
        onError={() => setFailed(true)}
        className={`${widthClassName} ${heightClassName} rounded-[3px] object-cover shadow-[2px_2px_8px_rgba(0,0,0,0.12)]`}
      />
    );
  }

  return (
    <div
      className={`flex ${widthClassName} ${heightClassName} items-center justify-center rounded-[3px] ${emojiTextClassName} shadow-[2px_2px_8px_rgba(0,0,0,0.12)]`}
      style={{ background }}
    >
      {catEmoji(categoryId)}
    </div>
  );
}
