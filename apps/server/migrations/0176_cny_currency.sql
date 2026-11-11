-- Custom SQL migration file, put your code below! --
-- CNY (Chinese yuan) as a default enabled currency (alongside USD · CAD · GBP · EUR · EGP).
-- Existing instances get the row enabled; new installs also get it from 0004 / seed-reference.
-- The switch guard (0027) is recreated so CNY cannot be turned off either.

INSERT INTO public.currencies (code, name, minor_units, symbol, enabled)
VALUES ('CNY', 'Chinese yuan', 2, '¥', true)
ON CONFLICT (code) DO UPDATE
  SET enabled = true, symbol = EXCLUDED.symbol, name = EXCLUDED.name, minor_units = EXCLUDED.minor_units
WHERE public.currencies.enabled = false
   OR public.currencies.symbol IS DISTINCT FROM EXCLUDED.symbol
   OR public.currencies.name IS DISTINCT FROM EXCLUDED.name
   OR public.currencies.minor_units IS DISTINCT FROM EXCLUDED.minor_units;

--> statement-breakpoint
-- 2. The switch's guard: the six defaults stay on (same body as 0027, plus CNY).
CREATE OR REPLACE FUNCTION kept.guard_currency_enabled() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, public AS $$
BEGIN
  IF current_user = 'kept_owner' OR NOT (OLD.enabled AND NOT NEW.enabled) THEN
    RETURN NEW;
  END IF;
  IF NEW.code IN ('USD', 'CAD', 'GBP', 'EUR', 'EGP', 'CNY') THEN
    RAISE EXCEPTION 'the default currencies stay on'
      USING ERRCODE = 'check_violation', CONSTRAINT = 'currencies_default_fixed';
  END IF;
  IF NEW.code::text IN (SELECT kept.currencies_in_use()) THEN
    RAISE EXCEPTION 'a location uses this currency'
      USING ERRCODE = 'check_violation', CONSTRAINT = 'currencies_in_use';
  END IF;
  RETURN NEW;
END $$;
