import { CreationOptional, DataTypes, InferCreationAttributes, Model } from "npm:sequelize";
import { sequelize } from "@backend/service/dbconnector.ts";
import { DTOImage } from "@backend/schemes_and_types/dto_objects.ts";

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

export default class Image extends Model<DTOImage, InferCreationAttributes<Image>>
	implements DTOImage {
	// Properties
	declare pk_image_id: CreationOptional<DTOImage["pk_image_id"]>;
	declare image_content: DTOImage["image_content"];
	declare image_type: CreationOptional<DTOImage["image_type"]>;
}

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
		allowNull: true,
	},
}, { sequelize: sequelize });
