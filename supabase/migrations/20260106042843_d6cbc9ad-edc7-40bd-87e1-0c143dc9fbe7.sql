-- Add DELETE policy for vehicles table
CREATE POLICY "Authenticated users can delete vehicles"
ON public.vehicles
FOR DELETE
USING (true);