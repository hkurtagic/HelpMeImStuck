import { DataTypes, Model } from "npm:sequelize";
import { sequelize } from "@backend/service/dbconnector.ts";

/**
 * ```js
 * pk_image_id: {
 *     type: DataTypes.UUID,
 *     defaultValue: DataTypes.UUIDV4,
 *     primaryKey: true,
 *     allowNull: false,
 *   },
 *   image_content: {
 *     type: DataTypes.TEXT,
 *     allowNull: false,
 *   },
 *   image_type: {
 *     type: DataTypes.TEXT,
 *     allowNull: false,
 *   }
 * ```
 */

export default class Image extends Model {}

Image.init({
  pk_image_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  image_content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  image_type: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, { sequelize: sequelize });
