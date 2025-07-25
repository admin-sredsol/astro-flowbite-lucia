import { lucia } from "@/lib/auth/lucia";
import type { APIContext } from "astro";
import { generateSignOutUri } from "@logto/js";

// Remove the trailing slash from the Logto endpoint URL if it exists
const endpoint = import.meta.env.LOGTO_ENDPOINT;
export const logtoEndpoint = endpoint?.endsWith("/")
  ? endpoint.slice(0, -1)
  : endpoint;

// Get the Logto access token for API requests
export async function getLogtoAccessToken() {
  return await fetch(`${logtoEndpoint}/oidc/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${import.meta.env.LOGTO_M2M_APP_ID}:${
          import.meta.env.LOGTO_M2M_APP_SECRET
        }`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      resource: `${logtoEndpoint}/api`,
      scope: "all",
    }).toString(),
  })
    .then((response) => response.json())
    .then((data) => data.access_token);
}

export async function logout(context: APIContext) {
  if (!context.locals.session) {
    console.warn("No session found during logout.");
    return new Response(null, {
      status: 401,
    });
  }

  // Validate configuration
  if (!logtoEndpoint || !import.meta.env.LOGTO_APP_ID) {
    console.error("Logto endpoint or client ID is not defined.");
    return new Response("Configuration error", { status: 500 });
  }

  // Invalidate session
  try {
    await lucia.invalidateSession(context.locals.session.id);
  } catch (error) {
    console.error("Failed to invalidate session:", error);
    return new Response("Failed to log out", { status: 500 });
  }

  // Clear session cookie
  const sessionCookie = lucia.createBlankSessionCookie();
  context.cookies.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  // Generate sign-out URL
  const postLogoutRedirectUri = context.url.origin || "/";
  const signoutUrl = generateSignOutUri({
    endSessionEndpoint: `${logtoEndpoint}/oidc/session/end`,
    clientId: import.meta.env.LOGTO_APP_ID,
    postLogoutRedirectUri,
  });

  return context.redirect(signoutUrl);
}

export async function getLogtoUser(
  logtoUserId: string | undefined,
  token: string
) {
  return await fetch(`${logtoEndpoint}/api/users/${logtoUserId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => data);
}
