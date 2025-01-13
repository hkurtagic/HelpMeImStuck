import App from "@backend/App.ts";
import setupDb from "@backend/service/setupDb.ts";

try {
  await setupDb();
  console.log("Database initialized");
  Deno.serve({ port: Number(Deno.env.get("PORT")!) || 8000 }, App.fetch);
} catch (error) {
  console.error(error);
}
