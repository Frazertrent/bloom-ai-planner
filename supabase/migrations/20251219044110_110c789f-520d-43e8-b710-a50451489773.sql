-- Allow public uploads to avatars subfolder for seller portal
CREATE POLICY "Anyone can upload seller avatars"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = 'avatars'
);

-- Allow public deletion of avatars (so sellers can remove/replace their photo)
CREATE POLICY "Anyone can delete seller avatars"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = 'avatars'
);

-- Allow public updates to avatars (for replacing images)
CREATE POLICY "Anyone can update seller avatars"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = 'avatars'
)
WITH CHECK (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = 'avatars'
);