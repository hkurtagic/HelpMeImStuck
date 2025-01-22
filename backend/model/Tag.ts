import {
	BelongsToCreateAssociationMixin,
	BelongsToGetAssociationMixin,
	BelongsToManyAddAssociationMixin,
	BelongsToManyAddAssociationsMixin,
	BelongsToManyCountAssociationsMixin,
	BelongsToManyCreateAssociationMixin,
	BelongsToManyGetAssociationsMixin,
	BelongsToManyHasAssociationMixin,
	BelongsToManyHasAssociationsMixin,
	BelongsToManyRemoveAssociationMixin,
	BelongsToManyRemoveAssociationsMixin,
	BelongsToManySetAssociationsMixin,
	BelongsToSetAssociationMixin,
	CreationOptional,
	DataTypes,
	InferAttributes,
	InferCreationAttributes,
	Model,
} from "npm:sequelize";
import { sequelize } from "../service/dbconnector.ts";
import { DTOTag, S_DTOTagParsed } from "../schemes_and_types/dto_objects.ts";
import ModelDepartment from "./Department.ts";
import ModelTicket from "./Ticket.ts";
import { SQLNoTagFound } from "./Errors.ts";
import { S_Tag } from "../../shared/shared_types.ts";

/**
 * ```js
 * pk_tag_id: {
 *     type: DataTypes.INTEGER,
 *     autoIncrement: true,
 *     primaryKey: true,
 *     allowNull: false,
 *   },
 *   tag_name: {
 *     type: DataTypes.TEXT,
 *     allowNull: false,
 *     unique: true,
 *   },
 *   tag_abbreviation: {
 *     type: DataTypes.TEXT,
 *     allowNull: false,
 *   },
 *   tag_description: {
 *     type: DataTypes.TEXT,
 *     allowNull: true,
 *   },
 *   tag_style: {
 *     type: DataTypes.TEXT,
 *     allowNull: true,
 *   }
 * ```
 */

export default class Tag extends Model<InferAttributes<Tag>, InferCreationAttributes<Tag>>
	implements DTOTag {
	declare pk_tag_id: CreationOptional<DTOTag["pk_tag_id"]>;
	declare tag_name: DTOTag["tag_name"];
	declare tag_abbreviation: DTOTag["tag_abbreviation"];
	declare tag_description: CreationOptional<DTOTag["tag_description"]>;
	declare tag_style: CreationOptional<DTOTag["tag_style"]>;

	// Tag.belongsTo(Department)
	// second parameter = id or primary key type
	declare getDepartment: BelongsToGetAssociationMixin<ModelDepartment>;
	declare setDepartment: BelongsToSetAssociationMixin<ModelDepartment, number>;
	declare createDepartment: BelongsToCreateAssociationMixin<ModelDepartment>;

	// Tag.BelongsToMany(Ticket)
	// second parameter = id or primary key type
	declare getTickets: BelongsToManyGetAssociationsMixin<ModelTicket>;
	declare setTickets: BelongsToManySetAssociationsMixin<ModelTicket, number>;
	declare addTickets: BelongsToManyAddAssociationsMixin<ModelTicket, number>;
	declare addTicket: BelongsToManyAddAssociationMixin<ModelTicket, number>;
	declare createTicket: BelongsToManyCreateAssociationMixin<ModelTicket>;
	declare removeTicket: BelongsToManyRemoveAssociationMixin<ModelTicket, number>;
	declare removeTickets: BelongsToManyRemoveAssociationsMixin<ModelTicket, number>;
	declare hasTicket: BelongsToManyHasAssociationMixin<ModelTicket, number>;
	declare hasTickets: BelongsToManyHasAssociationsMixin<ModelTicket, number>;
	declare countTickets: BelongsToManyCountAssociationsMixin;
	static async getTagById(tag_id: number): Promise<S_Tag | null> {
		const tag = await Tag.findOne({
			where: { pk_tag_id: tag_id },
			include: [{
				model: ModelDepartment,
			}],
		});
		if (!tag) throw SQLNoTagFound;
		const res = S_DTOTagParsed.safeParse(tag.toJSON());
		if (!res.success) {
			console.error(res.error);
			return null;
		}
		return res.data;
	}
	static async getTagByName(tag_name: string, department_id: number): Promise<S_Tag | null> {
		const t = await sequelize.transaction();
		const tag = await Tag.findOne({
			where: { tag_name: tag_name },
			include: [{
				model: ModelDepartment,
				where: { pk_department_id: department_id },
			}],
		});
		if (!tag) throw SQLNoTagFound;
		const res = S_DTOTagParsed.safeParse(tag.toJSON());
		if (!res.success) {
			console.error(res.error);
			return null;
		}
		return res.data;
	}
}
Tag.init({
	pk_tag_id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
		allowNull: false,
	},
	tag_name: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
	tag_abbreviation: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
	tag_description: {
		type: DataTypes.TEXT,
		allowNull: true,
	},
	tag_style: {
		type: DataTypes.TEXT,
		allowNull: true,
	},
}, { sequelize: sequelize });
