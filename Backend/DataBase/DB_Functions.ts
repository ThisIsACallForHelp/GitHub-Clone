import { FileChange, Snapshot} from "../../shared/snapshot.types.ts"
import {sql} from 'kysely'
import db from "./DB_init.ts"

export const dbFuncs = {
    getSnapshotByID: async (id: string) => {
        return await db.selectFrom("snapshots").where("snapshotID" , '=' , id).selectAll().execute()
    },
    getSnapshotsBiggerTime: async (time: number) => {
        return await db.selectFrom("snapshots").where("timestamp" , '<=' , time).selectAll().execute()
    },
    getAllSnapshots: async () => {
        return await db.selectFrom("snapshots").selectAll().execute()
    },
    addFileChangeById: async (id: string, filechange: FileChange) => {
        return await db.updateTable("snapshots")
        .set({
            changes: sql`array_append(changes, ${filechange}::FileChange)`
        })
        .where("snapshotID" , '=' , id)
        .execute()
    },
    addSnapshot: async (snap: Snapshot) => {
        db.insertInto("snapshots").values(snap).execute();
    }
}