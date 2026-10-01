import { getDB } from '../db.js';


export async function createReport(report)
{
    const db = getDB();

    await db.collection('reports').insertOne(report);

    return await db.collection('reports').findOne({
        _id: report._id
    });
}


export async function getAllReports()
{
    const db = getDB();

    return await db
        .collection('reports')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
}


export async function getReportsForPost(postId)
{
    const db = getDB();

    return await db
        .collection('reports')
        .find({
            targetType: 'post',
            targetId: postId
        })
        .toArray();
}


export async function countReportsForPost(postId)
{
    const db = getDB();

    return await db.collection('reports').countDocuments({
        targetType: 'post',
        targetId: postId
    });
}


export async function getReportsForUser(userId)
{
    const db = getDB();

    return await db
        .collection('reports')
        .find({
            targetType: 'user',
            targetId: userId
        })
        .toArray();
}


export async function hasUserReported(
    reporterId,
    targetType,
    targetId
)
{
    const db = getDB();

    const existingReport =
        await db.collection('reports').findOne({
            reporterId,
            targetType,
            targetId
        });

    return existingReport !== null;
}


export async function deleteReportsForPost(postId)
{
    const db = getDB();

    await db.collection('reports').deleteMany({
        targetType: 'post',
        targetId: postId
    });
}


export async function deleteReportsForUser(userId)
{
    const db = getDB();

    await db.collection('reports').deleteMany({
        targetType: 'user',
        targetId: userId
    });
}