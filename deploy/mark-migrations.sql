-- Отметить миграции как применённые (схема уже в дампе Neon / bootstrap).
-- При добавлении новой миграции в src/migrations/ — добавь строку сюда же.
-- CI после этого прогонит migrate и применит только новые.

INSERT INTO payload_migrations (name, batch, created_at, updated_at)
SELECT v.name, v.batch, now(), now()
FROM (VALUES
  ('20260419_182714_initial', 1::numeric),
  ('20260526_214751_add_remote_url_fields', 2::numeric)
) AS v(name, batch)
WHERE NOT EXISTS (
  SELECT 1 FROM payload_migrations pm WHERE pm.name = v.name
);
