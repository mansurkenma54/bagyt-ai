CREATE TABLE IF NOT EXISTS aqyl_daily_plans (
 id text PRIMARY KEY,
 org_id text NOT NULL REFERENCES organizations(id),
 user_id text NOT NULL REFERENCES users(id),
 day text NOT NULL,
 days integer NOT NULL CHECK(days IN (7,30,60)),
 language text NOT NULL CHECK(language IN ('ru','kk')),
 fingerprint text NOT NULL,
 plan jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(org_id,user_id,day,days,language)
);
CREATE TABLE IF NOT EXISTS aqyl_daily_progress (
 org_id text NOT NULL REFERENCES organizations(id),
 user_id text NOT NULL REFERENCES users(id),
 day text NOT NULL,
 days integer NOT NULL CHECK(days IN (7,30,60)),
 step_id text NOT NULL,
 done boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(org_id,user_id,day,days,step_id)
);
GRANT SELECT,INSERT,UPDATE,DELETE ON aqyl_daily_plans,aqyl_daily_progress TO bagyt_tenant;
DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['aqyl_daily_plans','aqyl_daily_progress'] LOOP
EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);
EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I',t);
EXECUTE format('CREATE POLICY tenant_isolation ON %I TO bagyt_tenant USING(org_id=current_setting(''bagyt.org_id'',true)) WITH CHECK(org_id=current_setting(''bagyt.org_id'',true))',t);
END LOOP; END $$;
