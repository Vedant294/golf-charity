-- Run this in Supabase SQL Editor AFTER running supabase_schema.sql

-- 1. Insert system config (required for draw engine)
INSERT INTO system_config (id, subscription_amount, rollover_pool, draw_type)
VALUES (1, 19.99, 0.00, 'random')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert sample charities
INSERT INTO charities (name, description, is_active) VALUES
  ('Red Cross International', 'Providing emergency assistance, disaster relief, and disaster preparedness worldwide.', true),
  ('Doctors Without Borders', 'Medical humanitarian organization providing aid in conflict zones and countries affected by disease.', true),
  ('World Wildlife Fund', 'Leading conservation organization working to protect wildlife and natural habitats globally.', true)
ON CONFLICT DO NOTHING;

-- 3. After signing up, promote yourself to admin:
-- UPDATE users SET role = 'admin' WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'your-admin@email.com'
-- );
