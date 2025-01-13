//TODO add all relations on creation!!!

import User from "../model/User.ts";
import Role from "../model/Role.ts";
import { SQLNoRoleFound, SQLNoUserFound } from "../model/Errors.ts";

export const addUser = async (
  user: User,
  roles: Role[] | string[],
): Promise<User> => {
  for (let count: number = 0; count < roles.length; count++) {
    if (typeof roles[count] === "string") {
      const s_role = await Role.findOne({
        where: { role_name: roles[count] },
      });
      if (s_role == null) throw SQLNoRoleFound;
      roles[count] = s_role;
    }
  }

  await user.save();
  //@ts-expect-error: <IDE does not like sequelize magic>
  await user.addRoles(roles); //add entry to UserRoles
  const res = await User.findOne({
    where: { user_name: user.get("user_name") },
    include: [Role], //query with role in response
  });
  if (res === null) throw SQLNoUserFound;
  return res;
};

export const editUser = async (
  user: User,
  roles?: Role[] | string[],
): Promise<User> => {
  if (roles) {
    for (let count: number = 0; count < roles.length; count++) {
      if (typeof roles[count] === "string") {
        const s_role = await Role.findOne({
          where: { role_name: roles[count] },
        });
        if (s_role == null) throw SQLNoRoleFound;
        roles[count] = s_role;
      }
      //@ts-expect-error: <IDE does not like sequelize magic>
      await user.setRoles(roles);
    }
  }
  return await user.update(user);
};

export const deleteUser = async (user: User | string) => {
  try {
    if (typeof user === "string") {
      const s_user = await User.findOne({
        where: {
          user_name: user,
        },
      });
      if (s_user == null) return null;
      user = s_user;
    }
    return await User.destroy({
      where: { pk_user_id: user.get("pk_user_id") },
    });
  } catch (e) {
    console.log(e);
  }
};

const addAction = async () => {};
const editAction = async () => {};
const deleteAction = async () => {};

const addRole = async () => {};
const editRole = async () => {};
const deleteRole = async () => {};

const addDepartment = async () => {};
const editDepartment = async () => {};
const deleteDepartment = async () => {};

const addTicket = async () => {};
const editTicket = async () => {};
const deleteTicket = async () => {};

const addStatus = async () => {};
const editStatus = async () => {};
const deleteStatus = async () => {};

const addTag = async () => {};
const editTag = async () => {};
const deleteTag = async () => {};

const addEvent = async () => {};
const editEvent = async () => {};
const deleteEvent = async () => {};

const addEventType = async () => {};
const editEventType = async () => {};
const deleteEventType = async () => {};

const addUserToDepartment = async () => {};
const removeUserFromDepartment = async () => {};
const addRoleToUser = async () => {};
const removeRoleFromUser = async () => {};
