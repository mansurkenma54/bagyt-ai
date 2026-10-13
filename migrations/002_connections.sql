CREATE TABLE IF NOT EXISTS connections (
  org_id text NOT NULL REFERENCES organizations(id),
  provider text NOT NULL,
  identifier text NOT NULL,
  mode text NOT NULL DEFAULT 'Demo' CHECK(mode='Demo'),
  permissions jsonb NOT NULL,
  consented_by text NOT NULL REFERENCES users(id),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(org_id,provider)
);
CREATE TABLE IF NOT EXISTS documents (
  id text PRIMARY KEY,
  org_id text NOT NULL REFERENCES organizations(id),
  filename text NOT NULL,
  content bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id,filename)
);
GRANT SELECT,INSERT,UPDATE,DELETE ON connections,documents TO bagyt_tenant;
DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['connections','documents'] LOOP
EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);
EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I',t);
EXECUTE format('CREATE POLICY tenant_isolation ON %I TO bagyt_tenant USING(org_id=current_setting(''bagyt.org_id'',true)) WITH CHECK(org_id=current_setting(''bagyt.org_id'',true))',t);
END LOOP; END $$;
