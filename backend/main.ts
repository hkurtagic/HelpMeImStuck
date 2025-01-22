import App from "@backend/App.ts";
import dbSetup, { dropTablesAndSetConstraints } from "@backend/service/dbSetup.ts";
import { prefillDB } from "@backend/service/dbPrefill.ts";
import User from "@backend/model/User.ts";

try {
    let drop_db_tables = false;
    await dbSetup(drop_db_tables);
    // reset db if no user exists
    if (!(await User.findAndCountAll()).count) {
        await dropTablesAndSetConstraints();
        drop_db_tables = true;
    }
    if (drop_db_tables) {
        await prefillDB();
    }
    console.log("Database initialized");
    Deno.serve({ port: Number(Deno.env.get("PORT")!) || 8000 }, App.fetch);
} catch (error) {
    console.error(error);
}
