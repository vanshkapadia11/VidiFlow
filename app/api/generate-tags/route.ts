import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    // client=firefox usually returns a cleaner JSON array than client=youtube
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Google API responded with ${response.status}`);
    }

    const data = await response.json();

    /**
     * Google Suggest usually returns:
     * ["original query", ["suggestion 1", "suggestion 2", ...]]
     * So we want data[1]
     */
    if (Array.isArray(data) && data[1]) {
      return NextResponse.json({ tags: data[1] });
    }

    return NextResponse.json({ tags: [] });
  } catch (error) {
    console.error("Tag Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate tags. Please try a different keyword." },
      { status: 500 },
    );
  }
}
