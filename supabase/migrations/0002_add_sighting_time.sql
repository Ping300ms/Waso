-- Optional time-of-day for a sighting (HH:MM), used by time-based badges
-- (e.g. "Lève-tôt", "Oiseau de nuit"). Null when the user didn't specify a time.
alter table public.sightings add column if not exists first_seen_time time null;
