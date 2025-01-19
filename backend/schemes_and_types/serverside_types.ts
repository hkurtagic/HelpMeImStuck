import { z } from "zod";
import {
	JWTExtraPayload,
	JWTPayload,
	S_Action,
	S_ServersideRole,
	S_ServersideUser,
	S_Status,
} from "./serverside_schemas.ts";

type JWTExtraPayload = z.infer<typeof JWTExtraPayload>;
type JWTPayload = z.infer<typeof JWTPayload>;
type ServersideRole = z.infer<typeof S_ServersideRole>;
type ServersideUser = z.infer<typeof S_ServersideUser>;
type ServersideStatus = z.output<typeof S_Status>;
type ServersideAction = z.infer<typeof S_Action>;

export type {
	JWTExtraPayload,
	JWTPayload,
	ServersideAction,
	ServersideRole,
	ServersideStatus,
	ServersideUser,
};
