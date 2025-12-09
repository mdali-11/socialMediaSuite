import mongoose from 'mongoose';

const { MONGODB_URI } = process.env;

export async function connectToMongo() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in environment');
  }
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGODB_URI, {
    dbName: process.env.MONGODB_DB || undefined,
  });
}


