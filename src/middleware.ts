import { lucia } from "@/lib/auth/lucia";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;

  console.log("Session ID:", sessionId);

  if (!sessionId) {
    context.locals.user = null;
    context.locals.session = null;

    // Define protected routes
    const protectedRoutes = ["/protected", "/courses", "/dashboard", "/settings"];

    // Check if the current route is protected
    const isProtectedRoute = protectedRoutes.some((route) =>
      context.url.pathname.startsWith(route)
    );

    if (isProtectedRoute && !context.locals.user) {
      return context.redirect("/auth/login");
    }

    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);

  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);
    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  }

  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie();
    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  }

  context.locals.session = session;
  context.locals.user = user;

  console.log("User:", context.locals.user);

  return next();
});
