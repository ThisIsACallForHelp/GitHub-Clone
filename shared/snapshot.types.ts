export enum snapshotType{
    FULL = 1, DIFFERENTIAL = 2, INCREMENTAL = 4
}

export enum changeType{
    ADDED = 1, MODIFIED = 2, DELETED = 4
}

export interface FileChange{
    path : string,
    action : changeType,
    contentHash? : string
    mtime?: number
}

export interface Snapshot{
    snapshotID : string,
    timestamp: number,
    type: snapshotType,
    changes: FileChange[],
    parentSnapshotId? : string
}