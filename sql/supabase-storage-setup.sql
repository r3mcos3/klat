-- Supabase Storage Setup for Image Upload
-- Run this SQL in Supabase SQL Editor

-- Step 1: RLS Policies for storage.objects

-- Policy 1: Allow authenticated users to upload images to their own folder
CREATE POLICY "Users can upload images to their own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'note-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow public read access to all images
CREATE POLICY "Public images are viewable by anyone"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'note-images');

-- Policy 3: Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'note-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Verify policies were created
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%note-images%';
