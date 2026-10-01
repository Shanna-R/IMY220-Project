import { getDB } from '../db.js';

export async function getAllUsers()
{
    const db = getDB();

    return await db
        .collection('users')
        .find({}, {
        projection: { password: 0 }
        })
        .toArray();
}

export async function getUserById(id)
{
    const db = getDB();

    return await db.collection('users').findOne(
        { _id: id },
        { projection: { password: 0 } }
    );
}

export async function getUserForLogin(email, password)
{
    const db = getDB();

    return await db.collection('users').findOne({
        email,
        password
    });
}

export async function getUserByEmail(email)
{
    const db = getDB();

    return await db.collection('users').findOne({
        email
    });
}

export async function createUser(user)
{
    const db = getDB();

    await db.collection('users').insertOne(user);

    return await getUserById(user._id);
}

export async function updateUser(id, updates)
{
    const db = getDB();

    await db.collection('users').updateOne(
        { _id: id },
        {
        $set: updates
        }
    );

    return await getUserById(id);
}

export async function deleteUser(id)
{
    const db = getDB();

    return await db.collection('users').deleteOne({
        _id: id
    });
}