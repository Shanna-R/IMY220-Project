import { getDB } from '../db.js';

export async function getAllPosts()
{
    const db = getDB();

    return await db
        .collection('posts')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
}

export async function getPostById(id)
{
    const db = getDB();

    return await db.collection('posts').findOne({
        _id: id
    });
}

export async function getPostsByAuthor(authorId)
{
    const db = getDB();

    return await db
        .collection('posts')
        .find({ authorId })
        .sort({ createdAt: -1 })
        .toArray();
}

export async function createPost(post)
{
    const db = getDB();

    await db.collection('posts').insertOne(post);

    return await getPostById(post._id);
}

export async function updatePost(id, updates)
{
    const db = getDB();

    await db.collection('posts').updateOne(
        { _id: id },
        {
        $set: updates
        }
    );

    return await getPostById(id);
}

export async function deletePost(id)
{
    const db = getDB();

    return await db.collection('posts').deleteOne({
        _id: id
    });
}