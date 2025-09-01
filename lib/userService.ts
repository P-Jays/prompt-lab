/* eslint-disable @typescript-eslint/no-explicit-any */
import User from "@/models/user";

const MIN = 8;
const MAX = 20;

function sanitizeBase(input: string): string {
  let s = input.toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (!/^[a-z]/.test(s)) s = `u${s}`; // must start with a letter
  if (s.length < MIN) s = s.padEnd(MIN, "0"); // pad to min length
  return s.slice(0, MAX); // cap at max length
}

/** Narrowed shape for lean() */
export type UserIdImage = {
  _id: { toString(): string };
  image?: string | null;
  username?: string | null;
};

/** Read minimal fields needed by auth flow */
export async function findUserIdAndImageByEmail(email: string) {
  return User.findOne({ email })
    .select("_id image username")
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
  // try base, then base+random until unique
  for (let i = 0; i < 50; i++) {
    const suffix =
      i === 0 ? "" : String(Math.floor(Math.random() * 1e9)).padStart(4, "0");
    const candidate = (base + suffix).slice(0, MAX); // keep within 20
    const exists = await User.exists({ username: candidate });
    if (!exists) return candidate;
  }
  throw new Error("Failed to generate unique username after 50 attempts");
}

export async function ensureUserWithImage(opts: {
  email: string;
  name?: string | null;
  image?: string | null;
}) {
  // const existing = await User.findOne({ email: opts.email })
  //   .select("_id image username")
  //   .lean<{ _id: any; image?: string | null; username?: string | null }>();

  const existing = await findUserIdAndImageByEmail(opts.email);

  if (!existing) {
    const base = baseFromNameEmail(opts.name ?? null, opts.email);
    const username = await generateUniqueUsername(base);

    // retry once if DB race triggers E11000
    try {
      await User.create({
        email: opts.email,
        username,
        image: opts.image ?? null,
      });
      return { created: true, backfilled: false };
    } catch (e: any) {
      if (e?.code === 11000 && /username/.test(e?.message ?? "")) {
        const retry = await generateUniqueUsername(base);
        await User.create({
          email: opts.email,
          username: retry,
          image: opts.image ?? null,
        });
        return { created: true, backfilled: false };
      }
      throw e;
    }
  }

  if (!existing.image && opts.image) {
    await User.updateOne(
      { email: opts.email },
      { $set: { image: opts.image } }
    );
    return { created: false, backfilled: true };
  }

  return { created: false, backfilled: false };
}
