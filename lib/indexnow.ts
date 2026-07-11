// lib/indexnow.ts
const INDEXNOW_KEY = "5604e6cc85db36255fdbb53506a42c00";
const HOST = "www.vidiflow.co";

export async function submitToIndexNow(urls: string[]) {
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });

    return { success: res.ok, status: res.status };
  } catch (err) {
    console.error("IndexNow submission failed:", err);
    return { success: false, error: err };
  }
}
