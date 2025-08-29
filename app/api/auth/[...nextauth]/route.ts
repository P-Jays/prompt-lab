// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import type { Types } from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OnlyId = { _id: Types.ObjectId };

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token }) {
      const email = token.email;
      if (!email) return token;

      await connectToDB();

      // Return only {_id} and tell TS exactly what that shape is
      const u = await User.findOne({ email })
        .select("_id")
        .lean<OnlyId>()
        .exec();

      if (u?._id) token.userId = u._id.toString();
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId ?? token.sub ?? undefined;
      }
      return session;
    },

    async signIn({ profile }) {
      await connectToDB();

      const email = typeof profile?.email === "string" ? profile.email : undefined;
      if (!email) return false;

      const exists = await User.exists({ email }); // -> { _id: ObjectId } | null
      if (exists) return true;

      const base = (typeof profile?.name === "string" ? profile.name : undefined) ?? email.split("@")[0] ?? "user";
      const sanitized = base.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9_]/g, "").slice(0, 24) || "user";

      let username = sanitized;
      for (let i = 0; i < 10; i++) {
        const candidate = i === 0 ? username : `${sanitized}${Math.floor(Math.random() * 10000)}`;
        if (!(await User.exists({ username: candidate }))) { username = candidate; break; }
      }

      const image =
        typeof (profile as Record<string, unknown>)?.["picture"] === "string"
          ? (profile as Record<string, string>)["picture"]
          : typeof profile?.image === "string"
          ? profile.image
          : undefined;

      await User.create({ email, username, image });
      return true;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
