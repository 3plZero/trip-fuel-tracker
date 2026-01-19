CREATE OR REPLACE FUNCTION public.get_storage_usage()
RETURNS TABLE (bucket_id text, total_bytes bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, storage
AS $$
  SELECT 
    bucket_id,
    COALESCE(SUM((metadata->>'size')::bigint), 0) as total_bytes
  FROM storage.objects
  GROUP BY bucket_id;
$$;