"use client";

import { useEffect, useMemo, useState } from "react";
import { catEmoji } from "@/lib/constants";
import { coverImageUrl } from "@/lib/openLibrary";

export function CoverThumb({
  coverUrl,
  coverId,
  categoryId,
  background,
  size = "M",
  fill = false,
  widthClassName = "w-16",
  heightClassName = "h-[88px]",
  emojiTextClassName = "text-[22px]",
}: {
  /** A user-uploaded cover, preferred over the Open Library lookup when present. */
  coverUrl?: string | null;
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
  const candidates = useMemo(
    () => [coverUrl, coverId ? coverImageUrl(coverId, size) : null].filter((s): s is string => !!s),
    [coverUrl, coverId, size],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => setIndex(0), [candidates]);

  const boxClass = fill ? "absolute inset-0 h-full w-full" : `${widthClassName} ${heightClassName}`;
  const decorationClass = fill ? "" : "rounded-[3px] shadow-[2px_2px_8px_rgba(0,0,0,0.12)]";
  const src = candidates[index];

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        onError={() => setIndex((i) => i + 1)}
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
