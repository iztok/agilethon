import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      isOptedOut: boolean;
      vibeLevel: number;
    } & DefaultSession["user"];
  }
}
