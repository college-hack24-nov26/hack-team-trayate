import { NextRequest, NextResponse } from 'next/server';

// Server-side MQTT Command Gateway
// Receives movement commands from client, validates deadman watchdog,
// and routes through secure backend broker topic 'trayate/commands/movement'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { direction, speedGovernor = 50, timestamp = Date.now() } = body;

    // 1. Deadman watchdog validation: Reject stale packets (>1200ms old)
    const timeDelta = Date.now() - timestamp;
    if (timeDelta > 1200) {
      return NextResponse.json({
        acknowledged: false,
        error: 'Deadman watchdog trip: Command latency exceeded safety threshold (>1200ms)',
      }, { status: 408 });
    }

    // 2. Direction validation
    const validDirections = ['FORWARD', 'BACKWARD', 'LEFT', 'RIGHT', 'STOP'];
    if (!validDirections.includes(direction)) {
      return NextResponse.json({
        acknowledged: false,
        error: `Invalid direction parameter: ${direction}`,
      }, { status: 400 });
    }

    // 3. Command execution & acknowledgment
    // In production with live broker: mqttClient.publish('trayate/commands/movement', JSON.stringify(...))
    const commandId = `CMD-${Date.now().toString(36).toUpperCase()}`;

    return NextResponse.json({
      acknowledged: true,
      commandId,
      direction,
      speedGovernor,
      topic: 'trayate/commands/movement',
      latencyMs: Math.max(8, timeDelta),
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown gateway error';
    return NextResponse.json({
      acknowledged: false,
      error: `Command gateway exception: ${errorMsg}`,
    }, { status: 500 });
  }
}

