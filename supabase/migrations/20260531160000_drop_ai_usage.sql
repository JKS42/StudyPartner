-- Remove legacy AI rate-limit table (app no longer uses external AI)
DROP TABLE IF EXISTS public.ai_usage;
