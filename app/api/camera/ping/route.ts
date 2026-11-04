import { NextRequest, NextResponse } from 'next/server';
import os from 'os';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url') || 'http://192.168.4.57:8080';

  // Gather host IP addresses
  const interfaces = os.networkInterfaces();
  const hostIps: { name: string; ip: string; type: string }[] = [];

  for (const [name, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;
    for (const addr of addrs) {
      if (addr.family === 'IPv4' && !addr.internal) {
        let type = 'LAN / Wi-Fi';
        if (name.toLowerCase().includes('hotspot') || addr.address.startsWith('192.168.137.')) {
          type = 'Mobile Hotspot';
        } else if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wireless')) {
          type = 'Wi-Fi Network';
        }
        hostIps.push({ name, ip: addr.address, type });
      }
    }
  }

  // Parse target
  let targetUrl = urlParam.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `http://${targetUrl}`;
  }

  try {
    const parsed = new URL(targetUrl);
    const testEndpoints = [
      `${parsed.origin}/status.json`,
      `${parsed.origin}/shot.jpg`,
      `${parsed.origin}/`,
    ];

    let reachable = false;
    let statusCode: number | null = null;
    let statusText = '';

    for (const ep of testEndpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1400);

        const res = await fetch(ep, {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok || res.status === 200 || res.status === 401) {
          reachable = true;
          statusCode = res.status;
          statusText = res.statusText || 'OK';
          break;
        }
      } catch {
        // try next endpoint
      }
    }

    if (reachable) {
      return NextResponse.json({
        ok: true,
        target: parsed.origin,
        status: statusCode,
        message: 'Camera server responded successfully! Stream is live.',
        hostIps,
      });
    } else {
      return NextResponse.json({
        ok: false,
        target: parsed.origin,
        status: null,
        message: `Could not reach IP Webcam at ${parsed.origin}. Ensure 'Start server' is tapped in the Android app.`,
        hostIps,
      });
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Invalid URL';
    return NextResponse.json({
      ok: false,
      target: targetUrl,
      status: null,
      message: `Invalid URL format: ${errorMsg}`,
      hostIps,
    }, { status: 400 });
  }
}

