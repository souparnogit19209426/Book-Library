export function coverImageUrl(coverId: number, size: "S" | "M" | "L" = "M"): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

export async function searchCoverId(title: string, author: string): Promise<number | null> {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return null;

  const params = new URLSearchParams({ title: trimmedTitle, limit: "1", fields: "cover_i" });
  if (author.trim()) params.set("author", author.trim());

  try {
    const res = await fetch(`https://openlibrary.org/search.json?${params.toString()}`, {
      headers: { "User-Agent": "Bibliotheca/1.0 (personal book library app)" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const coverId = data?.docs?.[0]?.cover_i;
    return typeof coverId === "number" ? coverId : null;
  } catch {
    return null;
  }
}
