-- Add a proper preferred_date column to bookings so it's queryable and sortable.
-- The previous approach encoded it in the notes field as "Preferred date: YYYY-MM-DD".

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS preferred_date date;
