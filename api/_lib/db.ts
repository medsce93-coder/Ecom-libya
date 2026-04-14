import { Pool, type PoolClient, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __ecomPool: Pool | undefined;
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  if (!global.__ecomPool) {
    // Serverless-safe defaults: keep pool small per function instance and reuse globally.
    global.__ecomPool = new Pool({
      connectionString,
      max: parsePositiveInt(process.env.DB_POOL_MAX, 3),
      idleTimeoutMillis: parsePositiveInt(process.env.DB_IDLE_TIMEOUT_MS, 10_000),
      connectionTimeoutMillis: parsePositiveInt(
        process.env.DB_CONNECTION_TIMEOUT_MS,
        10_000,
      ),
      maxUses: parsePositiveInt(process.env.DB_MAX_USES, 5_000),
      keepAlive: true,
    });
  }

  return global.__ecomPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query<T>(text, values);
  return result.rows;
}

export async function withTransaction<T>(
  action: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const value = await action(client);
    await client.query("COMMIT");
    return value;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
