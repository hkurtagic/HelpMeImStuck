import App from "@backend/App.ts";
import dbSetup, { dropTablesAndSetConstraints } from "@backend/service/dbSetup.ts";
import { prefillDB, setAdminEnv } from "@backend/service/dbPrefill.ts";
import User from "@backend/model/User.ts";

//check if all neccessary env values exist

try {
    const missing_env_values: string[] = [];
    if (!Deno.env.has("PORT")) missing_env_values.push("PORT");
    if (!Deno.env.has("JWT_SECRET")) missing_env_values.push("JWT_SECRET");
    if (!Deno.env.has("JWT_REFRESH_SECRET")) missing_env_values.push("JWT_REFRESH_SECRET");
    if (!Deno.env.has("JWT_ACCESS_EXPIRY")) missing_env_values.push("JWT_ACCESS_EXPIRY");
    if (!Deno.env.has("JWT_REFRESH_EXPIRY")) missing_env_values.push("JWT_REFRESH_EXPIRY");
    if (missing_env_values.length) {
        throw new Error(
            "Following enviroment variables are missing:\n" + missing_env_values.join("\n"),
        );
    }

    // this value controls if the database should be wiped on every restart
    let drop_db_tables = true;
    await dbSetup(drop_db_tables);
    // reset db if no user exists
    if (!(await User.findAndCountAll()).count) {
        await dropTablesAndSetConstraints();
        drop_db_tables = true;
    }
    if (drop_db_tables) {
        await prefillDB();
    } else {
        await setAdminEnv();
    }
    const missing_prefill_values: string[] = [];
    if (!Deno.env.has("ADMIN_DEPARTMENT_ID")) missing_prefill_values.push("ADMIN_DEPARTMENT_ID");
    if (!Deno.env.has("ADMIN_ROLE_ID")) missing_prefill_values.push("ADMIN_ROLE_ID");
    if (!Deno.env.has("ADMIN_USER_ID")) missing_prefill_values.push("ADMIN_USER_ID");
    if (missing_prefill_values.length) {
        throw new Error(
            "Administrator properties are missing, please reset the database:\n" +
                missing_prefill_values.join("\n"),
        );
    }

    console.log("Database initialized");
    Deno.serve({ port: Number(Deno.env.get("PORT")!) || 8000 }, App.fetch);
} catch (error) {
    console.error(error);
}
