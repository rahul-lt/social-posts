-- Schedule mirror of posts/*/post.json, kept in sync by the Netlify `sync` function.
create table if not exists sp_scheduled_posts (
  slug          text primary key,
  publish_at    timestamptz not null,
  sha           text not null,            -- git blob sha of post.json, so sync refetches only changed files
  dispatched_at timestamptz,
  attempts      int not null default 0,
  published_at  timestamptz,
  linkedin_url  text,
  updated_at    timestamptz not null default now()
);
create index if not exists scheduled_posts_due on sp_scheduled_posts (publish_at) where published_at is null;

create table if not exists sp_dispatch_log (
  id     bigserial primary key,
  at     timestamptz not null default now(),
  slugs  text[] not null,
  status int not null,
  note   text
);

-- Only the service-role key (Netlify functions) touches these tables.
alter table sp_scheduled_posts enable row level security;
alter table sp_dispatch_log enable row level security;
