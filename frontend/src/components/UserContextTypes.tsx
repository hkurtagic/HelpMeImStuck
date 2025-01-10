import { User } from "@shared/shared_types";

interface UserContract {
	user_id?: string;
	username?: string;
}

interface UserState {
	user?: User;
	updateUser: (newState: Partial<User>) => void;
}

export type { UserState };
