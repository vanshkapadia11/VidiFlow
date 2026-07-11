// app/api/tiktok/route.js
import { NextResponse } from 'next/server';

function extractTikTokId(url) {
  const match = url.match(/\/video\/(\d+)/) || url.match(/\/v\/(\d+)/);
  return match ? match[1] : null;
}

export async function POST(req) {
  try {
    let { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    url = url.trim();
    console.log('[TikSave] Input URL:', url);

    // 1. Resolve short URLs (vm.tiktok.com, vt.tiktok.com)
    if (!url.includes('tiktok.com/video') && !url.includes('@')) {
      try {
        const res = await fetch(url, {
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
          }
        });
        url = res.url.split('?')[0];
        console.log('[TikSave] Resolved to:', url);
      } catch (e) {
        return NextResponse.json({ error: "Could not resolve TikTok URL." }, { status: 400 });
      }
    }

    url = url.split('?')[0];
    const videoId = extractTikTokId(url);
    console.log('[TikSave] Video ID:', videoId);

    // ── STRATEGY A: TikTok oEmbed API (no auth needed, gives thumbnail + metadata) ──
    // We use this to at least get the title and thumbnail
    let title = 'TikTok Video';
    let thumbnail = null;

    try {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
      const oRes = await fetch(oembedUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      if (oRes.ok) {
        const oData = await oRes.json();
        title = oData.title || title;
        thumbnail = oData.thumbnail_url || null;
        console.log('[TikSave] oEmbed title:', title);
        console.log('[TikSave] oEmbed thumbnail:', thumbnail);
      }
    } catch (e) {
      console.error('[TikSave] oEmbed failed:', e.message);
    }

    // ── STRATEGY B: tikwm.com API (reliable third-party, no watermark) ──
    try {
      const tikwmRes = await fetch('https://tikwm.com/api/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: new URLSearchParams({
          url: url,
          hd: '1',
        })
      });

      if (tikwmRes.ok) {
        const tikwmData = await tikwmRes.json();
        console.log('[TikSave] tikwm response code:', tikwmData.code);

        if (tikwmData.code === 0 && tikwmData.data) {
          const data = tikwmData.data;

          // Prefer HD (no watermark) video
          const videoUrl = data.hdplay || data.play || data.wmplay;
          const coverUrl = data.cover || data.origin_cover || thumbnail;

          if (videoUrl) {
            console.log('[TikSave] ✅ Found video via tikwm:', videoUrl);
            return NextResponse.json({
              videoUrl,
              videoUrlHD: data.hdplay || null,
              videoUrlSD: data.play || null,
              videoUrlWatermark: data.wmplay || null,
              thumbnail: coverUrl,
              title: data.title || title,
              author: data.author?.nickname || '',
              duration: data.duration || 0,
              success: true,
            });
          }
        }
      }
    } catch (e) {
      console.error('[TikSave] tikwm failed:', e.message);
    }

    // ── STRATEGY C: musicaldown.com API ──
    try {
      // Step 1: get token
      const mdRes1 = await fetch('https://musicaldown.com/en', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      });
      const mdHtml = await mdRes1.text();
      const tokenMatch = mdHtml.match(/name="([a-zA-Z0-9_]+)"\s+value="([a-zA-Z0-9_]+)"\s+id="hidden/);
      const cookies = mdRes1.headers.get('set-cookie') || '';

      if (tokenMatch) {
        const [, tokenName, tokenValue] = tokenMatch;
        const mdRes2 = await fetch('https://musicaldown.com/download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://musicaldown.com/en',
            'Cookie': cookies,
          },
          body: new URLSearchParams({
            id: url,
            [tokenName]: tokenValue,
          })
        });

        const mdHtml2 = await mdRes2.text();
        const videoLinkMatch = mdHtml2.match(/href="(https:\/\/[^"]+\.mp4[^"]*)"/);
        if (videoLinkMatch) {
          console.log('[TikSave] ✅ Found video via musicaldown');
          return NextResponse.json({
            videoUrl: videoLinkMatch[1],
            thumbnail,
            title,
            author: '',
            success: true,
          });
        }
      }
    } catch (e) {
      console.error('[TikSave] musicaldown failed:', e.message);
    }

    // ── STRATEGY D: Scrape TikTok page directly ──
    try {
      const pageRes = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        }
      });

      const html = await pageRes.text();
      console.log('[TikSave] HTML length:', html.length);

      // Look for __UNIVERSAL_DATA_FOR_REHYDRATION__ JSON blob
      const rehydrationMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
      if (rehydrationMatch) {
        const rehydrationData = JSON.parse(rehydrationMatch[1]);
        const videoData = rehydrationData?.['__DEFAULT_SCOPE__']?.['webapp.video-detail']?.itemInfo?.itemStruct;

        if (videoData?.video) {
          const v = videoData.video;
          const videoUrl = v.playAddr || v.downloadAddr;
          if (videoUrl) {
            console.log('[TikSave] ✅ Found video via page rehydration data');
            return NextResponse.json({
              videoUrl,
              thumbnail: videoData.video?.cover || thumbnail,
              title: videoData.desc || title,
              author: videoData.author?.nickname || '',
              duration: videoData.video?.duration || 0,
              success: true,
            });
          }
        }
      }

      // Brute force: scan for mp4 URLs
      const mp4Match = html.match(/https:\/\/[^"'\\]+\.mp4[^"'\\]*/);
      if (mp4Match) {
        const cleanUrl = mp4Match[0].replace(/\\u002F/g, '/').replace(/\\/g, '');
        console.log('[TikSave] ✅ Found video via brute force scan');
        return NextResponse.json({
          videoUrl: cleanUrl,
          thumbnail,
          title,
          author: '',
          success: true,
        });
      }
    } catch (e) {
      console.error('[TikSave] Page scrape failed:', e.message);
    }

    console.log('[TikSave] ❌ All strategies failed');
    return NextResponse.json({
      error: "Could not extract video. The video may be private or region-restricted.",
    }, { status: 404 });

  } catch (error) {
    console.error('[TikSave] Fatal error:', error);
    return NextResponse.json({ error: "Server error: " + error.message }, { status: 500 });
  }
}