import { Database } from 'jsr:@db/sqlite';
import { hash, AlgorithmName } from 'jsr:@stdext/crypto/hash';
import { dbUser } from '../model/dbtypes.ts';
import { assert } from '@std/assert';

const log_level = Number(Deno.env.get('LOG_LEVEL')!);

const db = new Database('./service/test.db');

// init if not exist
function initDB() {
    // TO DO: proper Error exposure
    if (!db.open) {
        return null;
    }

    db.exec(`
        CREATE TABLE IF NOT EXISTS departments (
            pk_department_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            visible_only_in_department INTEGER
        )
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS roles (
            pk_role_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            fk_department_id INTEGER NOT NULL,
            FOREIGN KEY (fk_department_id) REFERENCES departments (pk_department_id)
        )
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS actions (
            pk_action_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS allowed_role_actions (
            pk_role_action_assoc_id INTEGER PRIMARY KEY,
            fk_role_id INTEGER NOT NULL,
            fk_action_id INTEGER NOT NULL,
            FOREIGN KEY (fk_role_id) REFERENCES roles (pk_role_id),
            FOREIGN KEY (fk_action_id) REFERENCES actions (pk_action_id)
        )
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            pk_user_id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at INT NOT NULL
        )
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS user_extra_permissions (
            pk_user_extra_perm_id INTEGER PRIMARY KEY,
            fk_user_id TEXT NOT NULL,
            fk_action_id INTEGER NOT NULL,
            FOREIGN KEY (fk_user_id) REFERENCES users (pk_user_id),
            FOREIGN KEY (fk_action_id) REFERENCES actions (pk_action_id)
        )
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS status (
            pk_status_id INTEGER PRIMARY KEY NOT NULL,
            name TEXT NOT NULL
        )
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS tickets (
            pk_ticket_id TEXT PRIMARY KEY,
            fk_author INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            fk_status_id INTEGER NOT NULL,
            images BLOB,
            FOREIGN KEY (fk_author) REFERENCES users (pk_user_id),
            FOREIGN KEY (fk_status_id) REFERENCES status (pk_status_id)
        )
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS ticket_associations (
            pk_ticket_assoc_id INTEGER PRIMARY KEY,
            fk_ticket_id TEXT NOT NULL,
            fk_department_id INTEGER NOT NULL,
            FOREIGN KEY (fk_ticket_id) REFERENCES tickets (pk_ticket_id),
            FOREIGN KEY (fk_department_id) REFERENCES departments (pk_department_id)
        )
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS tags (
            pk_tag_id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            abbreviation TEXT,
            description TEXT,
            fk_department_id INTEGER,
            style BLOB,
            visible_only_in_department INTEGER,
            FOREIGN KEY (fk_department_id) REFERENCES departments (pk_department_id)
        )
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS events (
            pk_timeline_id INTEGER PRIMARY KEY,
            fk_author_id INTEGER NOT NULL,
            created_at INTEGER NOT NULL,
            fk_event_type INTEGER NOT NULL,
            description TEXT,
            content TEXT,
            images BLOB,
            FOREIGN KEY (fk_author_id) REFERENCES users (pk_user_id),
            FOREIGN KEY (fk_event_type) REFERENCES event_types (pk_event_id)
        )
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS event_types (
            pk_event_id INTEGER PRIMARY KEY,
            name TEXT
        )
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS user_associations (
            pk_user_assoc_id INTEGER PRIMARY KEY,
            fk_user_id TEXT NOT NULL,
            fk_department_id INTEGER NOT NULL,
            fk_role_id INTEGER NOT NULL,
            FOREIGN KEY (fk_user_id) REFERENCES users (pk_user_id),
            FOREIGN KEY (fk_department_id) REFERENCES departments (pk_department_id),
            FOREIGN KEY (fk_role_id) REFERENCES roles (pk_role_id)
        )
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS access_tokens (
            access_token TEXT NOT NULL,
            fk_user_id TEXT NOT NULL,
            FOREIGN KEY (fk_user_id) REFERENCES users (pk_user_id)
        )
    `);
    prefillDB();
}

