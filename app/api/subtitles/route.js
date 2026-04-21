import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { readFile, unlink, mkdtemp } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

const execFileAsync = promisify(execFile);
const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;

// ── Audio download (same as transcribe route) ─────────────────────────────────

async function downloadYouTubeAudio(videoUrl) {
  const tmpDir = await mkdtemp(join(tmpdir(), "yt-sub-"));
  const outPath = join(tmpDir, "audio.%(ext)s");

  await execFileAsync("yt-dlp", [
    "-f",
    "bestaudio[ext=m4a]/bestaudio/best",
    "-o",
    outPath,
    "--no-playlist",
    videoUrl,
  ]);

  const { stdout } = await execFileAsync("yt-dlp", [
    "--get-filename",
    "-f",
    "bestaudio[ext=m4a]/bestaudio/best",
    "-o",
    join(tmpDir, "audio.%(ext)s"),
    "--no-playlist",
    videoUrl,
  ]);

  const filePath = stdout.trim();
  const buffer = await readFile(filePath);
  await unlink(filePath).catch(() => {});
  return buffer;
}

// ── AssemblyAI helpers ────────────────────────────────────────────────────────

async function uploadToAssemblyAI(audioBuffer) {
  const res = await fetch("https://api.assemblyai.com/v2/upload", {
    method: "POST",
    headers: {
      Authorization: ASSEMBLYAI_API_KEY,
      "Content-Type": "application/octet-stream",
    },
    body: audioBuffer,
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || "Upload failed");
  return data.upload_url;
}

async function submitTranscription(uploadUrl) {
  const res = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers: {
      Authorization: ASSEMBLYAI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      audio_url: uploadUrl,
      speech_models: ["universal-2"],
      // Sentence-level timestamps for subtitle cues
      punctuate: true,
      format_text: true,
    }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || "Submission failed");
  return data.id;
}

async function pollTranscript(transcriptId) {
  const maxAttempts = 60;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const res = await fetch(
      `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
      { headers: { Authorization: ASSEMBLYAI_API_KEY } },
    );
    const data = await res.json();
    console.log(`[Subtitles] Poll ${i + 1} — status: ${data.status}`);
    if (data.status === "completed") return data;
    if (data.status === "error")
      throw new Error(data.error || "Transcription failed");
  }
  throw new Error("Transcription timed out. Try a shorter video.");
}

// ── Build subtitle cues from AssemblyAI word-level timestamps ─────────────────
//
// AssemblyAI returns `words[]` with start/end in milliseconds.
// We group words into ~7-second cues so subtitle files stay readable.

function buildCuesFromWords(words, maxCueDurationMs = 7000, maxWords = 12) {
  if (!words || words.length === 0) return [];

  const cues = [];
  let cueWords = [];
  let cueStart = words[0].start;

  for (const word of words) {
    cueWords.push(word.text);
    const cueDuration = word.end - cueStart;

    if (cueDuration >= maxCueDurationMs || cueWords.length >= maxWords) {
      cues.push({
        id: cues.length + 1,
        start: cueStart / 1000, // ms → seconds
        end: word.end / 1000,
        text: cueWords.join(" "),
      });
      cueWords = [];
      cueStart = word.end;
    }
  }

  // Flush remaining words
  if (cueWords.length > 0) {
    const lastWord = words[words.length - 1];
    cues.push({
      id: cues.length + 1,
      start: cueStart / 1000,
      end: lastWord.end / 1000,
      text: cueWords.join(" "),
    });
  }

  return cues;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string")
      return NextResponse.json({ error: "URL is required" }, { status: 400 });

    if (!ASSEMBLYAI_API_KEY)
      return NextResponse.json(
        { error: "Add ASSEMBLYAI_API_KEY to your env." },
        { status: 500 },
      );

    if (!/youtube\.com|youtu\.be/.test(url))
      return NextResponse.json(
        { error: "Only YouTube URLs are supported right now." },
        { status: 400 },
      );

    console.log("[Subtitles] Downloading audio via yt-dlp:", url);
    const audioBuffer = await downloadYouTubeAudio(url);
    console.log(`[Subtitles] Downloaded: ${audioBuffer.length} bytes`);

    const uploadUrl = await uploadToAssemblyAI(audioBuffer);
    console.log("[Subtitles] Uploaded to AssemblyAI:", uploadUrl);

    const transcriptId = await submitTranscription(uploadUrl);
    console.log("[Subtitles] Transcript ID:", transcriptId);

    const transcript = await pollTranscript(transcriptId);
    console.log("[Subtitles] Done!");

    const cues = buildCuesFromWords(transcript.words);
    const wordCount = transcript.text?.trim().split(/\s+/).length ?? 0;

    return NextResponse.json({
      cues,
      words: wordCount,
      language: transcript.language_code?.toUpperCase() || "EN",
      duration: transcript.audio_duration
        ? Math.floor(transcript.audio_duration)
        : null,
      success: true,
    });
  } catch (error) {
    console.error("[Subtitles] Error:", error);
    return NextResponse.json(
      { error: error.message || "Subtitle generation failed" },
      { status: 500 },
    );
  }
}
