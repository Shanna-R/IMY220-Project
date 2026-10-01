import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(
  process.env.MONGODB_URI
);

let db;

export async function connectDB() {
  if (!db) {
    await client.connect();

    db = client.db(
      process.env.DB_NAME || 'Woggle'
    );

    console.log('Connected to MongoDB');
  }

  return db;
}

export function getDB() {
  if (!db) {
    throw new Error(
      'Database has not been connected.'
    );
  }

  return db;
}