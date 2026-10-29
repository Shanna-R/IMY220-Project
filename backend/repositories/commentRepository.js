import { getDB } from '../db.js';

export async function getCommentsByPost(postId) {
    const db = getDB();

    const comments = await db
        .collection('comments')
        .find({ postId })
        .sort({ createdAt: -1 })
        .toArray();

    const users = db.collection('users');

    return await Promise.all(
        comments.map(async (comment) => {
            const author = await users.findOne({
                _id: comment.authorId
            });

            return {
                ...comment,
                author: author
                    ? {
                        name: author.name,
                        username: author.username
                    }
                    : null
            };
        })
    );
}

export async function createComment(comment) {
    const db = getDB();

    await db.collection('comments').insertOne(comment);

    return await db.collection('comments').findOne({
        _id: comment._id
    });
}

export async function deleteCommentsForPost(postId) {
    const db = getDB();

    return await db.collection('comments').deleteMany({
        postId
    });
}

export async function getCommentCount(postId) {
    const db = getDB();

    return await db
        .collection('comments')
        .countDocuments({ postId });
}

export async function getCommentById(commentId) {
    const db = getDB();

    return await db.collection('comments').findOne({
        _id: commentId
    });
}

export async function deleteComment(commentId) {
    const db = getDB();

    return await db.collection('comments').deleteOne({
        _id: commentId
    });
}