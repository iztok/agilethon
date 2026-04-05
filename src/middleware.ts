import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/login(.*)", "/projector(.*)", "/api/auth(.*)"]);

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || "agiledrop.com";

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const { userId, sessionClaims } = await auth();

  if (!userId) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Domain restriction check via email in session claims
  const email = (sessionClaims?.email as string) ?? "";
  if (email && !email.endsWith(`@${ALLOWED_DOMAIN}`)) {
    const loginUrl = new URL("/login?error=AccessDenied", req.url);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
