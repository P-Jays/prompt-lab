// app/api/auth/[...nextauth]/route.ts  (App Router)
// or pages/api/auth/[...nextauth].ts   (Pages Router)

import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token?.sub) {
        session.user.id = token.sub;
      }
      const sessionUser = await User.findOne({
        email: session.user?.email,
      });
      if (session.user) {
        session.user.id = sessionUser._id.toString();
      }

      return session;
    },
    async signIn({ profile }) {
      try {
        // await connectToDB();

        // const userExists = await User.findOne({
        //   email: profile?.email,
        // });
        // if (!userExists) {
        //   await User.create({
        //     email: profile?.email,
        //     userName: profile?.name ,
        //     image: profile?.image,
        //   });
        // } else {
        //   return true
        // }

        await connectToDB();

        const email = profile?.email;
        if (!email) return false;

        const existing = await User.findOne({ email });
        if (existing) return true;

        // Build a base username from several fallbacks
        const base =
          profile?.name ??
          // (profile)?.given_name ??
          email.split("@")[0] ??
          "user";

        const sanitized =
          base
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace(/[^a-z0-9_]/g, "")
            .slice(0, 24) || "user";

        // Ensure uniqueness (add digits if needed)
        let username = sanitized;
        for (let i = 0; i < 10; i++) {
          const candidate =
            i === 0
              ? username
              : `${sanitized}${Math.floor(Math.random() * 10000)}`;
          const taken = await User.exists({ username: candidate });
          if (!taken) {
            username = candidate;
            break;
          }
        }

        await User.create({
          email,
          username,
          image: profile?.image,
        });
      } catch (error) {
        console.log(error);
        return false;
      }
      return true;
    },
  },
} satisfies NextAuthOptions;

const handler = NextAuth(authOptions);

// App Router:
export { handler as GET, handler as POST };

// Pages Router:
// export default handler
