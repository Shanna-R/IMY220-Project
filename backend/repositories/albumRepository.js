import { getDB } from '../db.js';

export async function getAllAlbums()
{
    const db = getDB();

    return await db
        .collection('albums')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
}

export async function getAlbumById(id)
{
    const db = getDB();

    return await db.collection('albums').findOne({
        _id: id
    });
}

export async function getAlbumsByOwner(ownerId)
{
    const db = getDB();

    return await db
        .collection('albums')
        .find({ ownerId })
        .sort({ createdAt: -1 })
        .toArray();
}

export async function createAlbum(album)
{
    const db = getDB();

    await db.collection('albums').insertOne(album);

    return await getAlbumById(album._id);
}

export async function updateAlbum(id, updates)
{
    const db = getDB();

    await db.collection('albums').updateOne(
        { _id: id },
        {
        $set: updates
        }
    );

    return await getAlbumById(id);
}

export async function deleteAlbum(id)
{
    const db = getDB();

    return await db.collection('albums').deleteOne({
        _id: id
    });
}