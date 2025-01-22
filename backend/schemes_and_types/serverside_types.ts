import { z } from "zod";
import {
    JWTExtraPayload,
    JWTPayload,
    S_Action,
    S_ActionsPerDepartment,
    S_ServersideRole,
    S_ServersideUser,
    // S_Status,
    S_ServerTicket,
} from "./serverside_schemas.ts";

export type JWTExtraPayload = z.infer<typeof JWTExtraPayload>;
export type JWTPayload = z.infer<typeof JWTPayload>;
export type ServersideRole = z.infer<typeof S_ServersideRole>;
export type ServersideUser = z.infer<typeof S_ServersideUser>;
// type ServersideStatus = z.output<typeof S_Status>;
export type ServersideAction = z.infer<typeof S_Action>;
export type ServersideTicket = z.infer<typeof S_ServerTicket>;
export type ActionsPerDepartment = z.output<typeof S_ActionsPerDepartment>;
