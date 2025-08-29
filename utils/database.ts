// src/utils/database.ts
import mongoose from "mongoose";
const URI = process.env.MONGODB_URI;
if (!URI) throw new Error("Missing MONGODB_URI");

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const cached = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cached;

export async function connectToDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    mongoose.set("bufferCommands", false);
    cached.promise = mongoose.connect(URI as string, { dbName: "share_Prompt", bufferCommands: false }).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
