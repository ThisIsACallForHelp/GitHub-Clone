import { Database } from './types.ts' // this is the Database interface we defined earlier
import { Pool } from "pg"
import { Kysely, PostgresDialect, sql } from 'kysely'

// all params to env
const dialect = new PostgresDialect({
  pool: new Pool({
    database: 'MainDB',
    host: 'localhost',
    user: undefined, //need to add the username from env
    password: undefined, //need to add the password from env
    port: 5432,
  })
})

const db = new Kysely<Database>({
  dialect,
})


export async function initDB() {
  try{
  await sql`
  create type FileChange as (
  path TEXT NOT NULL PRIMARY KEY,
  action SMALLINT CHECK (action IN (1, 2, 4)),
  contentHash TEXT,
  mtime BIGINT
  );
  `.execute(db)
  }
  catch(ex){console.log("Type already exists")}

  await db.schema.createTable("users").ifNotExists()
  .addColumn("user_name",'varchar', (cb) => cb.primaryKey().notNull())
  .addColumn("hashed_pass", 'varchar(64)', (cb) => cb.notNull())
  .execute()

  await db.schema.createTable("blobs").ifNotExists()
  .addColumn("hash", 'varchar(64)', (cb) => cb.notNull().primaryKey())
  .addColumn("context", 'bytea')
  .execute()

  await db.schema.createTable("snapshots").ifNotExists()
  .addColumn("snapshotID",'varchar(64)', (cb) => cb.primaryKey().notNull())
  .addColumn("timestamp","bigint", (cb) => cb.notNull())
  .addColumn("type","smallint", (cb) => cb.notNull().check(sql`type IN (1,2,4)`))
  .addColumn("changes" , sql`FileChange[]`)
  .addColumn("parentSnapshotId" , 'varchar(64)')
  .execute()
}


export default db;