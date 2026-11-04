import { NextRequest, NextResponse } from 'next/server';
import os from 'os';

export const dynamic = 'force-dynamic';

// Dynamic Ping & Diagnostics for Physical ESP32 Boards (Sensor ESP32-01 & Rover Motor ESP32-02)
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const rawUrl = searchParams.get('url') || '';
  const type = (searchParams.get('type') || 'sensor').toLowerCase(); // 'sensor' | 'motor' | 'auto'

  if (!rawUrl.trim()) {
    return NextResponse.json({
      ok: false,
      message: 'Please provide an ESP32 IP address or URL.',
      status: null,
    }, { status: 400 });
  }

  // Normalize URL: prepend http:// if missing, strip trailing slashes
  let cleanUrl = rawUrl.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `http://${cleanUrl}`;
  }
  cleanUrl = cleanUrl.replace(/\/+$/, '');

  // Detect host computer's active network interfaces to assist the operator
  const interfaces = os.networkInterfaces();
  const hostIps: { name: string; ip: string; type: string }[] = [];

  for (const [name, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;
    for (const addr of addrs) {
      if (addr.family === 'IPv4' && !addr.internal) {
        let netType = 'Local Network';
        if (name.toLowerCase().includes('hotspot') || addr.address.startsWith('192.168.137.')) {
          netType = 'Mobile Hotspot';
        } else if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wireless')) {
          netType = 'Wi-Fi Network';
        }
        hostIps.push({ name, ip: addr.address, type: netType });
      }
    }
  }

  // Endpoints to probe depending on target type
  let endpointsToTry: string[] = [];
  if (type === 'sensor') {
    endpointsToTry = [`${cleanUrl}/api/status`, `${cleanUrl}/`];
  } else if (type === 'motor') {
    // Probe safe stop command or status
    endpointsToTry = [`${cleanUrl}/move?direction=stop`, `${cleanUrl}/`];
  } else {
    // Auto detection
    endpointsToTry = [`${cleanUrl}/api/status`, `${cleanUrl}/move?direction=stop`, `${cleanUrl}/`];
  }

  const startTime = Date.now();
  let reachable = false;
  let statusCode: number | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payload: any = null;
  let detectedRole = 'UNKNOWN';
  let failureReason = '';

  for (const endpoint of endpointsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const res = await fetch(endpoint, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json, text/plain, */*',
        },
      });
      clearTimeout(timeoutId);

      statusCode = res.status;
      if (res.ok || res.status === 200) {
        reachable = true;
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          payload = await res.json().catch(() => null);
        } else {
          payload = await res.text().catch(() => null);
        }

        if (endpoint.includes('/api/status')) {
          detectedRole = 'ESP32-01 (Sensor Suite)';
        } else if (endpoint.includes('/move')) {
          detectedRole = 'ESP32-02 (Rover Motor Controller)';
        }
        break;
      }
    } catch (err: unknown) {
      const isTimeout = err instanceof Error && err.name === 'AbortError';
      failureReason = isTimeout ? 'Connection timed out after 1500ms' : (err instanceof Error ? err.message : 'Unreachable');
    }
  }

  const latencyMs = Date.now() - startTime;

  if (reachable) {
    return NextResponse.json({
      ok: true,
      url: cleanUrl,
      status: statusCode,
      latencyMs,
      detectedRole,
      payload,
      message: `ESP32 connection verified (${latencyMs}ms response time).`,
      hostIps,
    });
  } else {
    return NextResponse.json({
      ok: false,
      url: cleanUrl,
      status: statusCode,
      latencyMs,
      message: `ESP32 at ${cleanUrl} did not respond: ${failureReason || 'Port closed or device offline'}.`,
      hostIps,
    });
  }
}
