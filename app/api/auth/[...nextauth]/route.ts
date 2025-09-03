/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDB } from "@/utils/database";
import { log } from "@/lib/logger";
import { ensureUserWithImage, findUserIdAndImageByEmail } from "@/lib/userService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getGoogleImage(profile: unknown): string | null {
  const pic = (profile as any)?.picture;
  const img = (profile as any)?.image;
  const chosen = typeof pic === "string" ? pic : typeof img === "string" ? img : null;
  return chosen && /^https?:\/\//.test(chosen) ? chosen : null;
}

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: { strategy: "jwt" },
  debug: true,
  callbacks: {
    async signIn({ profile }) {
      await connectToDB();
      const email = typeof profile?.email === "string" ? profile.email : undefined;
      if (!email) {
        log.warn("signIn: missing email in provider profile");
        return false;
      }
      const image = getGoogleImage(profile);
      const name = typeof profile?.name === "string" ? profile.name : null;
      try {
        const res = await ensureUserWithImage({ email, name, image });
        if (res.created) log.info("signIn: user created", { email });
        if (res.backfilled) log.info("signIn: image backfilled", { email });
        return true;
      } catch (e) {
        log.error("signIn: DB error", e);
        return false;
      }
    },

    async jwt({ token }) {
      const email = token.email;
      if (!email) return token;
      await connectToDB();
      try {
        const u = await findUserIdAndImageByEmail(email);
        if (u?._id) token.userId = u._id.toString();
        token.picture = (u?.image ?? token.picture ?? null) as any;
      } catch (e) {
        log.error("jwt: DB read failed", e);
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId ?? token.sub ?? undefined;
        session.user.image = token.picture ?? session.user.image ?? null;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
