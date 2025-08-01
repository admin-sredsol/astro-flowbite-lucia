import { Lucia } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "@/lib/db";
import { sessionTable, userTable } from "@/lib/db/schema";

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: import.meta.env.PROD,
      sameSite: "lax",
      path: "/",
    },
  },
  // sessionExpiresIn: 60 * 60 * 24 * 30, // Optional: 30 days
  getUserAttributes: (attributes) => ({
    logtoId: attributes.logtoId,
    // email: attributes.email, // Add if needed
    // name: attributes.name,   // Add if needed
  }),
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  logtoId: string;
}
