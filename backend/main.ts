import App from "./App.ts";

Deno.serve({port: Deno.env.get("PORT") || 8000}, App.fetch)
