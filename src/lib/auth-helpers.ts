import { auth } from "./auth";

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAdmin: boolean;
  isOptedOut: boolean;
  vibeLevel: number;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (session as any)?.user;
  if (!user) return null;
  return {
    id: user.id ?? "",
    name: user.name,
    email: user.email,
    image: user.image,
    isAdmin: user.isAdmin ?? false,
    isOptedOut: user.isOptedOut ?? false,
    vibeLevel: user.vibeLevel ?? 3,
  };
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) throw new Response("Unauthorized", { status: 401 });
  if (!user.isAdmin) throw new Response("Forbidden", { status: 403 });
  return user;
}
