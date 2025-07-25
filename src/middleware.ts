import { lucia } from "@/lib/auth/lucia";
interface Context {
  cookies: {
    get: (name: string) => { value?: string | null } | undefined;
    set: (name: string, value: string, attributes?: Record<string, any>) => void;
  };
  url: {
    pathname: string;
  };
  locals: {
    user: any;
    session: any;
  };
  redirect: (url: string) => Promise<Response> | Response;
}

type NextFunction = () => Promise<Response> | Response;

export const onRequest = async (context: Context, next: NextFunction): Promise<Response> => {
  const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;

  console.log("Session ID:", sessionId);

  // Skip session validation for callback route
  if (context.url.pathname.startsWith("/callback")) {
    return next();
  }

  if (!sessionId) {
    context.locals.user = null;
    context.locals.session = null;

    // Define protected routes
    const protectedRoutes = ["/protected", "/dashboard", "/settings"];

    // Check if the current route is protected
    const isProtectedRoute = protectedRoutes.some((route) =>
      context.url.pathname.startsWith(route)
    );

    if (isProtectedRoute && !context.locals.user) {
      return context.redirect("/auth/login");
    }

    return next();
  }

  let session: any, user: any;
  try {
    ({ session, user } = await lucia.validateSession(sessionId));
  } catch (error) {
    console.error("Session validation error:", error);
    context.locals.session = null;
    context.locals.user = null;
    return next();
  }

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
}
