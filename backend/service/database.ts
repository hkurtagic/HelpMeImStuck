import {Database} from "jsr:@db/sqlite";
import {AlgorithmName, hash} from "jsr:@stdext/crypto/hash";
import {DbAction, DbDepartments, DbRole, DbUser,} from "@backend/model/dbtypes.ts";
import {assert} from "@std/assert";

const db_conn = new Database("./test.db");

// init if not exist
function initDB() {
  // TO DO: proper Error exposure
  if (!db_conn.open) {
    return null;
  }

  db_conn.exec(`
        CREATE TABLE IF NOT EXISTS departments
        (
            pk_department_id
            INTEGER
            PRIMARY
            KEY
            AUTOINCREMENT,
            department_name
            TEXT
            NOT
            NULL
            UNIQUE,
            description
            TEXT
        )
    `);
  db_conn.exec(`
        CREATE TABLE IF NOT EXISTS roles
        (
            pk_role_id
            INTEGER
            PRIMARY
            KEY
            AUTOINCREMENT,
            role_name
            TEXT
            NOT
            NULL,
            description
            TEXT,
            fk_department_id
            INTEGER
            NOT
            NULL,
            FOREIGN
            KEY
        (
            fk_department_id
        ) REFERENCES departments
        (
            pk_department_id
        ) ON DELETE CASCADE
            )
    `);
  db_conn.exec(`
        CREATE TABLE IF NOT EXISTS actions
        (
            pk_action_id
            INTEGER
            PRIMARY
            KEY
            AUTOINCREMENT,
            action_name
            TEXT
            NOT
            NULL
        )
    `);
  db_conn.exec(`
        CREATE TABLE IF NOT EXISTS allowed_role_actions
        (
            pk_role_action_assoc_id
            INTEGER
            PRIMARY
            KEY,
            fk_role_id
            INTEGER
            NOT
            NULL,
            fk_action_id
            INTEGER
            NOT
            NULL,
            FOREIGN
            KEY
        (
            fk_role_id
        ) REFERENCES roles
        (
            pk_role_id
        ) ON DELETE CASCADE,
            FOREIGN KEY
        (
            fk_action_id
        ) REFERENCES actions
        (
            pk_action_id
        )
          ON DELETE CASCADE
            )
    `);
  db_conn.exec(`
        CREATE TABLE IF NOT EXISTS users
        (
            pk_user_id
            TEXT
            PRIMARY
            KEY
            NOT
            NULL,
            user_name
            TEXT
            NOT
            NULL
            UNIQUE,
            password_hash
            TEXT
            NOT
            NULL,
            created_at
            INTEGER
            NOT
            NULL,
            updated_at
            INTEGER
        )
    `);
  db_conn.exec(`
        CREATE TABLE IF NOT EXISTS user_extra_permissions
        (
            pk_user_extra_perm_id
            INTEGER
            PRIMARY
            KEY,
            fk_user_id
            TEXT
            NOT
            NULL,
            fk_action_id
            INTEGER
            NOT
            NULL,
            FOREIGN
            KEY
        (
            fk_user_id
        ) REFERENCES users
        (
            pk_user_id
        ) ON DELETE CASCADE,
            FOREIGN KEY
        (
            fk_action_id
        ) REFERENCES actions
        (
            pk_action_id
        )
          ON DELETE CASCADE
            )
    `);
  db_conn.exec(`
        CREATE TABLE IF NOT EXISTS status
        (
            pk_status_id
            INTEGER
            PRIMARY
            KEY
            NOT
            NULL,
            status_name
            TEXT
            NOT
            NULL
        )
    `);
  db_conn.exec(`
        CREATE TABLE IF NOT EXISTS tickets
        (
            pk_ticket_id
            TEXT
            PRIMARY
            KEY,
            fk_author
            INTEGER
            NOT
            NULL,
            title
            TEXT
            NOT
            NULL,
            description
            TEXT
            NOT
            NULL,
            fk_status_id
            INTEGER
            NOT
            NULL,
            images
            BLOB,
            created_at
            INTEGER
            NOT
            NULL,
            FOREIGN
            KEY
        (
            fk_author
        ) REFERENCES users
        (
            pk_user_id
        ) ON DELETE SET NULL,
            FOREIGN KEY
        (
            fk_status_id
        ) REFERENCES status
        (
            pk_status_id
        )
          ON DELETE SET NULL
            )
    `);
  db_conn.exec(`
        CREATE TABLE IF NOT EXISTS ticket_associations
        (
            pk_ticket_assoc_id
            INTEGER
            PRIMARY
            KEY,
            fk_ticket_id
            TEXT
            NOT
            NULL,
            fk_department_id
            INTEGER
            NOT
            NULL,
            FOREIGN
            KEY
        (
            fk_ticket_id
        ) REFERENCES tickets
        (
            pk_ticket_id
        ) ON DELETE CASCADE,
            FOREIGN KEY
        (
            fk_department_id
        ) REFERENCES departments
        (
            pk_department_id
        )
          ON DELETE CASCADE
            )
    `);
  db_conn.exec(`
        CREATE TABLE IF NOT EXISTS tags
        (
            pk_tag_id
            INTEGER
            PRIMARY
            KEY,
            tag_name
            TEXT
            NOT
            NULL,
            abbreviation
            TEXT,
            description
            TEXT,
            fk_department_id
            INTEGER
            NOT
            NULL,
            style
            TEXT,
            FOREIGN
            KEY
        (
            fk_department_id
        ) REFERENCES departments
        (
            pk_department_id
        ) ON DELETE CASCADE
            )
    `);
  db_conn.exec(`
        CREATE TABLE IF NOT EXISTS tag_associations
        (
            pk_tag_assoc_id
            INTEGER
            PRIMARY
            KEY,
            fk_tag_id
            INTEGER
            NOT
            NULL,
            fk_ticket_id
            TEXT
            NOT
            NULL,
            FOREIGN
            KEY
        (
            fk_tag_id
        ) REFERENCES tags
        (
            pk_tag_id
        ) ON DELETE CASCADE,
            FOREIGN KEY
        (
            fk_ticket_id
        ) REFERENCES tickets
        (
            pk_ticket_id
        )
          ON DELETE CASCADE
            )
    `);
  db_conn.exec(`
        CREATE TABLE IF NOT EXISTS event_types
        (
            pk_event_type_id
            INTEGER
            PRIMARY
            KEY,
            event_type_name
            TEXT
        )
    `);
  db_conn.exec(`
        CREATE TABLE IF NOT EXISTS events
        (
            pk_event_id
            INTEGER
            PRIMARY
            KEY,
            fk_ticket_id
            TEXT
            NOT
            NULL,
            fk_author_id
            TEXT
            NOT
            NULL,
            created_at
            INTEGER
            NOT
            NULL,
            fk_event_type
            INTEGER
            NOT
            NULL,
            description
            TEXT,
            content
            TEXT,
            images
            BLOB,
            FOREIGN
            KEY
        (
            fk_ticket_id
        ) REFERENCES tickets
        (
            pk_ticket_id
        ) ON DELETE CASCADE,
            FOREIGN KEY
        (
            fk_author_id
        ) REFERENCES users
        (
            pk_user_id
        )
          ON DELETE SET NULL,
            FOREIGN KEY
        (
            fk_event_type
        ) REFERENCES event_types
        (
            pk_event_type_id
        )
          ON DELETE SET NULL
            )
    `);
  db_conn.exec(`
        CREATE TABLE IF NOT EXISTS user_associations
        (
            pk_user_assoc_id
            INTEGER
            PRIMARY
            KEY,
            fk_user_id
            TEXT
            NOT
            NULL,
            fk_department_id
            INTEGER
            NOT
            NULL,
            fk_role_id
            INTEGER
            NOT
            NULL,
            FOREIGN
            KEY
        (
            fk_user_id
        ) REFERENCES users
        (
            pk_user_id
        ) ON DELETE CASCADE,
            FOREIGN KEY
        (
            fk_department_id
        ) REFERENCES departments
        (
            pk_department_id
        )
          ON DELETE CASCADE,
            FOREIGN KEY
        (
            fk_role_id
        ) REFERENCES roles
        (
            pk_role_id
        )
            )
    `);
  db_conn.exec(`
        CREATE TABLE IF NOT EXISTS access_tokens
        (
            access_token
            TEXT
            NOT
            NULL,
            fk_user_id
            TEXT
            NOT
            NULL,
            FOREIGN
            KEY
        (
            fk_user_id
        ) REFERENCES users
        (
            pk_user_id
        ) ON DELETE CASCADE
            )
    `);
  prefillDB();
}

