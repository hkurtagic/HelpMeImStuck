import App from "@backend/App.ts";

Deno.serve({ port: Number(Deno.env.get("PORT")!) || 8000 }, App.fetch);
