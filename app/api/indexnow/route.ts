// app/api/indexnow/route.ts
import { submitToIndexNow } from "@/lib/indexnow";

export async function POST(req: Request) {
  const { urls } = await req.json();

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return Response.json({ error: "urls array required" }, { status: 400 });
  }

  const result = await submitToIndexNow(urls);
  return Response.json(result);
}
