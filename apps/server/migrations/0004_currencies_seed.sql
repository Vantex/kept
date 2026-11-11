-- Custom SQL migration file, put your code below! --
-- The supported currencies (D136): USD · CAD · GBP · EUR · EGP, all with two minor units.
-- CNY is enabled by 0176 (and by seed-reference on a fresh migrate).
-- Adding one later is a row, not a schema change.
INSERT INTO public.currencies (code, name, minor_units, symbol, enabled) VALUES
  ('USD', 'US dollar', 2, '$', true),
  ('CAD', 'Canadian dollar', 2, 'CA$', true),
  ('GBP', 'Pound sterling', 2, '£', true),
  ('EUR', 'Euro', 2, '€', true),
  ('EGP', 'Egyptian pound', 2, 'E£', true)
ON CONFLICT (code) DO NOTHING;
