import { CreationOptional, DataTypes, Model } from "npm:sequelize";
import { sequelize } from "@backend/service/dbconnector.ts";
import { DTODepartment, DTODepartmentCreate } from "@backend/schemes_and_types/dto_objects.ts";

/**
 * ```js
	pk_department_id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
		allowNull: false,
		field: "pk_department_id",
	},
	department_name: {
		type: DataTypes.TEXT,
		allowNull: false,
		unique: true,
	},
	department_description: {
		type: DataTypes.TEXT,
		allowNull: true,
	},
 * ```
 */

export default class Department extends Model<DTODepartment, DTODepartmentCreate>
	implements DTODepartment {
	// Properties
	declare pk_department_id: CreationOptional<DTODepartment["pk_department_id"]>;
	declare department_name: DTODepartment["department_name"];
	declare department_description: DTODepartment["department_description"];

	// Static Methods
	static async getDepartmentByName(
		department_name: string,
	): Promise<Department | null> {
		const department = await Department.findOne({
			where: { department_name: department_name },
		});

		if (!department) return null;
		return department;
	}
	static async getDepartmentById(department_id: number): Promise<Department | null> {
		const department = await Department.findOne({
			where: { pk_department_id: department_id },
		});

		if (!department) return null;
		return department;
	}
}
Department.init({
	pk_department_id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
		allowNull: false,
		field: "pk_department_id",
	},
	department_name: {
		type: DataTypes.TEXT,
		allowNull: false,
		unique: true,
	},
	department_description: {
		type: DataTypes.TEXT,
		allowNull: true,
	},
}, { sequelize: sequelize });
