import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Only these routes actually NEED Clerk to run
const isProtectedRoute = createRouteMatcher([
  "/video-subtitles(.*)",
  "/api/transcribe(.*)",
  "/api/subtitles(.*)",
  "/api/stripe/checkout(.*)",
  "/api/subscription(.*)",
]);

// Skip Clerk entirely on these — zero overhead
const isClerkSkippable = createRouteMatcher([
  "/",
  "/blog(.*)",
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
  "/generate-tags(.*)",
  "/generate-description(.*)",
  "/download-audio(.*)",
  "/explore-tools(.*)",
  "/privacy-policy(.*)",
  "/_next(.*)",
  "/api/download(.*)",
  "/api/tiktok(.*)",
  "/api/youtube(.*)",
  "/api/instagram(.*)",
  "/api/facebook(.*)",
  "/api/twitter(.*)",
  "/api/linkedin(.*)",
  "/api/pinterest(.*)",
  "/api/reddit(.*)",
  "/api/snapchat(.*)",
  "/api/twitch(.*)",
  "/api/proxy(.*)",
  "/api/thumbnail-proxy(.*)",
  "/api/generate-tags(.*)",
  "/api/waitlist(.*)",
  "/api/stripe/webhook(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // If it's a skippable route, do nothing — Clerk doesn't even wake up
  if (isClerkSkippable(req)) {
    return NextResponse.next();
  }

  // Only protect truly private routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  // Much tighter matcher — skips static files, images, fonts completely
  matcher: [
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/video-subtitles(.*)",
    "/video-transcriber(.*)",
    "/test-auth(.*)",
    "/api/transcribe(.*)",
    "/api/subtitles(.*)",
    "/api/stripe/checkout(.*)",
    "/api/subscription(.*)",
  ],
};
