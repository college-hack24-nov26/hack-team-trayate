import { NextRequest, NextResponse } from 'next/server';

// Server-side ESP32 Communication Gateway
// Relays commands and telemetry between browser and physical ESP32 boards on the local hotspot
// Solves browser Private Network Access (PNA), mixed-content, and CORS constraints

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const targetBase = searchParams.get('base') || process.env.NEXT_PUBLIC_ROVER_SENSOR_URL || 'http://192.168.137.71';
  const endpoint = searchParams.get('endpoint') || '/api/status';
  const angle = searchParams.get('angle');

  // Build target URL
  let targetUrl = `${targetBase.replace(/\/+$/, '')}${endpoint}`;
  if (angle !== null && angle !== undefined) {
    targetUrl += `${targetUrl.includes('?') ? '&' : '?'}angle=${encodeURIComponent(angle)}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const espResponse = await fetch(targetUrl, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'Accept': 'application/json, text/plain, */*',
      },
    });

    clearTimeout(timeout);

    if (!espResponse.ok) {
      return NextResponse.json({
        connected: false,
        error: `ESP32 returned HTTP ${espResponse.status}: ${espResponse.statusText}`,
        targetUrl,
      }, { status: espResponse.status });
    }

    const contentType = espResponse.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await espResponse.json();
      return NextResponse.json(data, {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    } else {
      const text = await espResponse.text();
      return new NextResponse(text, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    return NextResponse.json({
      connected: false,
      error: isTimeout ? 'ESP32 request timed out after 2500ms' : (err instanceof Error ? err.message : 'ESP32 network failure'),
      targetUrl,
    }, { status: 504 });
  }
}

