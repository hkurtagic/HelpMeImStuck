import { User } from "@shared/shared_types";

interface UserState {
    user?: User;
    updateUser: (newState: Partial<User>) => void;
}

export type { UserState };
