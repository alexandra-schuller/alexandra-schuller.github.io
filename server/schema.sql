-- Planner sync storage.
--
-- One row per person per day. The page itself is a JSON document written by the
-- browser; Postgres stores it whole and never looks inside. `updated` is the
-- browser's own millisecond clock, which is what the app already stamps on every
-- save, and what the upsert uses to refuse a write that is older than the row
-- it would replace.

create table if not exists planner_days (
    owner   text   not null,
    ymd     text   not null,
    doc     jsonb  not null,
    updated bigint not null,
    primary key (owner, ymd)
);

-- The client asks "what changed since?" on every poll, so index for that.
create index if not exists planner_days_owner_updated
    on planner_days (owner, updated);
