
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
  throw new Error("❌ Please define the MONGO_URI environment variable inside .env.local");
}

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, {
        dbName: "slack", 
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
