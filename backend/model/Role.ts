import {
	BelongsToGetAssociationMixin,
	BelongsToSetAssociationMixin,
	CreationOptional,
	DataTypes,
	HasManyAddAssociationMixin,
	HasManyAddAssociationsMixin,
	HasManyCountAssociationsMixin,
	HasManyGetAssociationsMixin,
	HasManyHasAssociationMixin,
	HasManyHasAssociationsMixin,
	HasManyRemoveAssociationMixin,
	HasManyRemoveAssociationsMixin,
	HasManySetAssociationsMixin,
	Model,
} from "npm:sequelize";
import { sequelize } from "@backend/service/dbconnector.ts";
import Department from "@backend/model/Department.ts";
import Action from "@backend/model/Action.ts";
import { DTORole, DTORoleCreate } from "@backend/schemes_and_types/dto_objects.ts";
import { ServersideRole } from "@backend/schemes_and_types/serverside_types.ts";

/**
 * ```js
 * pk_role_id: {
 *     type: DataTypes.INTEGER,
 *     autoIncrement: true,
 *     primaryKey: true,
 *     allowNull: false,
 *   },
 *   role_name: {
 *     type: DataTypes.TEXT,
 *     allowNull: false,
 *   },
 *   role_description: {
 *     type: DataTypes.TEXT,
 *     allowNull: false,
 *   }
 * ```
 */

export default class Role extends Model<DTORole, DTORoleCreate> implements DTORole {
	// Properties
	declare pk_role_id: CreationOptional<DTORole["pk_role_id"]>;
	declare role_name: DTORole["role_name"];
	declare role_description: DTORole["role_description"];

	// Since TS cannot determine model association at compile time
	// we have to declare them here purely virtually
	// these will not exist until `Model.init` was called.
	declare getDepartment: BelongsToGetAssociationMixin<Department>;
	declare setDepartment: BelongsToSetAssociationMixin<Department, number>;

	declare getActions: HasManyGetAssociationsMixin<Action>;
	declare addAction: HasManyAddAssociationMixin<Action, number>;
	declare addActions: HasManyAddAssociationsMixin<Action, number>;
	declare setActions: HasManySetAssociationsMixin<Action, number>;
	declare removeAction: HasManyRemoveAssociationMixin<Action, number>;
	declare removeActions: HasManyRemoveAssociationsMixin<Action, number>;
	declare hasAction: HasManyHasAssociationMixin<Action, number>;
	declare hasActions: HasManyHasAssociationsMixin<Action, number>;
	declare countActions: HasManyCountAssociationsMixin;

	// Static Methods
	static async getRoleByName(
		role_name: string,
		department_id: number,
	): Promise<Model<ServersideRole> | null> {
		const role = await Role.findOne({
			where: { role_name: role_name },
			include: [{
				model: Department,
				as: "department",
				where: {
					pk_department_id: department_id,
				},
				required: true,
			}, {
				model: Action,
				as: "actions",
				required: true,
				through: {
					attributes: [],
				},
			}],
		}) as unknown as Model<ServersideRole>;

		if (!role) return null;
		return role;
	}
	static async getRoleById(role_id: number): Promise<Model<ServersideRole> | null> {
		const role = await Role.findOne({
			where: { pk_role_id: role_id },
			include: [{
				model: Department,
				as: "department",
				required: true,
			}, {
				model: Action,
				as: "actions",
				required: true,
				through: {
					attributes: [],
				},
			}],
		}) as unknown as Model<ServersideRole>;

		if (!role) return null;
		return role;
	}
}

Role.init({
	pk_role_id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
		allowNull: false,
		field: "pk_role_id",
	},
	role_name: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
	role_description: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
}, { sequelize: sequelize });
