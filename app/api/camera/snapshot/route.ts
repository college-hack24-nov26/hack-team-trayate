import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Ultra-fast single-frame snapshot proxy (zero buffer, instant response)
export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url') || 'http://192.168.4.57:8080/shot.jpg';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const upstream = await fetch(urlParam, {
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
    clearTimeout(timeoutId);

    if (!upstream.ok) {
      return new Response('Failed to capture snapshot from camera', { status: upstream.status });
    }

    const imageBlob = await upstream.arrayBuffer();

    return new Response(imageBlob, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown snapshot proxy error';
    return new Response(msg, { status: 502 });
  }
}

