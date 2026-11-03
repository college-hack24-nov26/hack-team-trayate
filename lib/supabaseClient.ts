import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Safe retrieval of Supabase Credentials from LocalStorage or Environment Variables
export function getSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('trayate_supabase_url');
    const localKey = localStorage.getItem('trayate_supabase_anon_key');
    if (localUrl && localKey) {
      return { url: localUrl, anonKey: localKey, isCustom: true };
    }
  }

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return {
    url: envUrl,
    anonKey: envKey,
    isCustom: false,
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(
    url &&
    anonKey &&
    !url.includes('demo-trayate') &&
    url.startsWith('https://') &&
    anonKey.length > 20
  );
}

// Singleton client instance
let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabase(): SupabaseClient {
  const { url, anonKey } = getSupabaseCredentials();
  const effectiveUrl = url || 'https://demo-trayate.supabase.co';
  const effectiveKey = anonKey || 'demo-anon-key-placeholder-eyJhbGciOi';

  if (!cachedClient || lastUsedUrl !== effectiveUrl || lastUsedKey !== effectiveKey) {
    cachedClient = createClient(effectiveUrl, effectiveKey);
    lastUsedUrl = effectiveUrl;
    lastUsedKey = effectiveKey;
  }

  return cachedClient;
}

export const supabase = getSupabase();

// =========================================================================
// DATA SCHEMAS & INTERFACES
// =========================================================================

export interface TelemetryPayload {
  mission_id?: string;
  device_id?: string;
  distance?: number | null;
  distance_status?: string;
  servo_angle?: number;
  mq4_raw?: number | null;
  mq135_raw?: number | null;
  temperature?: number | null;
  humidity?: number | null;
  speed?: number;
  movement_direction?: string;
  battery_voltage?: number;
  battery_percent?: number;
}

export interface HumanDetectionPayload {
  mission_id?: string;
  count: number;
  confidence: number;
  nearest_distance: number;
  message: string;
}

export interface MissionAlertPayload {
  id: string;
  mission_id?: string;
  device_id?: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description?: string;
  category?: string;
  acknowledged?: boolean;
}

// =========================================================================
// DATABASE OPERATIONS (LOGGING & RETRIEVAL)
// =========================================================================

/**
 * Log physical telemetry reading to Supabase table: telemetry_logs
 */
export async function logTelemetryToSupabase(payload: TelemetryPayload) {
  if (!isSupabaseConfigured()) return { success: false, reason: 'NOT_CONFIGURED' };

  try {
    const client = getSupabase();
    const { data, error } = await client
      .from('telemetry_logs')
      .insert([
        {
          mission_id: payload.mission_id || 'TR-MIS-2026-084',
          device_id: payload.device_id || 'ESP32-01',
          distance: payload.distance ?? null,
          distance_status: payload.distance_status || 'NORMAL',
          servo_angle: payload.servo_angle ?? 90,
          mq4_raw: payload.mq4_raw ?? null,
          mq135_raw: payload.mq135_raw ?? null,
          temperature: payload.temperature ?? null,
          humidity: payload.humidity ?? null,
          speed: payload.speed ?? 0.0,
          movement_direction: payload.movement_direction || 'STOP',
          battery_voltage: payload.battery_voltage ?? 24.8,
          battery_percent: payload.battery_percent ?? 94,
        },
      ])
      .select();

    if (error) {
      console.warn('Supabase telemetry write error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown write error';
    return { success: false, error: msg };
  }
}

/**
 * Log AI vision human detection event to Supabase table: human_detections
 */
export async function logHumanDetectionToSupabase(payload: HumanDetectionPayload) {
  if (!isSupabaseConfigured()) return { success: false, reason: 'NOT_CONFIGURED' };

  try {
    const client = getSupabase();
    const { data, error } = await client
      .from('human_detections')
      .insert([
        {
          mission_id: payload.mission_id || 'TR-MIS-2026-084',
          count: payload.count,
          confidence: payload.confidence,
          nearest_distance: payload.nearest_distance,
          message: payload.message,
          acknowledged: false,
        },
      ])
      .select();

    if (error) {
      console.warn('Supabase detection write error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown write error';
    return { success: false, error: msg };
  }
}

/**
 * Log or update mission alert in Supabase table: mission_alerts
 */
export async function logAlertToSupabase(payload: MissionAlertPayload) {
  if (!isSupabaseConfigured()) return { success: false, reason: 'NOT_CONFIGURED' };

  try {
    const client = getSupabase();
    const { data, error } = await client
      .from('mission_alerts')
      .upsert([
        {
          id: payload.id,
          mission_id: payload.mission_id || 'TR-MIS-2026-084',
          device_id: payload.device_id || 'T-ROVER',
          severity: payload.severity,
          title: payload.title,
          description: payload.description || '',
          category: payload.category || 'SAFETY',
          acknowledged: payload.acknowledged ?? false,
        },
      ])
      .select();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown write error';
    return { success: false, error: msg };
  }
}

/**
 * Fetch latest telemetry records for historical charts & graphs
 */
export async function fetchRecentTelemetryRecords(limit: number = 30) {
  if (!isSupabaseConfigured()) return [];

  try {
    const client = getSupabase();
    const { data, error } = await client
      .from('telemetry_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.reverse();
  } catch {
    return [];
  }
}

/**
 * Test connectivity & table access to Supabase
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  latencyMs: number;
  message: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      latencyMs: 0,
      message: 'Supabase URL and Anon Key are missing or set to placeholder.',
    };
  }

  const start = Date.now();
  try {
    const client = getSupabase();
    const { data, error } = await client
      .from('missions')
      .select('id')
      .limit(1);

    const latency = Date.now() - start;

    if (error) {
      // If table doesn't exist yet, it connected to Supabase but needs schema migration
      if (error.code === '42P01') {
        return {
          connected: true,
          latencyMs: latency,
          message: 'Connected to Supabase! (Note: Run schema.sql in SQL Editor to create tables).',
        };
      }
      return {
        connected: false,
        latencyMs: latency,
        message: `Connection failed: ${error.message}`,
      };
    }

    return {
      connected: true,
      latencyMs: latency,
      message: `Connected successfully to Supabase! (${latency}ms roundtrip)`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return {
      connected: false,
      latencyMs: Date.now() - start,
      message: `Connection error: ${msg}`,
    };
  }
}
