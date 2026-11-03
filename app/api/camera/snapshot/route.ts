import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Ultra-fast single-frame snapshot proxy (zero buffer, instant response)
export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url') || 'http://192.168.4.57:8080/shot.jpg';

  try {
    const upstream = await fetch(urlParam, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

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
