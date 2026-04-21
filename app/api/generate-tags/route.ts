import { NextResponse } from "next/server";

const SUGGEST_URL = "https://suggestqueries.google.com/complete/search";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/** Fetch Google Suggest results for a single query string */
async function fetchSuggestions(query: string): Promise<string[]> {
  try {
    const url = `${SUGGEST_URL}?client=firefox&ds=yt&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) && Array.isArray(data[1]) ? data[1] : [];
  } catch {
    return [];
  }
}

function normalizeSuggestion(s: string): string {
  return s.trim().toLowerCase();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const base = query.trim().toLowerCase();

    const variantConfig = [
      { key: `${base}`, label: "Top Results" },
      { key: `how to ${base}`, label: "How-To" },
      { key: `${base} tutorial`, label: "Tutorials" },
      { key: `best ${base}`, label: "Best Of" },
      { key: `${base} for beginners`, label: "For Beginners" },
      { key: `${base} tips`, label: "Tips & Tricks" },
      { key: `${base} 2025`, label: "Trending Now" },
      { key: `why ${base}`, label: "Why / Reasons" },
      { key: `${base} vs`, label: "Comparisons" },
      { key: `easy ${base}`, label: "Quick & Easy" },
    ];

    // Fire all fetches in parallel
    const results = await Promise.all(
      variantConfig.map(({ key, label }) =>
        fetchSuggestions(key).then((tags) => ({ key, label, tags })),
      ),
    );

    // Score map for top tags
    const scoreMap = new Map<string, number>();
    const categorized: Record<string, string[]> = {};

    results.forEach(({ label, tags: varTags }) => {
      const normalized = varTags.map(normalizeSuggestion).filter(Boolean);

      // Build categorized (up to 6 per category, skip empty)
      if (normalized.length > 0) {
        categorized[label] = normalized.slice(0, 6);
      }

      // Score every tag
      normalized.forEach((tag, idx) => {
        const positionScore = 1 / (idx + 1);
        scoreMap.set(tag, (scoreMap.get(tag) ?? 0) + positionScore);
      });
    });

    // Top 40 scored tags (excluding bare query string)
    const tags = [...scoreMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
      .filter((t) => t !== base)
      .slice(0, 40);

    return NextResponse.json({ tags, categorized });
  } catch (error) {
    console.error("Tag Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate tags. Please try a different keyword." },
      { status: 500 },
    );
  }
}
