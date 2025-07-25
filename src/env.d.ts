/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
declare namespace App {
  interface Locals {
    session: import("lucia").Session | null;
    user: import("lucia").User | null;
  }
  interface ImportMetaEnv {
    readonly CONTENT_API_KEY: string;
    readonly GHOST_URL: string;
  }
}
