import {
  ColumnType,
  Generated,
  Insertable,
  JSONColumnType,
  Selectable,
  Updateable,
} from 'kysely'

export interface Database {
    users: Users
    //snapshots: Snapshots
}


export interface Users{
    user_name: string
    hashed_pass: string
}



export interface Blobs{
    hash: string
    context: undefined
}