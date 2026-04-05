import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAdmin: boolean;
  isOptedOut: boolean;
  vibeLevel: number;
}

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || "agiledrop.com";

/**
 * Returns the current user from our DB, creating them on first login.
 * Returns null if not authenticated or domain is not allowed.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  // Find existing user in DB by Clerk ID
  let dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });

  if (!dbUser) {
    // First login — provision user from Clerk data
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) return null;

    const name =
      clerkUser.fullName ||
      clerkUser.firstName ||
      email.split("@")[0] ||
      "Anonymous";

    // First user becomes admin
    const count = await prisma.user.count();
    const isAdmin = count === 0;

    dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        name,
        avatarUrl: clerkUser.imageUrl ?? null,
        isAdmin,
      },
    });
  }

  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    image: dbUser.avatarUrl,
    isAdmin: dbUser.isAdmin,
    isOptedOut: dbUser.isOptedOut,
    vibeLevel: dbUser.vibeLevel,
  };
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) throw new Response("Unauthorized", { status: 401 });
  if (!user.isAdmin) throw new Response("Forbidden", { status: 403 });
  return user;
}
