import {User} from "@shared/shared_types.ts";

export interface UserState {
    user: User;
    updateUser: (newState: Partial<User>) => void;
}
