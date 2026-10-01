import { getDB } from '../db.js';

export async function createReport(report)
{
    const db = getDB();

    await db.collection('reports').insertOne(report);

    return await db.collection('reports').findOne({
        _id: report._id
    });
}

export async function getReportsForPost(postId)
{
    const db = getDB();

    return await db
        .collection('reports')
        .find({ postId })
        .toArray();
}

export async function countReportsForPost(postId)
{
    const db = getDB();

    return await db.collection('reports').countDocuments({
        postId
    });
}