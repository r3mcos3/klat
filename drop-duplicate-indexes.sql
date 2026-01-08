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
    i.schemaname,
    i.tablename,
    i.indexname,
    pg_size_pretty(pg_relation_size(i.indexname::regclass)) as index_size,
    COALESCE(s.idx_scan, 0) as scans,
    CASE
        WHEN COALESCE(s.idx_scan, 0) = 0 THEN '⚠️ Unused (may be new or for future use)'
        ELSE '✅ Active'
    END as status
FROM pg_indexes i
LEFT JOIN pg_stat_user_indexes s
    ON i.schemaname = s.schemaname
    AND i.tablename = s.tablename
    AND i.indexname = s.indexname
WHERE i.schemaname = 'public'
ORDER BY i.tablename, i.indexname;
