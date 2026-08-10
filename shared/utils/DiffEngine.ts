import {readdir, stat} from 'fs/promises';
import {join} from 'path';
import {FileChange, Snapshot, changeType} from '../snapshot.types';
import {GetHashedContent} from './contentHasher';

export async function getDifferences(targetPath: string, lastFullSnapshot: Snapshot): Promise<FileChange[]> {
    const changes: FileChange[] = [];
    const allFiles = await readdir(targetPath, {recursive : true});
    for(let i = 0; i < allFiles.length; ++i)
    {
        const oldRecord = lastFullSnapshot.changes.find(change => change.path === allFiles[i]);
        if(!oldRecord)
        {
            const newHash = await GetHashedContent(allFiles[i]);
            changes.push({
                path : allFiles[i],
                action : changeType.ADDED,
                contentHash : newHash,
                mtime : (await stat(allFiles[i])).mtimeMs
            });
        }
        else
        {
            const updatedHash = await GetHashedContent(allFiles[i]);
            if((await stat(allFiles[i])).mtimeMs !== oldRecord.mtime)
            {
                changes.push({
                path : allFiles[i],
                action : changeType.MODIFIED,
                contentHash : updatedHash,
                mtime : (await stat(allFiles[i])).mtimeMs})
            }
        }
    }

    for(let i = 0; i < lastFullSnapshot.changes.length; i++)
    {
        if(!allFiles.includes(lastFullSnapshot.changes[i].path))
        {
            changes.push({
                path : lastFullSnapshot.changes[i].path,
                action : changeType.DELETED});
        }
    }
    return changes;
}