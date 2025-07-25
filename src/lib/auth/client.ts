import { OAuth2Client, generateState, generateCodeVerifier } from "oslo/oauth2";
import { logtoEndpoint } from "@/lib/auth/utils";
import { withReservedScopes } from "@logto/js";

const clientId = import.meta.env.LOGTO_APP_ID;
const authorizeEndpoint = `${logtoEndpoint}/oidc/auth`;
const tokenEndpoint = `${logtoEndpoint}/oidc/token`;

function assertEnv(value: unknown, name: string) {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
}

export function getLogtoClient(baseUrl: string) {
  assertEnv(clientId, "LOGTO_APP_ID");
  assertEnv(baseUrl, "BASE_URL");
  return new OAuth2Client(clientId, authorizeEndpoint, tokenEndpoint, {
    redirectURI: `${baseUrl}/callback`,
  });
}

// Generate per-request/session and store in session/cookie
export function createAuthSession() {
  return {
    state: generateState(),
    codeVerifier: generateCodeVerifier(),
  };
}

// Usage: 
// const { state, codeVerifier } = createAuthSession();
// Store these in the user's session/cookie for later verification

export async function getAuthorizationUrl(baseUrl: string, state: string, codeVerifier: string) {
  assertEnv(clientId, "LOGTO_APP_ID");
  assertEnv(baseUrl, "BASE_URL");
  return await getLogtoClient(baseUrl).createAuthorizationURL({
    state,
    scopes: withReservedScopes().split(" "),
    codeVerifier,
  });
}
