-- Activate the stuck campaign immediately
UPDATE bf_campaigns 
SET status = 'active', updated_at = now() 
WHERE id = '0e44d93c-08f6-42f9-8b28-e33df4cde92e' 
AND status = 'scheduled';