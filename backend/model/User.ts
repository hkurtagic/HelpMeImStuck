import {
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
import { AlgorithmName, hash } from "jsr:@stdext/crypto/hash";
import { ServersideUser } from "@backend/schemes_and_types/serverside_types.ts";
import Role from "@backend/model/Role.ts";
import Action from "@backend/model/Action.ts";
import { DTOUser, DTOUserCreate } from "@backend/schemes_and_types/dto_objects.ts";
import Department from "@backend/model/Department.ts";

/**
 * ```
 *     pk_user_id: {
 *       type: DataTypes.UUID,
 *       primaryKey: true,
 *       defaultValue: DataTypes.UUIDV4,
 *       allowNull: false,
 *     },
 *     user_name: {
 *       type: DataTypes.TEXT,
 *       allowNull: false,
 *       unique: true,
 *     },
 *     password_hash: {
 *       type: DataTypes.TEXT,
 *       allowNull: false,
 *       set(value: string): void {
 *         this.setDataValue("password_hash", hash(AlgorithmName.Argon2, value));
 *       },
 *     }
 * ```
 */

export default class User extends Model<DTOUser, DTOUserCreate> implements DTOUser {
	// Properties
	declare pk_user_id: CreationOptional<DTOUser["pk_user_id"]>;
	declare user_name: DTOUser["user_name"];
	declare password_hash: DTOUser["password_hash"];

	// Since TS cannot determine model association at compile time
	// we have to declare them here purely virtually
	// these will not exist until `Model.init` was called.
	declare getRoles: HasManyGetAssociationsMixin<Role>;
	declare addRole: HasManyAddAssociationMixin<Role, number>;
	declare addRoles: HasManyAddAssociationsMixin<Role, number>;
	declare setRoles: HasManySetAssociationsMixin<Role, number>;
	declare removeRole: HasManyRemoveAssociationMixin<Role, number>;
	declare removeRoles: HasManyRemoveAssociationsMixin<Role, number>;
	declare hasRole: HasManyHasAssociationMixin<Role, number>;
	declare hasRoles: HasManyHasAssociationsMixin<Role, number>;
	declare countRoles: HasManyCountAssociationsMixin;

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
	static async getUserById(user_id: string): Promise<Model<ServersideUser> | null> {
		const user = await User.findOne({
			where: { pk_user_id: user_id },
			include: [
				{
					model: Role,
					as: "roles",
					required: true,
					include: [{
						model: Department,
						as: "department",
						required: true,
					}, {
						model: Action,
						as: "actions",
						through: {
							attributes: [],
						},
					}],
					through: {
						attributes: [],
					},
				},
				{
					model: Action,
					as: "actions",
					through: {
						attributes: [],
					},
				},
			],
		}) as unknown as Model<ServersideUser>;
		if (!user) return null;

		return user;
	}
	static async getUserByName(user_name: string): Promise<Model<ServersideUser> | null> {
		const user = await User.findOne({
			where: { user_name: user_name },
			include: [
				{
					model: Role,
					as: "roles",
					required: true,
					include: [{
						model: Department,
						as: "department",
						required: true,
					}, {
						model: Action,
						as: "actions",
						through: {
							attributes: [],
						},
					}],
					through: {
						attributes: [],
					},
				},
				{
					model: Action,
					as: "actions",
					through: {
						attributes: [],
					},
				},
			],
		}) as unknown as Model<ServersideUser>;
		if (!user) return null;

		return user;
	}
}

User.init(
	{
		pk_user_id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
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
