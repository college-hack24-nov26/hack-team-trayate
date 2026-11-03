import { createClient } from '@supabase/supabase-js';

// Safe environment variable fallbacks for Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo-trayate.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key-placeholder-eyJhbGciOi';

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('demo-trayate')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SupabaseAlertRecord {
  id: string;
  mission_id: string;
  device_id: string;
  alert_type: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  description: string;
  created_at: string;
  acknowledged: boolean;
  acknowledged_at?: string | null;
  acknowledged_by?: string | null;
}

export interface SupabaseMissionRecord {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABORTED';
  start_time: string;
  end_time?: string | null;
  duration_seconds: number;
  max_ch4: number;
  max_co: number;
  max_temp: number;
  human_detections: number;
  fire_detections: number;
  smoke_detections: number;
  dust_filtered_pm10: number;
  notes?: string;
}

export interface SupabaseSensorReading {
  id?: string;
  mission_id: string;
  timestamp: string;
  device_id: string;
  ch4: number;
  co: number;
  co2: number;
  o2: number;
  temp: number;
  humidity: number;
  pm25: number;
  pm10: number;
  pressure: number;
  battery_v: number;
}

