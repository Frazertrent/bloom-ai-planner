
-- SECURITY FIX: Enable RLS on all tables and fix views

-- Enable RLS on all tables
ALTER TABLE public.budget_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_design ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flower_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flower_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flower_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hard_goods_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labor_rates_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substitutions_made ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Fix Security Definer Views
DROP VIEW IF EXISTS public.event_summary;
CREATE VIEW public.event_summary WITH (security_invoker = on) AS
SELECT e.id, e.title, e.event_type, e.status, e.event_date, e.guest_count,
    (c.first_name::text || ' ' || c.last_name::text) AS client_name,
    c.email AS client_email, c.phone AS client_phone,
    e.budget_target, e.quoted_amount, e.final_amount, e.deposit_paid, e.final_payment_received,
    (up.first_name::text || ' ' || up.last_name::text) AS assigned_florist,
    e.organization_id, e.created_at, e.updated_at
FROM events e
LEFT JOIN clients c ON e.client_id = c.id
LEFT JOIN user_profiles up ON e.assigned_florist_id = up.id;

DROP VIEW IF EXISTS public.budget_summary;
CREATE VIEW public.budget_summary WITH (security_invoker = on) AS
SELECT b.id AS budget_id, b.event_id, b.organization_id, b.total_budget,
    count(bi.id) AS line_item_count,
    sum(bi.estimated_total) AS total_estimated,
    sum(bi.actual_total) AS total_actual,
    sum(bi.client_price) AS total_client_price,
    b.status, b.version, b.created_at, b.updated_at
FROM budgets b LEFT JOIN budget_items bi ON b.id = bi.budget_id
GROUP BY b.id, b.event_id, b.organization_id, b.total_budget, b.status, b.version, b.created_at, b.updated_at;

DROP VIEW IF EXISTS public.photo_collection_summary;
CREATE VIEW public.photo_collection_summary WITH (security_invoker = on) AS
SELECT pc.id, pc.name, pc.collection_type, pc.event_id, e.title AS event_title,
    pc.photo_count, pc.total_size_bytes, pc.is_public, pc.is_featured, pc.client_access,
    p.file_url AS cover_photo_url, pc.organization_id, pc.created_at, pc.updated_at
FROM photo_collections pc
LEFT JOIN events e ON pc.event_id = e.id
LEFT JOIN photos p ON pc.cover_photo_id = p.id;

DROP VIEW IF EXISTS public.table_sizes;
CREATE VIEW public.table_sizes WITH (security_invoker = on) AS
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats WHERE schemaname = 'public' ORDER BY tablename, attname;

GRANT SELECT ON public.event_summary TO authenticated;
GRANT SELECT ON public.budget_summary TO authenticated;
GRANT SELECT ON public.photo_collection_summary TO authenticated;
GRANT SELECT ON public.table_sizes TO authenticated;
