-- Drop Duplicate and Redundant Indexes (Conservative Approach)
-- Run this SQL in Supabase SQL Editor
-- Only removes true duplicates and redundant indexes

-- Drop duplicate index (wrong column order, less useful than idx_notes_userid_date)
DROP INDEX IF EXISTS public.idx_notes_date_userid;

-- Drop redundant single-column index (covered by composite indexes)
DROP INDEX IF EXISTS public.idx_notes_date;

-- These indexes are KEPT for potential future use:
-- ✅ idx_notes_completedat - For future "show completed notes" feature
-- ✅ idx_notes_deadline - For future "notes with deadlines" feature
-- ✅ notes_in_progress_idx - For future "show in-progress notes" feature
-- ✅ tags_name_key - Likely used for UNIQUE constraint

-- Verify remaining indexes
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size,
    idx_scan as scans,
    CASE
        WHEN idx_scan = 0 THEN '⚠️ Unused (may be new or for future use)'
        ELSE '✅ Active'
    END as status
FROM pg_indexes
JOIN pg_stat_user_indexes USING (schemaname, tablename, indexname)
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
