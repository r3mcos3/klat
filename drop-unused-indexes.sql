-- Drop Unused Indexes - Cleanup Script
-- Run this SQL in Supabase SQL Editor
-- This will improve write performance and save storage

-- Drop unused composite indexes (0 scans, 0% usage)
DROP INDEX IF EXISTS public.idx_notes_userid_createdat;
DROP INDEX IF EXISTS public.idx_notes_userid_date;
DROP INDEX IF EXISTS public.idx_notes_date_userid;  -- Duplicate of above

-- Drop unused single-column indexes
DROP INDEX IF EXISTS public.idx_notes_completedat;
DROP INDEX IF EXISTS public.idx_notes_date;
DROP INDEX IF EXISTS public.idx_notes_deadline;
DROP INDEX IF EXISTS public.notes_in_progress_idx;
DROP INDEX IF EXISTS public.tags_name_key;

-- Verify remaining indexes
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Summary: What indexes remain (these ARE being used)
-- ✅ notes_pkey (206 scans)
-- ✅ idx_notes_userid (77 scans)
-- ✅ idx_notes_createdat (8 scans)
-- ✅ tags_pkey (4,740 scans)
-- ✅ idx_tags_userid (67 scans)
-- ✅ idx_tags_name (17 scans)
-- ✅ _NoteToTag_pkey (397 scans)
-- ✅ _NoteToTag_B_index (115 scans)
