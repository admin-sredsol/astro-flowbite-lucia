import { createAuthSession, getAuthorizationUrl } from "@/lib/auth/client";
import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  const { state, codeVerifier } = createAuthSession();

  // Store both state and codeVerifier in cookies (or session)
  context.cookies.set("logto_oauth_state", state, {
    path: "/",
    secure: import.meta.env.PROD,
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });
  context.cookies.set("logto_oauth_code_verifier", codeVerifier, {
    path: "/",
    secure: import.meta.env.PROD,
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  const authorizationUrl = await getAuthorizationUrl(context.url.origin, state, codeVerifier);

  return context.redirect(authorizationUrl.toString());
}
