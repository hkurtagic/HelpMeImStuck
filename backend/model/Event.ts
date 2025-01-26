import {
    BelongsToCreateAssociationMixin,
    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin,
    CreationOptional,
    DataTypes,
    HasManyAddAssociationMixin,
    HasManyAddAssociationsMixin,
    HasManyCountAssociationsMixin,
    HasManyCreateAssociationMixin,
    HasManyGetAssociationsMixin,
    HasManyHasAssociationMixin,
    HasManyHasAssociationsMixin,
    HasManyRemoveAssociationMixin,
    HasManyRemoveAssociationsMixin,
    HasManySetAssociationsMixin,
    InferCreationAttributes,
    Model,
} from "npm:sequelize";
import { sequelize } from "../service/dbconnector.ts";
import { default as EventTypeModel } from "@backend/model/EventType.ts";
import { default as UserModel } from "@backend/model/User.ts";
import { default as TicketModel } from "@backend/model/Ticket.ts";
import { default as ImageModel } from "@backend/model/Image.ts";
import { DTOEvent, S_DTOTicketHistoryEvent } from "@backend/schemes_and_types/dto_objects.ts";
import { Ticket, TicketHistory, TicketHistoryEvent } from "@shared/shared_types.ts";

/**
 * ```js
 * pk_event_id: {
 *     type: DataTypes.INTEGER,
 *     autoIncrement: true,
 *     primaryKey: true,
 *     allowNull: false,
 *   },
 *   event_description: {
 *     type: DataTypes.TEXT,
 *     allowNull: true,
 *   },
 *   event_content: {
 *     type: DataTypes.TEXT,
 *     allowNull: true,
 *   }
 * ```
 */

export default class Event extends Model<DTOEvent, InferCreationAttributes<Event>>
    implements DTOEvent {
    // Properties
    declare pk_event_id: CreationOptional<DTOEvent["pk_event_id"]>;
    declare event_description: DTOEvent["event_description"];
    declare event_content: DTOEvent["event_content"];

    //#region Association Mixins
    // Event.belongsTo(EventType)
    // second parameter = id or primary key type
    declare getEventType: BelongsToGetAssociationMixin<EventTypeModel>;
    declare setEventType: BelongsToSetAssociationMixin<EventTypeModel, number>;
    declare createEventType: BelongsToCreateAssociationMixin<EventTypeModel>;

    // Event.belongsTo(User,{as: author})
    // second parameter = id or primary key type
    declare getAuthor: BelongsToGetAssociationMixin<UserModel>;
    declare setAuthor: BelongsToSetAssociationMixin<UserModel, string>;
    declare createAuthor: BelongsToCreateAssociationMixin<UserModel>;

    // Event.belongsTo(Ticket)
    // second parameter = id or primary key type
    declare getTicket: BelongsToGetAssociationMixin<TicketModel>;
    declare setTicket: BelongsToSetAssociationMixin<TicketModel, string>;
    declare createTicket: BelongsToCreateAssociationMixin<TicketModel>;

    // Event.hasMany(Image)
    declare getImages: HasManyGetAssociationsMixin<ImageModel>;
    declare setImages: HasManySetAssociationsMixin<ImageModel, string>;
    declare addImages: HasManyAddAssociationsMixin<ImageModel, string>;
    declare addImage: HasManyAddAssociationMixin<ImageModel, string>;
    declare createImage: HasManyCreateAssociationMixin<ImageModel>;
    declare removeImage: HasManyRemoveAssociationMixin<ImageModel, string>;
    declare removeImages: HasManyRemoveAssociationsMixin<ImageModel, string>;
    declare hasImage: HasManyHasAssociationMixin<ImageModel, string>;
    declare hasImages: HasManyHasAssociationsMixin<ImageModel, string>;
    declare countImages: HasManyCountAssociationsMixin;
    //#endregion Association Mixins

    static async getTicketHistory(ticket_id: string): Promise<TicketHistory | null> {
        const e = await Event.findAll({
            include: [{
                model: EventTypeModel,
                attributes: ["pk_event_type_id"],
                required: true,
            }, {
                model: TicketModel,
                attributes: ["pk_ticket_id"],
                required: true,
                where: {
                    pk_ticket_id: ticket_id,
                },
            }, {
                model: UserModel,
                as: "author",
                required: true,
                attributes: ["pk_user_id", "user_name"],
            }, {
                model: ImageModel,
                required: false,
            }],
        });
        if (!e) return null;
        const ticket: Ticket = (await TicketModel.getTicketById(ticket_id))!;

        const ticket_history: TicketHistory = { ticket: ticket, events: [] };
        e.forEach((event) => {
            ticket_history.events.push(
                S_DTOTicketHistoryEvent.parse(event.toJSON()) as TicketHistoryEvent,
            );
        });
        return ticket_history;
    }
}

Event.init({
    pk_event_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    event_description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    event_content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, { sequelize: sequelize });
