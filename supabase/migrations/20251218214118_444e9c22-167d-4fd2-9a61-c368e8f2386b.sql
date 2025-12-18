-- Schedule the campaign activation job to run every hour (more responsive than daily)
SELECT cron.schedule(
  'activate-scheduled-campaigns-hourly',
  '0 * * * *',
  $$
  SELECT
    net.http_post(
        url:='https://hdyuuykxujqjrpthswbi.supabase.co/functions/v1/activate-scheduled-campaigns',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkeXV1eWt4dWpxanJwdGhzd2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1Njc1NTEsImV4cCI6MjA3MjE0MzU1MX0.bmuf49YIB6ryd2Q7h9vo5UO-4fSaQ0M2U28beGye3Qk"}'::jsonb,
        body:=concat('{"triggered_at": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);