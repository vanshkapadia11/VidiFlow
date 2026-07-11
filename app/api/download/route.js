// app/api/download/route.js
import { NextResponse } from 'next/server';

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractPinId(url) {
  const match = url.match(/\/pin\/(\d+)/);
  return match ? match[1] : null;
}

export async function POST(req) {
  try {
    let { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    url = url.trim();
    console.log('[PinSave] Input URL:', url);

    // 1. Follow shortlinks
    if (url.includes('pin.it') || !url.includes('pinterest.com')) {
      try {
        const redirect = await fetch(url, {
          redirect: 'follow',
          headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1' }
        });
        url = redirect.url;
        console.log('[PinSave] Resolved to:', url);
      } catch (e) {
        return NextResponse.json({ error: "Could not resolve short URL." }, { status: 400 });
      }
    }

    url = url.split('?')[0];
    const pinId = extractPinId(url);
    console.log('[PinSave] Pin ID:', pinId);

    // ── STRATEGY A: Pinterest PinResource API ──────────────────────
    if (pinId) {
      for (const fieldSet of ['detailed', 'auth_web_main_pin', 'grid_item']) {
        try {
          const apiUrl = `https://www.pinterest.com/resource/PinResource/get/?source_url=/pin/${pinId}/&data=${encodeURIComponent(JSON.stringify({ options: { id: pinId, field_set_key: fieldSet } }))}&_=${Date.now()}`;
          console.log(`[PinSave] Trying API fieldSet: ${fieldSet}`);

          const apiRes = await fetch(apiUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/json, text/javascript, */*; q=0.01',
              'Accept-Language': 'en-US,en;q=0.9',
              'Referer': `https://www.pinterest.com/pin/${pinId}/`,
              'X-Requested-With': 'XMLHttpRequest',
              'X-APP-VERSION': 'e5b2e0e',
              'X-Pinterest-AppState': 'active',
              'Cookie': '',
            }
          });

          console.log(`[PinSave] API response status: ${apiRes.status}`);

          if (apiRes.ok) {
            const apiData = await apiRes.json();
            const pin = apiData?.resource_response?.data;
            console.log('[PinSave] Pin data keys:', pin ? Object.keys(pin) : 'null');

            if (pin?.videos?.video_list) {
              const vl = pin.videos.video_list;
              const best = vl.V_720P || vl.V_480P || vl.V_360P || Object.values(vl).find(v => v?.url?.includes('.mp4'));
              if (best?.url) {
                console.log('[PinSave] ✅ Found VIDEO via API:', best.url);
                return NextResponse.json({ mediaUrl: best.url.replace(/\\/g, ''), isVideo: true });
              }
            }

            if (pin?.images) {
              console.log('[PinSave] Image keys available:', Object.keys(pin.images));
              const img = pin.images['originals'] || pin.images['736x'] || pin.images['474x'] || pin.images['236x'] || Object.values(pin.images)[0];
              if (img?.url) {
                console.log('[PinSave] ✅ Found IMAGE via API:', img.url);
                return NextResponse.json({ mediaUrl: img.url.replace(/\\/g, ''), isVideo: false });
              }
            }
          }
        } catch (e) {
          console.error(`[PinSave] API fieldSet ${fieldSet} failed:`, e.message);
        }
      }
    }

    // ── STRATEGY B: Fetch HTML and parse embedded data ─────────────
    console.log('[PinSave] Falling back to HTML scraping...');
    let html = '';
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        }
      });
      html = await response.text();
      console.log('[PinSave] HTML length:', html.length);
      console.log('[PinSave] Has __PWS_DATA__:', html.includes('__PWS_DATA__'));
      console.log('[PinSave] Has pinimg.com:', html.includes('pinimg.com'));
      console.log('[PinSave] Has video_list:', html.includes('video_list'));
    } catch (e) {
      return NextResponse.json({ error: "Failed to fetch Pinterest page." }, { status: 500 });
    }

    let mediaUrl = null;
    let isVideo = false;

    // B1: __PWS_DATA__
    try {
      const pwsMatch = html.match(/id="__PWS_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (pwsMatch) {
        console.log('[PinSave] Found __PWS_DATA__, parsing...');
        const pwsData = JSON.parse(pwsMatch[1]);
        const tryPaths = [
          pwsData?.props?.initialReduxState?.pins,
          pwsData?.props?.pageProps?.pins,
          pwsData?.resourceDataCache,
          pwsData?.props?.initialReduxState?.resources?.PinResource,
        ].filter(Boolean);

        console.log('[PinSave] PWS paths found:', tryPaths.length);

        for (const resources of tryPaths) {
          for (const item of Object.values(resources)) {
            const pin = item?.data || item;
            if (!pin) continue;
            if (pin.videos?.video_list) {
              const vl = pin.videos.video_list;
              const best = vl.V_720P || vl.V_480P || vl.V_360P || Object.values(vl).find(v => v?.url?.includes('.mp4'));
              if (best?.url) { mediaUrl = best.url; isVideo = true; break; }
            }
            if (pin.images) {
              console.log('[PinSave] PWS image keys:', Object.keys(pin.images));
              const img = pin.images['originals'] || pin.images['736x'] || pin.images['474x'] || Object.values(pin.images)[0];
              if (img?.url) {
                console.log('[PinSave] ✅ Found IMAGE via PWS_DATA:', img.url);
                mediaUrl = img.url; isVideo = false; break;
              }
            }
          }
          if (mediaUrl) break;
        }
      } else {
        console.log('[PinSave] No __PWS_DATA__ script tag found');
      }
    } catch (e) {
      console.error('[PinSave] PWS_DATA parse failed:', e.message);
    }

    // B2: Scan ALL script tags for pinimg.com URLs (not just type=application/json)
    if (!mediaUrl) {
      try {
        const allScripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
        console.log('[PinSave] Total script tags:', allScripts.length);

        for (const block of allScripts) {
          const content = block.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
          if (!content.includes('pinimg.com')) continue;

          // Try to find video URL
          const videoMatch = content.match(/https?:\\?\/\\?\/v\d\.pinimg\.com\\?\/videos\\?\/[^"'\s\\]+\.mp4/);
          if (videoMatch) {
            mediaUrl = videoMatch[0].replace(/\\\//g, '/').replace(/\\/g, '');
            isVideo = true;
            console.log('[PinSave] ✅ Found VIDEO in script tag:', mediaUrl);
            break;
          }

          // Try to find originals image
          const origMatch = content.match(/https?:\\?\/\\?\/i\.pinimg\.com\\?\/originals\\?\/[^"'\s<>]+\.(jpg|jpeg|png|webp)/i);
          if (origMatch) {
            mediaUrl = origMatch[0].replace(/\\\//g, '/').replace(/\\/g, '');
            isVideo = false;
            console.log('[PinSave] ✅ Found ORIGINALS IMAGE in script:', mediaUrl);
            break;
          }

          // Try 736x
          const match736 = content.match(/https?:\\?\/\\?\/i\.pinimg\.com\\?\/736x\\?\/[^"'\s<>]+\.(jpg|jpeg|png|webp)/i);
          if (match736) {
            mediaUrl = match736[0].replace(/\\\//g, '/').replace(/\\/g, '');
            isVideo = false;
            console.log('[PinSave] ✅ Found 736x IMAGE in script:', mediaUrl);
            break;
          }
        }
      } catch (e) {
        console.error('[PinSave] Script scan failed:', e.message);
      }
    }

    // B3: Raw HTML CDN scan
    if (!mediaUrl) {
      const patterns = [
        { re: /https:\/\/v[0-9]\.pinimg\.com\/videos\/[^\s"'\\<>]+\.mp4/, video: true },
        { re: /https:\/\/i\.pinimg\.com\/originals\/[a-zA-Z0-9/_\-.]+\.(jpg|jpeg|png|webp)/i, video: false },
        { re: /https:\/\/i\.pinimg\.com\/736x\/[a-zA-Z0-9/_\-.]+\.(jpg|jpeg|png|webp)/i, video: false },
        { re: /https:\/\/i\.pinimg\.com\/474x\/[a-zA-Z0-9/_\-.]+\.(jpg|jpeg|png|webp)/i, video: false },
        { re: /https:\/\/i\.pinimg\.com\/[^\s"'<>\\]+\.(jpg|jpeg|png|webp)/i, video: false },
      ];
      for (const { re, video } of patterns) {
        const m = html.match(re);
        if (m) {
          mediaUrl = m[0];
          isVideo = video;
          console.log(`[PinSave] ✅ Found via raw scan (video=${video}):`, mediaUrl);
          break;
        }
      }
    }

    // B4: og:image — only pinimg.com
    if (!mediaUrl) {
      const ogImage = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/) ||
                      html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/);
      if (ogImage) {
        const decoded = decodeEntities(ogImage[1]);
        console.log('[PinSave] og:image value:', decoded);
        if (decoded.includes('pinimg.com')) {
          mediaUrl = decoded.replace(/\/\d+x\//, '/736x/');
          isVideo = false;
          console.log('[PinSave] ✅ Using og:image:', mediaUrl);
        } else {
          console.log('[PinSave] ❌ og:image rejected (not pinimg.com):', decoded);
        }
      }
    }

    if (!mediaUrl) {
      console.log('[PinSave] ❌ All strategies failed');
      return NextResponse.json({ error: "Media not found. The pin may be private or Pinterest's structure changed." }, { status: 404 });
    }

    let finalMediaUrl = mediaUrl.replace(/\\u002[Ff]/g, '/').replace(/\\/g, '').replace(/&amp;/g, '&').trim();
    console.log('[PinSave] Final URL:', finalMediaUrl);

    // Handle m3u8
    if (finalMediaUrl.includes('.m3u8')) {
      try {
        const m3u8Res = await fetch(finalMediaUrl, { headers: { 'Referer': 'https://www.pinterest.com/' } });
        const m3u8Text = await m3u8Res.text();
        const variantMatch = m3u8Text.match(/^.*720.*\.m3u8/m) || m3u8Text.match(/^.*\.m3u8/m);
        if (variantMatch) {
          const base = finalMediaUrl.substring(0, finalMediaUrl.lastIndexOf('/') + 1);
          finalMediaUrl = base + variantMatch[0].trim();
        }
        if (finalMediaUrl.includes('.m3u8')) {
          finalMediaUrl = finalMediaUrl.replace('/hls/', '/720p/').replace('.m3u8', '.mp4');
        }
      } catch (e) {
        finalMediaUrl = finalMediaUrl.replace('/hls/', '/720p/').replace('.m3u8', '.mp4');
      }
    }

    return NextResponse.json({ mediaUrl: finalMediaUrl, isVideo });

  } catch (error) {
    console.error('[PinSave] Fatal error:', error);
    return NextResponse.json({ error: "Server error: " + error.message }, { status: 500 });
  }
}