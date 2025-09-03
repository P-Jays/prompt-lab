/* eslint-disable @typescript-eslint/no-explicit-any */
import User from "@/models/user";

const MIN = 8;
const MAX = 20;

function sanitizeBase(input: string): string {
  let s = input.toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (!/^[a-z]/.test(s)) s = `u${s}`;
  if (s.length < MIN) s = s.padEnd(MIN, "0");
  return s.slice(0, MAX);
}

export type UserIdImage = {
  _id: { toString(): string };
  image?: string | null;
  username?: string | null;
  displayName?: string | null;
};

export async function findUserIdAndImageByEmail(email: string) {
  return User.findOne({ email })
    .select("_id image username displayName")
    .lean<UserIdImage>()
    .exec();
}

function baseFromNameEmail(name?: string | null, email?: string): string {
  const nameAscii = name?.trim();
  if (nameAscii) return sanitizeBase(nameAscii);
  const local = email?.split("@")[0] ?? "user";
  return sanitizeBase(local);
}

async function generateUniqueUsername(base: string): Promise<string> {
  for (let i = 0; i < 50; i++) {
    const suffix =
      i === 0 ? "" : String(Math.floor(Math.random() * 1e9)).padStart(4, "0");
    const candidate = (base + suffix).slice(0, MAX);
    const exists = await User.exists({ username: candidate });
    if (!exists) return candidate;
  }
  throw new Error("Failed to generate unique username after 50 attempts");
}

export async function ensureUserWithImage(opts: {
  email: string;
  name?: string | null; // provider name (Unicode ok)
  image?: string | null;
}) {
  const existing = await findUserIdAndImageByEmail(opts.email);

  if (!existing) {
    const base = baseFromNameEmail(opts.name ?? null, opts.email);
    const username = await generateUniqueUsername(base);
    const displayName =
      (opts.name && opts.name.trim()) || (opts.email?.split("@")[0] ?? "User");

    try {
      await User.create({
        email: opts.email,
        username, // ASCII handle
        displayName, // Unicode display name
        image: opts.image ?? null,
      });
      return { created: true, backfilled: false };
    } catch (e: any) {
      if (e?.code === 11000 && /username/.test(e?.message ?? "")) {
        const retry = await generateUniqueUsername(base);
        await User.create({
          email: opts.email,
          username: retry,
          displayName,
          image: opts.image ?? null,
        });
        return { created: true, backfilled: false };
      }
      throw e;
    }
  }

  // backfill image
  if (!existing.image && opts.image) {
    await User.updateOne(
      { email: opts.email },
      { $set: { image: opts.image } }
    );
    return { created: false, backfilled: true };
  }

  // optional: backfill displayName if missing
  if (!existing.displayName && (opts.name || opts.email)) {
    const displayName =
      (opts.name && opts.name.trim()) || (opts.email?.split("@")[0] ?? "User");
    await User.updateOne({ email: opts.email }, { $set: { displayName } });
  }

  return { created: false, backfilled: false };
}
