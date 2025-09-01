import User from "@/models/user";

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

/** Create or backfill user image; ensures one user per email */
export async function ensureUserWithImage(opts: {
  email: string;
  name?: string | null;
  image?: string | null;
}) {
  const existing = await findUserIdAndImageByEmail(opts.email);
  if (!existing) {
    const base = (
      opts.name ??
      opts.email.split("@")[0] ??
      "user"
    ).toLowerCase();
    const sanitized =
      base
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 24) || "user";

    // naive uniqueness loop for demo; replace with DB-level unique + retry for prod
    let username = sanitized;
    for (let i = 0; i < 10; i++) {
      const candidate =
        i === 0 ? username : `${sanitized}${Math.floor(Math.random() * 10000)}`;
      const exists = await User.exists({ username: candidate });
      if (!exists) {
        username = candidate;
        break;
      }
    }

    await User.create({
      email: opts.email,
      username,
      image: opts.image ?? null,
    });
    return { created: true, backfilled: false };
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
