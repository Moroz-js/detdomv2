-- Переписать URL статики темы WP → локальная раздача через nginx /media/
-- https://detskiydomuss.ru/wp-content/themes/detdom/documents/... → /media/documents/...
-- https://detskiydomuss.ru/wp-content/themes/detdom/assets/img/...  → /media/assets/img/...

DO $$
DECLARE
  r RECORD;
  n bigint;
  total bigint := 0;
BEGIN
  FOR r IN
    SELECT table_schema, table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type IN ('character varying', 'text')
      AND table_name NOT LIKE 'payload\_%' ESCAPE '\'
  LOOP
    EXECUTE format(
      'UPDATE %I.%I SET %I = regexp_replace(%I, ''https?://detskiydomuss\.ru/wp-content/themes/detdom'', ''/media'', ''g'') WHERE %I LIKE ''%%wp-content/themes/detdom%%''',
      r.table_schema, r.table_name, r.column_name, r.column_name, r.column_name
    );
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n > 0 THEN
      RAISE NOTICE '%.%: % rows', r.table_name, r.column_name, n;
      total := total + n;
    END IF;
  END LOOP;
  RAISE NOTICE 'fix-theme-urls: % rows total', total;
END $$;
