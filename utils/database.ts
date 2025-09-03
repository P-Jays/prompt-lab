// src/utils/database.ts
import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var _mongoose:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

// Create a global cache (survives hot reloads in dev)
const cached = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cached;

export async function connectToDB() {
  // Reuse existing connection
  if (cached.conn) return cached.conn;

  // Read env and validate only when we actually try to connect
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    // Do NOT throw at module top-level; throw here at runtime
    throw new Error("Missing MONGODB_URI");
  }

  if (!cached.promise) {
    // Optional but recommended flags
    mongoose.set("strictQuery", true);
    mongoose.set("bufferCommands", false);

    cached.promise = mongoose
      .connect(uri, {
        dbName: "share_Prompt", 
        bufferCommands: false,
      })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
