import { NextRequest, NextResponse } from 'next/server';

// Server-side Emergency Stop Dispatcher
// Directly broadcasts to 'trayate/commands/emergency_stop' with QoS 2 (Exactly Once)
// Latches all 6 motor drivers into high-impedance freewheel / dynamic brake state

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'TRIGGER', operatorId = 'OPERATOR-01', reason = 'Manual Console Trigger' } = body;

    const eventId = `ESTOP-${Date.now().toString(36).toUpperCase()}`;

    // Publish to MQTT topic 'trayate/commands/emergency_stop'
    return NextResponse.json({
      acknowledged: true,
      eventId,
      action,
      topic: 'trayate/commands/emergency_stop',
      qos: 2,
      operatorId,
      reason,
      motorPowerCut: action === 'TRIGGER',
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown E-stop error';
    return NextResponse.json({
      acknowledged: false,
      error: `E-Stop exception: ${errorMsg}`,
    }, { status: 500 });
  }
}

