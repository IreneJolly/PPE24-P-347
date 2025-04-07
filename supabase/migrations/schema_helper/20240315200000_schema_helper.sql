-- Drop existing functions first
DROP FUNCTION IF EXISTS get_schema_info();
DROP FUNCTION IF EXISTS get_table_definition(text);
DROP FUNCTION IF EXISTS list_tables();
DROP FUNCTION IF EXISTS get_create_table_statement(text);
DROP FUNCTION IF EXISTS get_table_policies(text);

-- Function to list tables in public schema
CREATE OR REPLACE FUNCTION list_tables()
RETURNS TABLE (table_name text) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT tablename::text
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY tablename;
END;
$$;

-- Function to get CREATE TABLE statement
CREATE OR REPLACE FUNCTION get_create_table_statement(p_table_name text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  column_list text;
  constraint_list text;
BEGIN
  -- Get column definitions
  SELECT string_agg(
    format('  %I %s%s%s',
      c.column_name,
      c.udt_name,
      CASE WHEN c.is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
      CASE WHEN c.column_default IS NOT NULL THEN ' DEFAULT ' || c.column_default ELSE '' END
    ),
    E',\n'
  ) INTO column_list
  FROM information_schema.columns c
  WHERE c.table_schema = 'public' 
  AND c.table_name = p_table_name;

  -- Get constraints (primary key, unique, foreign key)
  SELECT string_agg(
    pg_get_constraintdef(c.oid),
    E',\n  '
  ) INTO constraint_list
  FROM pg_constraint c
  JOIN pg_namespace n ON n.oid = c.connamespace
  WHERE conrelid = (quote_ident('public') || '.' || quote_ident(p_table_name))::regclass
  AND contype IN ('p', 'u', 'f');

  -- Return the complete CREATE TABLE statement
  RETURN format(
    'CREATE TABLE IF NOT EXISTS %I (\n%s%s\n);',
    p_table_name,
    column_list,
    CASE WHEN constraint_list IS NOT NULL THEN E',\n  ' || constraint_list ELSE '' END
  );
END;
$$;

-- Function to get table policies
CREATE OR REPLACE FUNCTION get_table_policies(p_table_name text)
RETURNS text[] LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN ARRAY(
    SELECT format(
      'CREATE POLICY %I ON %I FOR %s TO %s%s%s;',
      polname,
      p_table_name,
      CASE 
        WHEN polcmd = 'r' THEN 'SELECT'
        WHEN polcmd = 'a' THEN 'INSERT'
        WHEN polcmd = 'w' THEN 'UPDATE'
        WHEN polcmd = 'd' THEN 'DELETE'
        ELSE 'ALL'
      END,
      CASE WHEN polroles = '{0}' THEN 'public' ELSE array_to_string(ARRAY(SELECT rolname FROM pg_roles WHERE oid = ANY(polroles)), ', ') END,
      CASE WHEN polqual IS NOT NULL THEN E'\n  USING (' || pg_get_expr(polqual, polrelid) || ')' ELSE '' END,
      CASE WHEN polwithcheck IS NOT NULL THEN E'\n  WITH CHECK (' || pg_get_expr(polwithcheck, polrelid) || ')' ELSE '' END
    )
    FROM pg_policy
    WHERE polrelid = (quote_ident('public') || '.' || quote_ident(p_table_name))::regclass
  );
END;
$$; 