function prefillDB() {
    // possible ticket statuses
    const init_statuses = ['OPEN', 'IN_PROGRESS', 'CLOSED'];
    // administrator values

    // TO DO: proper Error
    if (!db.open) {
        return null;
    }
    // jank type casting to satisfy type checks;
    if (_rowCounter('status') == 0) {
        const prep_status_insert = db.prepare('INSERT INTO status (name) VALUES (?)');
        init_statuses.forEach((el) => {
            prep_status_insert.run(el);
        });
        prep_status_insert.finalize();
    }
    // only checks for empty table, possible cause for failure if db is initialized elswhere
    if (_rowCounter('users') == 0) {
        const h = hash(AlgorithmName.Argon2, Deno.env.get('DB_DEFAULT_ADMIN_PASSWORD')!);
        addUser(Deno.env.get('DB_DEFAULT_ADMIN_USERNAME')!, h);
    }
}
//#region User CRUD
/**
 * Adds user to the Database
 *
 * @param username - Username of the user
 * @param hashed_password - Hashed password of the user
 * @returns Nothing or Error
 *
 */
function addUser(username: string, hashed_password: string): number | Error {
    try {
        return db.exec(
            'INSERT INTO users (pk_user_id,name,password,created_at) VALUES (?,?,?,?)',
            crypto.randomUUID(),
            username,
            hashed_password,
            Date.now()
        );
    } catch (error) {
        assertIsError(error);
        if (log_level > 0) {
            console.log('Database Error in addUser: ' + error.message);
        }
        return error;
    }
}
// idk if needed
function getUsers(): dbUser[] {
    return db.prepare('SELECT * FROM users').all();
}
function getUserByUsername(username: string): dbUser[] | Error {
    try {
        return db.prepare('SELECT * FROM users WHERE name = :username').all(username);
    } catch (error) {
        assertIsError(error);
        if (log_level > 0) {
            console.log('Database Error in getUserById: ' + error.message);
        }
        return error;
    }
}
function getUserById(userID: string): dbUser[] | Error {
    try {
        return db.prepare('SELECT * FROM users WHERE pk_user_id = :userID').all(userID);
    } catch (error) {
        assertIsError(error);
        if (log_level > 0) {
            console.log('Database Error in getUserById: ' + error.message);
        }
        return error;
    }
}

function updateUserUsernameById(userID: string, new_username: string): number | Error {
    try {
        return db
            .prepare('UPDATE users SET name = :new_username WHERE pk_user_id = :userID')
            .run(new_username, userID);
    } catch (error) {
        assertIsError(error);
        if (log_level > 0) {
            console.log('Database Error in updateUserUsernameById: ' + error.message);
        }
        return error;
    }
}
function updateUserPasswordById(userID: string, new_password: string): number | Error {
    try {
        return db
            .prepare('UPDATE users SET password = :new_password WHERE pk_user_id = :userID')
            .run(new_password, userID);
    } catch (error) {
        assertIsError(error);
        if (log_level > 0) {
            console.log('Database Error in updateUserPasswordById: ' + error.message);
        }
        return error;
    }
}

function deleteUserById(userID: string): number | Error {
    try {
        const exec_rows = db.prepare('DELETE FROM User pk_user_id = :userID').run(userID);
        return exec_rows;
    } catch (error) {
        assertIsError(error);
        if (log_level > 0) {
            console.log('Database Error in deleteUserById: ' + error.message);
        }
        return error;
    }
}

//#endregion User CRUD

// sadly no parameter binding for tablename possible and therefore string concat as it will not be used outside
function _rowCounter(tablename: string): number {
    const query = 'SELECT count(*) as count FROM ' + tablename;
    return Object.values(db.prepare(query).get()!).at(0) as number;
}

function closeDB() {
    if (db.open) {
        db.close();
    }
}

function assertIsError(error: unknown): asserts error is Error {
    assert(error instanceof Error);
}

export default {
    db,
    initDB,
    closeDB,
    addUser,
    getUsers,
    getUserById,
    getUserByUsername,
    updateUserUsernameById,
    updateUserPasswordById,
    deleteUserById,
};
