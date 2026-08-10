import { Database } from './types.ts' // this is the Database interface we defined earlier
import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'

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

// create tables.

export default db;