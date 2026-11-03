import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Server-side streaming relay for IP Webcam (Android)
// Pipes continuous multipart MJPEG stream or single snapshot without premature timeout
export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');

  if (!urlParam) {
    return NextResponse.json({ error: 'Missing stream url parameter' }, { status: 400 });
  }

  try {
    // Validate protocol
    const parsed = new URL(urlParam);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return NextResponse.json({ error: 'Invalid URL protocol' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const upstreamResponse = await fetch(urlParam, {
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'Accept': 'multipart/x-mixed-replace; boundary=--boundarydonotcross, image/jpeg, image/webp, */*',
      },
    });
    clearTimeout(timeoutId);

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      return NextResponse.json({ 
        error: `Camera stream responded with HTTP ${upstreamResponse.status}: ${upstreamResponse.statusText}` 
      }, { status: 502 });
    }

    const contentType = upstreamResponse.headers.get('content-type') || 'multipart/x-mixed-replace; boundary=--boundarydonotcross';

    return new Response(upstreamResponse.body as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown stream error';
    return NextResponse.json({ 
      error: `Failed to connect to IP Webcam stream: ${errorMsg}`,
      hint: 'Ensure your Android device running IP Webcam is on the same local Wi-Fi/hotspot network.'
    }, { status: 504 });
  }
}
