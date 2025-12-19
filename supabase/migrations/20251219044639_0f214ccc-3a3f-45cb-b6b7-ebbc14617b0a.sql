-- Allow sellers to update their own student record via magic link validation
CREATE POLICY "Sellers can update own record via magic link"
ON bf_students
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM bf_campaign_students cs
    WHERE cs.student_id = bf_students.id
    AND cs.magic_link_code IS NOT NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM bf_campaign_students cs
    WHERE cs.student_id = bf_students.id
    AND cs.magic_link_code IS NOT NULL
  )
);