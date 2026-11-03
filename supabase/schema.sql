-- =========================================================================
-- TRAYATE: Intelligent Mine Safety & Rescue System (T-Rover)
-- Supabase Database Schema Migration
-- =========================================================================

-- 1. Enable UUID Extension if not already enabled
create extension if not exists "uuid-ossp";

-- 2. Missions Table
create table if not exists public.missions (
    id text primary key,
    name text not null,
    status text not null default 'ACTIVE' check (status in ('ACTIVE', 'PAUSED', 'COMPLETED', 'ABORTED')),
    start_time timestamptz not null default now(),
    end_time timestamptz,
    notes text,
    created_at timestamptz not null default now()
);

-- Insert Default Active Mission
insert into public.missions (id, name, status, start_time, notes)
values ('TR-MIS-2026-084', 'Sector 4 Sub-Drift Reconnaissance', 'ACTIVE', now(), 'Primary autonomous rescue mission initiated.')
on conflict (id) do nothing;

-- 3. Live Telemetry Logs Table
create table if not exists public.telemetry_logs (
    id bigint generated always as identity primary key,
    created_at timestamptz not null default now(),
    mission_id text references public.missions(id) on delete set null,
    device_id text not null default 'ESP32-01',
    distance numeric,
    distance_status text check (distance_status in ('NORMAL', 'WARNING', 'DANGER', 'NO_ECHO')),
    servo_angle integer default 90,
    mq4_raw integer,
    mq135_raw integer,
    temperature numeric,
    humidity numeric,
    speed numeric default 0.0,
    movement_direction text default 'STOP' check (movement_direction in ('FORWARD', 'BACKWARD', 'LEFT', 'RIGHT', 'STOP')),
    battery_voltage numeric default 24.8,
    battery_percent integer default 94
);

-- Create index on telemetry timestamps for fast time-series retrieval
create index if not exists idx_telemetry_logs_created_at on public.telemetry_logs (created_at desc);
create index if not exists idx_telemetry_logs_mission on public.telemetry_logs (mission_id);

-- 4. Human Detections Table (AI Camera Vision Model)
create table if not exists public.human_detections (
    id bigint generated always as identity primary key,
    created_at timestamptz not null default now(),
    mission_id text references public.missions(id) on delete set null,
    count integer not null default 1,
    confidence numeric not null,
    nearest_distance numeric,
    message text,
    acknowledged boolean not null default false
);

create index if not exists idx_human_detections_created_at on public.human_detections (created_at desc);

-- 5. Mission Safety Alerts Table
create table if not exists public.mission_alerts (
    id text primary key,
    created_at timestamptz not null default now(),
    mission_id text references public.missions(id) on delete set null,
    device_id text not null default 'T-ROVER',
    severity text not null check (severity in ('CRITICAL', 'WARNING', 'INFO')),
    title text not null,
    description text,
    category text not null default 'SAFETY',
    acknowledged boolean not null default false,
    acknowledged_at timestamptz,
    acknowledged_by text
);

create index if not exists idx_mission_alerts_created_at on public.mission_alerts (created_at desc);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Allow web clients using the Anon Public Key to read and write records
-- =========================================================================

alter table public.missions enable row level security;
alter table public.telemetry_logs enable row level security;
alter table public.human_detections enable row level security;
alter table public.mission_alerts enable row level security;

-- Missions: Allow read and insert for anon
create policy "Allow anon select missions" on public.missions for select using (true);
create policy "Allow anon insert missions" on public.missions for insert with check (true);
create policy "Allow anon update missions" on public.missions for update using (true);

-- Telemetry Logs: Allow read and insert for anon
create policy "Allow anon select telemetry" on public.telemetry_logs for select using (true);
create policy "Allow anon insert telemetry" on public.telemetry_logs for insert with check (true);

-- Human Detections: Allow read, insert, update for anon
create policy "Allow anon select detections" on public.human_detections for select using (true);
create policy "Allow anon insert detections" on public.human_detections for insert with check (true);
create policy "Allow anon update detections" on public.human_detections for update using (true);

-- Mission Alerts: Allow read, insert, update for anon
create policy "Allow anon select alerts" on public.mission_alerts for select using (true);
create policy "Allow anon insert alerts" on public.mission_alerts for insert with check (true);
create policy "Allow anon update alerts" on public.mission_alerts for update using (true);

-- =========================================================================
-- SUPABASE REALTIME CONFIGURATION
-- Broadcast live updates over WebSockets for real-time telemetry streaming
-- =========================================================================

begin;
  -- Add tables to realtime publication if not already included
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table 
    public.missions,
    public.telemetry_logs, 
    public.human_detections, 
    public.mission_alerts;
commit;
