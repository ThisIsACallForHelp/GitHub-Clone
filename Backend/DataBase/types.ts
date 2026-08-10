import { Snapshot } from '../../shared/snapshot.types.ts'

export interface Database {
    users: Users
    blobs: Blobs
    snapshots: Snapshot
}

export interface Users{
    user_name: string
    hashed_pass: string
}

export interface Blobs{
    hash: string
    context?: string
}