import { z } from "zod";
import {
	JWTExtraPayload,
	JWTPayload,
	ServersideRoleSchema,
	ServersideUserSchema,
} from "./serverside_schemas.ts";

type JWTExtraPayload = z.infer<typeof JWTExtraPayload>;
type JWTPayload = z.infer<typeof JWTPayload>;
type ServersideRole = z.infer<typeof ServersideRoleSchema>;
type ServersideUser = z.infer<typeof ServersideUserSchema>;

export type { JWTExtraPayload, JWTPayload, ServersideRole, ServersideUser };
