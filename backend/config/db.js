const mongoose = require('mongoose');
const { Pool } = require('pg');

// ─── MongoDB Connection ───────────────────────────────────────────────────────
const connectMongoDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in the .env file.');
    }
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,  // give up selecting server after 10s
      heartbeatFrequencyMS: 10000,      // check server health every 10s
      socketTimeoutMS: 45000,           // close idle sockets after 45s
      connectTimeoutMS: 10000,          // TCP connect timeout
      retryWrites: true,
      retryReads: true,
    });
    console.log('MongoDB (Persistence DB) connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// ─── PostgreSQL Connection Pool ───────────────────────────────────────────────
let pgPool;
// Prefer DATABASE_URL (Supabase Session Pooler, port 5432 / 6543)
// over POSTGRES_URI (direct host which may hit IPv6 / firewall timeouts).
if (process.env.DATABASE_URL || process.env.POSTGRES_URI) {
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URI,
    ssl: { rejectUnauthorized: false }, // Required for Supabase / hosted Postgres
    connectionTimeoutMillis: 10000,     // fail fast if DB unreachable
    idleTimeoutMillis: 30000,           // release idle clients after 30s
    max: 5,                             // keep pool small for Supabase free tier
  });
} else {
  console.warn('DATABASE_URL or POSTGRES_URI not set in .env. Postgres will not work.');
}

// ─── PostgreSQL Sandbox Execution ─────────────────────────────────────────────
// Creates a fresh schema per execution, injects sample data, runs query, and drops schema.
const executeSandboxQuery = async (query, sampleTables) => {
  if (!pgPool) {
    throw new Error('PostgreSQL is not configured correctly on the backend.');
  }

  const client = await pgPool.connect();
  const schemaName = `workspace_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  try {
    // 1. Create temporary schema for isolation
    await client.query(`CREATE SCHEMA ${schemaName};`);
    await client.query(`SET search_path TO ${schemaName};`);

    // 2. Setup tables and data
    for (const table of sampleTables) {
      // Create Table
      const columnDefs = table.columns
        .map(col => `${col.columnName} ${col.dataType}`)
        .join(', ');
      await client.query(`CREATE TABLE ${table.tableName} (${columnDefs});`);

      // Insert Rows
      if (table.rows && table.rows.length > 0) {
        const cols = table.columns.map(col => col.columnName);
        // Postgres parameterized values are $1, $2, etc.
        const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');

        for (const row of table.rows) {
          const values = cols.map(c => row[c]);
          await client.query(
            `INSERT INTO ${table.tableName} (${cols.join(', ')}) VALUES (${placeholders})`,
            values
          );
        }
      }
    }

    // 3. Execute User Query
    const result = await client.query(query);

    return {
      fields: result.fields ? result.fields.map(f => f.name) : [],
      rows: result.rows || [],
      rowCount: result.rowCount || 0
    };
  } finally {
    // 4. Cleanup Schema
    try {
      await client.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE;`);
    } catch (cleanupErr) {
      console.error(`Failed to cleanup schema ${schemaName}:`, cleanupErr);
    }
    client.release();
  }
};

module.exports = { connectMongoDB, executeSandboxQuery };
