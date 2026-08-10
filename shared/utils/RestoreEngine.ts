import { Snapshot, snapshotType, changeType } from '../snapshot.types';
import { writeFile, unlink } from 'fs/promises';

async function mockGetBlob(hash: string): Promise<string> {return "dummy data";}//for now till arie finishes

export const dummySnapshotHistory: Snapshot[] = [
    // 1. The Oldest (The FULL baseline)
    {
        snapshotID: "commit_v1_full",
        timestamp: 1600000000000,
        type: snapshotType.FULL,
        changes: [
            { path: "src/index.ts", action: changeType.ADDED, contentHash: "hash_v1_index" },
            { path: "README.md", action: changeType.ADDED, contentHash: "hash_v1_readme" }
        ]
    },
    // 2. The Middle (A DIFFERENTIAL update)
    {
        snapshotID: "commit_v2_diff",
        timestamp: 1600000500000,
        type: snapshotType.DIFFERENTIAL,
        parentSnapshotId: "commit_v1_full",
        changes: [
            // Overwrites the old index.ts with a new one
            { path: "src/index.ts", action: changeType.MODIFIED, contentHash: "hash_v2_index_updated" } 
        ]
    },
    // 3. The Newest (An INCREMENTAL update)
    {
        snapshotID: "commit_v3_inc",
        timestamp: 1600001000000,
        type: snapshotType.INCREMENTAL,
        parentSnapshotId: "commit_v2_diff",
        changes: [
            { path: "README.md", action: changeType.DELETED },
            { path: "config.json", action: changeType.ADDED, contentHash: "hash_v3_config" }
        ]
    }
];
//replace later with a working func
const snapshotsHistory = dummySnapshotHistory

export function GetSnapshotChain(lastSnapshot : Snapshot) : Snapshot[]
{
    const chain: Snapshot[] = [];
    let curr : Snapshot | undefined = lastSnapshot;
    while(curr !== undefined)
    {
        chain.push(curr);
        if(curr.type == 1)
        {
            break;
        }
        curr = snapshotsHistory.find(snap => snap.snapshotID == curr?.parentSnapshotId);
    }
    chain.reverse();
    return chain;
}

export async function RestoreLastSnapshot(lastSnapshot : Snapshot)
{
    const chain = GetSnapshotChain(lastSnapshot);
    for(const snapshot of chain)
    {
        for (const change of snapshot.changes)
        {
            switch(change.action)
            {
                case changeType.DELETED:
                    await unlink(change.path);
                    break;
                default:
                    const data = await mockGetBlob(change.contentHash!);
                    await writeFile(change.path, data);
                    break;
            }
        }
    }
}