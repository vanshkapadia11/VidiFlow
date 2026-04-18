import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacy-policy(.*)",
  "/api/(.*)", // <--- ADD THIS LINE TO UNBLOCK ALL API ROUTES

  // ── Video Downloaders ──────────────────────────────
  "/tiktok-video-downloader(.*)",
  "/youtube-video-downloader(.*)",
  "/youtube-audio-downloader(.*)",
  "/youtube-thumbnail-downloader(.*)",
  "/facebook-video-downloader(.*)",
  "/instagram-video-downloader(.*)",
  "/twitter-video-downloader(.*)",
  "/linkedin-video-downloader(.*)",
  "/pinterest-video-downloader(.*)",
  "/reddit-video-downloader(.*)",
  "/snapchat-video-downloader(.*)",
  "/twitch-video-downloader(.*)",
  "/blog(.*)",
  "/video-transcriber/auth-gate(.*)",

  // ── Tools ──────────────────────────────────────────
  "/video-transcriber(.*)",
  "/generate-tags(.*)",
  "/generate-description(.*)",
  "/download-audio(.*)",
  "/explore-tools(.*)",

  // ── API / Auth ─────────────────────────────────────
  "/api/stripe/webhook",
  "/test-auth",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
