import App from "@backend/App.ts";
import dbSetup from "@backend/service/dbSetup.ts";
import { prefillDB } from "@backend/service/dbPrefill.ts";

try {
	await dbSetup();
	await prefillDB();
	console.log("Database initialized");
	Deno.serve({ port: Number(Deno.env.get("PORT")!) || 8000 }, App.fetch);
} catch (error) {
	console.error(error);
}
