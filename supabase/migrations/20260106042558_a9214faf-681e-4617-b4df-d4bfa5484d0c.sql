-- Add DELETE policy for drivers table
CREATE POLICY "Authenticated users can delete drivers"
ON public.drivers
FOR DELETE
USING (true);