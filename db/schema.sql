create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists profile_stats (
  user_id uuid primary key references users(id) on delete cascade,
  routes_generated integer not null default 0,
  generated_distance_m double precision not null default 0,
  navigated_distance_m double precision not null default 0,
  navigation_sessions integer not null default 0,
  reroutes_accepted integer not null default 0,
  total_compute_ms double precision not null default 0,
  nodes_visited bigint not null default 0,
  road_segments bigint not null default 0,
  longest_route_m double precision not null default 0,
  route_modes jsonb not null default '{"car":0,"bike":0,"walk":0}'::jsonb,
  favorite_mode text not null default 'car',
  last_route_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_email_idx on users(email);
