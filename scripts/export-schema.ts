import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use environment variables for credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  if (!supabaseUrl) console.error('- NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseServiceKey) console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function exportSchema() {
  try {
    // Get all tables in the public schema using pg_tables
    const { data: tables, error: tablesError } = await supabase
      .rpc('list_tables');

    if (tablesError) {
      console.error('Error getting tables:', tablesError);
      return;
    }

    if (!tables || tables.length === 0) {
      console.log('No tables found in the public schema');
      return;
    }

    console.log(`Found ${tables.length} tables`);

    // Format the data as SQL statements
    let migrationSQL = '-- Drop existing tables (in correct dependency order)\n';
    
    // Add DROP statements in reverse dependency order
    const dropOrder = [
      'assignment_competencies',
      'submissions',
      'assignments',
      'competencies',
      'course_attachments',
      'course_teachers',
      'enrollments',
      'courses',
      'users'
    ];

    for (const tableName of dropOrder) {
      migrationSQL += `DROP TABLE IF EXISTS "${tableName}" CASCADE;\n`;
    }
    migrationSQL += '\n';

    // Get table definitions and policies
    for (const table of tables) {
      const { data: tableInfo, error: tableError } = await supabase
        .rpc('get_create_table_statement', { p_table_name: table.table_name });

      if (tableError) {
        console.error(`Error getting definition for table ${table.table_name}:`, tableError);
        continue;
      }

      migrationSQL += `-- Table: ${table.table_name}\n`;
      migrationSQL += tableInfo;
      migrationSQL += '\n\n';

      // Get RLS policies
      const { data: policies, error: policiesError } = await supabase
        .rpc('get_table_policies', { p_table_name: table.table_name });

      if (!policiesError && policies && policies.length > 0) {
        migrationSQL += '-- Row Level Security Policies\n';
        migrationSQL += `ALTER TABLE "${table.table_name}" ENABLE ROW LEVEL SECURITY;\n\n`;
        migrationSQL += policies.join('\n') + '\n\n';
      }
    }

    // Save migration file
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const migrationDir = path.join(process.cwd(), 'supabase', 'migrations');

    // Ensure migrations directory exists
    if (!fs.existsSync(migrationDir)) {
      fs.mkdirSync(migrationDir, { recursive: true });
    }

    const migrationFilePath = path.join(migrationDir, `${timestamp}_schema_export.sql`);
    fs.writeFileSync(migrationFilePath, migrationSQL);

    console.log(`Migration file created: ${migrationFilePath}`);

  } catch (error) {
    console.error('Error exporting schema:', error);
    process.exit(1);
  }
}

exportSchema(); 