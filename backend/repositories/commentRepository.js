import { getDB } from '../db.js';

export async function getCommentsByPost(postId)
{
    const db = getDB();

    return await db
        .collection('comments')
        .find({ postId })
        .sort({ createdAt: -1 })
        .toArray();
}

export async function createComment(comment)
{
    const db = getDB();

    await db.collection('comments').insertOne(comment);

    return await db.collection('comments').findOne({
        _id: comment._id
    });
}

export async function deleteCommentsForPost(postId)
{
    const db = getDB();

    return await db.collection('comments').deleteMany({
        postId
    });
}