function prefillDB() {
  // possible ticket statuses
  const init_statuses = ["OPEN", "IN_PROGRESS", "CLOSED"];
  const init_event_types = ["ACTION", "COMMENT"];
  // add department
  const admin_dept = "System_Administration";
  const admin_role = {
    role_name: "Administrators",
    department: "System_Administration",
  };

  // TO DO: proper Error
  if (!db_conn.open) {
    return null;
  }
  // only checks for empty table, possible cause for failure if db is initialized elswhere
  if (_rowCounter("departments") == 0) {
    addDepartment(admin_dept);
  }
  if (_rowCounter("roles") == 0) {
    const h = hash(
      AlgorithmName.Argon2,
      Deno.env.get("DB_DEFAULT_ADMIN_PASSWORD")!,
    );
    addUser(Deno.env.get("DB_DEFAULT_ADMIN_USERNAME")!, h);
  }
  if (_rowCounter("users") == 0) {
    const h = hash(
      AlgorithmName.Argon2,
      Deno.env.get("DB_DEFAULT_ADMIN_PASSWORD")!,
    );
    addUser(Deno.env.get("DB_DEFAULT_ADMIN_USERNAME")!, h);
  }
  if (_rowCounter("status") == 0) {
    const prep_status_insert = db_conn.prepare(
      "INSERT INTO status (status_name) VALUES (?)",
    );
    init_statuses.forEach((el) => {
      prep_status_insert.run(el);
    });
    prep_status_insert.finalize();
  }
  if (_rowCounter("event_types") == 0) {
    const prep_event_type_insert = db_conn.prepare(
      "INSERT INTO event_types (event_type_name) VALUES (?)",
    );
    init_event_types.forEach((el) => {
      prep_event_type_insert.run(el);
    });
    prep_event_type_insert.finalize();
  }
}

