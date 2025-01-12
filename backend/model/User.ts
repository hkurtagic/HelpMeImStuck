import { DataTypes, Model } from "npm:sequelize";
import { sequelize } from "@backend/service/dbconnector.ts";
import { AlgorithmName, hash } from "jsr:@stdext/crypto/hash";

/**
 * @type {object}
 * @property {string} user_name - A Name
 * @property {string} password_hash - A plain text password [will automatically be hashed]
 */

export default class User extends Model {}

User.init(
  {
    pk_user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_name: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
      set(value: string): void {
        this.setDataValue("password_hash", hash(AlgorithmName.Argon2, value));
      },
    },
  },
  {
    sequelize: sequelize,
  },
);
