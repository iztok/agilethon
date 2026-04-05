import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || "agiledrop.com";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email ?? "";
      if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
        return false;
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Fetch fresh user data from DB
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isAdmin: true, isOptedOut: true, vibeLevel: true },
        });
        if (dbUser) {
          (session.user as typeof session.user & { isAdmin: boolean; isOptedOut: boolean; vibeLevel: number }).isAdmin = dbUser.isAdmin;
          (session.user as typeof session.user & { isAdmin: boolean; isOptedOut: boolean; vibeLevel: number }).isOptedOut = dbUser.isOptedOut;
          (session.user as typeof session.user & { isAdmin: boolean; isOptedOut: boolean; vibeLevel: number }).vibeLevel = dbUser.vibeLevel;
        }
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // First user ever becomes admin
      const count = await prisma.user.count();
      if (count <= 1) {
        await prisma.user.update({
          where: { id: user.id! },
          data: { isAdmin: true },
        });
      }
      // Also update name and avatarUrl from Google
      if (user.email) {
        await prisma.user.update({
          where: { id: user.id! },
          data: {
            name: user.name ?? user.email.split("@")[0],
            avatarUrl: user.image ?? null,
          },
        });
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