//#region Tokens
/*
function addAccessToken(access_token: string, user_id: string) {
    try {
        return db_conn.exec(
            'INSERT INTO access_tokens (access_token,fk_user_id) VALUES (?,?)',
            access_token,
            user_id
        );
    } catch (error) {
        assertIsError(error);
        return error;
    }
}

function getAccessTokenByUserId(user_id: string) {
    return db_conn
        .prepare('SELECT access_token FROM access_tokens WHERE fk_user_id = ?')
        .get(user_id);
}

function updateAccessTokenByUserId(access_token: string, user_id: string) {
    return db_conn.exec(
        'UPDATE access_tokens SET access_token= :access_token WHERE fk_user_id = :user_id',
        access_token,
        user_id
    );
}

function deleteAccessToken(user_id: string) {
    try {
        return db_conn.exec('DELETE FROM access_tokens WHERE fk_user_id = :user_id', user_id);
    } catch (error) {
        assertIsError(error);
        return error;
    }
}
*/
//#endregion Tokens

//#region User CRUD
function addUser(username: string, password_hash: string): number | Error {
  try {
    return db_conn.exec(
      "INSERT INTO users (pk_user_id,user_name,password_hash,created_at) VALUES (?,?,?,?)",
      crypto.randomUUID(),
      username,
      password_hash,
      Date.now(),
    );
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

// idk if needed
function getUsers(): DbUser[] {
  return db_conn.prepare("SELECT * FROM users").all();
}

function getUserByUsername(username: string): DbUser | Error | undefined {
  try {
    return db_conn.prepare("SELECT * FROM users WHERE user_name = :username")
      .get(username);
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

function getUserById(user_id: string): DbUser | Error | undefined {
  try {
    return db_conn.prepare("SELECT * FROM users WHERE pk_user_id = :user_id")
      .get(user_id);
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

function updateUserUsernameById(
  user_id: string,
  new_username: string,
): number | Error {
  try {
    const timestamp = Date.now();
    return db_conn
      .prepare(
        "UPDATE users SET user_name = :new_username, updated_at = :timestamp WHERE pk_user_id = :user_id",
      )
      .run(new_username, timestamp, user_id);
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

function updateUserPasswordById(
  user_id: string,
  new_password_hash: string,
): number | Error {
  try {
    const timestamp = Date.now();
    return db_conn
      .prepare(
        "UPDATE users SET password_hash = :new_password_hash, updated_at = :timestamp WHERE pk_user_id = :user_id",
      )
      .run(new_password_hash, timestamp, user_id);
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

function deleteUserById(user_id: string): number | Error {
  try {
    return db_conn.prepare("DELETE FROM users WHERE pk_user_id = :user_id").run(
      user_id,
    );
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

//#endregion User CRUD

//#region Action CRUD
function addAction(action_name: string): number | Error {
  try {
    return db_conn.exec(
      "INSERT INTO actions (action_name) VALUES (?)",
      action_name,
    );
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

function getActionByName(action_name: string): DbAction | Error | undefined {
  return db_conn.prepare("SELECT * FROM actions WHERE action_name= ?").get(
    action_name,
  );
}

function getActionById(action_id: string): DbAction | Error | undefined {
  return db_conn.prepare("SELECT * FROM actions WHERE pk_actions_id= ?").get(
    action_id,
  );
}

function deleteAction(action_id: number): number | Error {
  try {
    return db_conn.exec("DELETE FROM actions WHERE pk_action_id= ?", action_id);
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

//#endregion Action CRUD

//#region Department CRUD
function addDepartment(
  department_name: string,
  description?: string,
): number | Error {
  try {
    if (typeof description !== "undefined") {
      return db_conn.exec(
        "INSERT INTO departments (department_name, description) VALUES (?,?)",
        department_name,
        description,
      );
    }
    return db_conn.exec(
      "INSERT INTO departments (department_name) VALUES (?)",
      department_name,
    );
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

function getDepartments(): DbDepartments[] | Error {
  return db_conn.prepare("SELECT * FROM departments").all();
}

function getDepartmentById(
  department_id: number,
): DbDepartments | Error | undefined {
  return db_conn
    .prepare(
      "SELECT * FROM departments WHERE pk_department_id = :department_id",
    )
    .get(department_id);
}

function deleteDepartment(department_id: number) {
  try {
    return db_conn
      .prepare(
        "DELETE FROM departments WHERE pk_department_id = :department_id",
      )
      .run(department_id);
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

//#endregion Department CRUD

//#region Role CRUD
function addRole(
  role_name: string,
  department_id: number,
  description?: string,
): number | Error {
  try {
    if (typeof description !== "undefined") {
      return db_conn.exec(
        "INSERT INTO roles (role_name,description,fk_department_id) VALUES (?,?,?)",
        role_name,
        description,
        department_id,
      );
    }
    return db_conn.exec(
      "INSERT INTO roles (role_name,fk_department_id) VALUES (?,?)",
      role_name,
      department_id,
    );
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

function getRoleId(
  role_name: number,
  department_id: number,
): number | Error | undefined {
  const id = db_conn
    .prepare(
      "SELECT roles.pk_role_id FROM roles WHERE pk_role_id= ? AND fk_department_id= ?",
    )
    .get(role_name, department_id);
  if (typeof id !== "undefined") {
    return Object.values(id)[0];
  }
  return id;
}

function getRoleById(role_id: string): DbRole[] | Error | undefined {
  return db_conn
    .prepare(
      "SELECT * FROM roles " +
        "LEFT JOIN allowed_role_actions RA on RA.fk_role_id = roles.pk_role_id" +
        "LEFT JOIN actions A on RA.fk_action_id = A.pk_action_id" +
        "WHERE pk_role_id= ?",
    )
    .all(role_id);
}

function getRolesInDepartment(
  department_id: string,
): DbRole[] | Error | undefined {
  return db_conn
    .prepare(
      "SELECT * FROM roles " +
        "LEFT JOIN allowed_role_actions RA on RA.fk_role_id = roles.pk_role_id" +
        "LEFT JOIN actions A on RA.fk_action_id = A.pk_action_id" +
        "WHERE fk_department_id= ?",
    )
    .all(department_id);
}

function deleteRole(role_id: number): number | Error {
  try {
    return db_conn.exec("DELETE FROM roles WHERE pk_role_id= ?", role_id);
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

//#endregion Role CRUD

//#region Associations
function addUserToDepartment(
  user_id: string,
  department_id: number,
  role_id: number,
): number | Error {
  try {
    return db_conn.exec(
      "INSERT INTO user_associations (fk_user_id,fk_department_id,fk_role_id) VALUES (?,?,?)",
      user_id,
      department_id,
      role_id,
    );
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

function updateRoleOfUser(
  user_id: string,
  department_id: number,
  new_role_id: number,
): number | Error {
  try {
    return db_conn.exec(
      "UPDATE user_associations SET fk_role_id = :role_id WHERE fk_user_id= :user_id AND fk_department_id= :department_id",
      user_id,
      department_id,
      new_role_id,
    );
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

function deleteUserFromDepartment(
  user_id: string,
  department_id: number,
): number | Error {
  try {
    return db_conn.exec(
      "DELETE FROM user_associations WHERE fk_user_id= ? AND fk_department_id= ?",
      user_id,
      department_id,
    );
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

function addActionToRole(role_id: number, action_id: number): number | Error {
  try {
    return db_conn.exec(
      "INSERT INTO allowed_role_actions (fk_role_id,fk_action_id) VALUES (?,?)",
      role_id,
      action_id,
    );
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

function deleteActionFromRole(
  role_id: number,
  action_id: number,
): number | Error {
  try {
    return db_conn.exec(
      "DELETE FROM allowed_role_actions WHERE fk_role_id= ? AND fk_action_id= ?",
      role_id,
      action_id,
    );
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

function addTagToTicket(tag_id: number, ticket_id: string): number | Error {
  try {
    return db_conn.exec(
      "INSERT INTO tag_associations (fk_tag_id,fk_ticket_id) VALUES (?,?)",
      tag_id,
      ticket_id,
    );
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

function deleteTagFromTicket(
  tag_id: number,
  ticket_id: string,
): number | Error {
  try {
    return db_conn.exec(
      "DELETE FROM tag_associations WHERE fk_tag_id= ? AND fk_ticket_id= ?",
      tag_id,
      ticket_id,
    );
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

//#endregion Associations

//#region Ticket CRUD

function addTicket(
  title: string,
  description: string,
  author_id: string,
  encoded_images?: string,
): string | Error {
  try {
    const ticket_id = crypto.randomUUID();
    if (typeof encoded_images !== "undefined") {
      db_conn.exec(
        "INSERT INTO tickets (pk_ticket_id,fk_author_id,title,description,fk_status_id,images) VALUES (?,?,?,?,?,?)",
        ticket_id,
        author_id,
        title,
        description,
        1,
        encoded_images,
      );
    }
    db_conn.exec(
      "INSERT INTO tickets (pk_ticket_id,fk_author_id,title,description,fk_status_id) VALUES (?,?,?,?,?)",
      ticket_id,
      author_id,
      title,
      description,
      1,
    );
    return ticket_id;
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

function getTicketById(ticket_id: string) {
  return db_conn.prepare("SELECT * FROM tickets WHERE pk_ticket_id= ?").get(
    ticket_id,
  );
}

function getTicketsOfDepartment(department_id: number) {
  return db_conn
    .prepare(
      "SELECT tickets.* FROM tickets " +
        "LEFT JOIN ticket_associations TA on TA.fk_ticket_id = tickets.pk_ticket_id" +
        "LEFT JOIN departments D on D.pk_department_id = TA.fk_department_id" +
        "WHERE fk_department_id= ?",
    )
    .all(department_id);
}

function getTicketOfUser(user_id: string) {
  return db_conn.prepare("SELECT * FROM tickets WHERE fk_author_id= ?").all(
    user_id,
  );
}

function updateTicketStatus(
  ticket_id: string,
  new_status_id: number,
): number | Error {
  try {
    return db_conn.exec(
      "UPDATE tickets SET fk_status_id = :role_id WHERE pk_ticket_id= :ticket_id",
      new_status_id,
      ticket_id,
    );
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

function deleteTicketById(ticket_id: string): number | Error {
  try {
    return db_conn.exec(
      "DELETE FROM tickets WHERE pk_ticket_id= :ticket_id",
      ticket_id,
    );
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

//#endregion Ticket CRUD

//#region Event CRUD

function addEventToTicket(
  ticket_id: string,
  author_id: string,
  event_type_id: number,
  description?: string,
  content?: string,
  encoded_images?: string,
): number | Error {
  try {
    if (
      typeof description !== "undefined" &&
      typeof content !== "undefined" &&
      typeof encoded_images !== "undefined"
    ) {
      return db_conn.exec(
        "INSERT INTO events (fk_ticket_id,fk_author_id,created_at,fk_event_type,description,content,images) VALUES (?,?,?,?,?,?,?)",
        ticket_id,
        author_id,
        Date.now(),
        event_type_id,
        description,
        content,
        encoded_images,
      );
    }
    if (
      typeof content !== "undefined" && typeof encoded_images !== "undefined"
    ) {
      return db_conn.exec(
        "INSERT INTO events (fk_ticket_id,fk_author_id,created_at,fk_event_type,content,encoded_images) VALUES (?,?,?,?,?,?)",
        ticket_id,
        author_id,
        Date.now(),
        event_type_id,
        content,
        encoded_images,
      );
    }
    if (typeof description !== "undefined" && typeof content !== "undefined") {
      return db_conn.exec(
        "INSERT INTO events (fk_ticket_id,fk_author_id,created_at,fk_event_type,description,content) VALUES (?,?,?,?,?,?)",
        ticket_id,
        author_id,
        Date.now(),
        event_type_id,
        description,
        content,
      );
    }
    if (typeof description !== "undefined") {
      return db_conn.exec(
        "INSERT INTO events (fk_ticket_id,fk_author_id,created_at,fk_event_type,description) VALUES (?,?,?,?,?)",
        ticket_id,
        author_id,
        Date.now(),
        event_type_id,
        description,
      );
    }
    if (typeof content !== "undefined") {
      return db_conn.exec(
        "INSERT INTO events (fk_ticket_id,fk_author_id,created_at,fk_event_type,content) VALUES (?,?,?,?,?)",
        ticket_id,
        author_id,
        Date.now(),
        event_type_id,
        content,
      );
    }
    return db_conn.exec(
      "INSERT INTO events (fk_ticket_id,fk_author_id,created_at,fk_event_type) VALUES (?,?,?,?)",
      ticket_id,
      author_id,
      Date.now(),
      event_type_id,
    );
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

function getEventsOfTicket(ticket_id: string) {
  return db_conn.prepare("SELECT * FROM events WHERE fk_ticket_id= ?").all(
    ticket_id,
  );
}

//#endregion Event CRUD

//#region Tags
function addTagToDepartment(
  department_id: number,
  tag_name: string,
  abbreviation: string,
  description?: string,
  style?: string,
): number | Error {
  try {
    if (typeof description == "undefined" && typeof style == "undefined") {
      return db_conn.exec(
        "INSERT INTO tags (tag_name,abbreviation,description,fk_department_id,style) VALUES (?,?,?,?,?)",
        tag_name,
        abbreviation,
        description,
        department_id,
        style,
      );
    }
    if (typeof description == "undefined") {
      return db_conn.exec(
        "INSERT INTO tags (tag_name,abbreviation,description,fk_department_id) VALUES (?,?,?,?)",
        tag_name,
        abbreviation,
        description,
        department_id,
      );
    }
    if (typeof style == "undefined") {
      return db_conn.exec(
        "INSERT INTO tags (tag_name,abbreviation,fk_department_id,style) VALUES (?,?,?,?)",
        tag_name,
        abbreviation,
        department_id,
        style,
      );
    }
    return db_conn.exec(
      "INSERT INTO tags (tag_name,abbreviation,fk_department_id) VALUES (?,?,?)",
      tag_name,
      abbreviation,
      department_id,
    );
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

function getTagById(tag_id: number) {
  return db_conn.prepare("SELECT * FROM tags WHERE pk_tag_id= ?").get(tag_id);
}

function getTagsInDepartment(department_id: number) {
  return db_conn.prepare("SELECT * FROM tags WHERE fk_department_id= ?").all(
    department_id,
  );
}

function deleteTag(tag_id: number) {
  try {
    return db_conn.exec("DELETE FROM tickets WHERE pk_tag_id= ?", tag_id);
  } catch (error) {
    assertIsError(error);
    return error;
  }
}

//#endregion

// sadly no parameter binding for tablename possible and therefore string concat as it will not be used outside
function _rowCounter(tablename: string): number {
  const query = "SELECT count(*) as count FROM " + tablename;
  return Object.values(db_conn.prepare(query).get()!).at(0) as number;
}

function closeDB() {
  if (db_conn.open) {
    db_conn.close();
  }
}

function assertIsError(error: unknown): asserts error is Error {
  assert(error instanceof Error);
}

export default {
  db_conn,
  initDB,
  closeDB,
  addUser,
  getUsers,
  getUserById,
  getUserByUsername,
  updateUserUsernameById,
  updateUserPasswordById,
  deleteUserById,
  addAction,
  getActionById,
  getActionByName,
  deleteAction,
  addDepartment,
  getDepartments,
  getDepartmentById,
  deleteDepartment,
  addRole,
  getRoleId,
  getRoleById,
  getRolesInDepartment,
  deleteRole,
  addUserToDepartment,
  updateRoleOfUser,
  deleteUserFromDepartment,
  addActionToRole,
  deleteActionFromRole,
  addTagToTicket,
  deleteTagFromTicket,
  addTicket,
  getTicketById,
  getTicketsOfDepartment,
  getTicketOfUser,
  updateTicketStatus,
  deleteTicketById,
  addEventToTicket,
  getEventsOfTicket,
  addTagToDepartment,
  getTagById,
  getTagsInDepartment,
  deleteTag,
};
