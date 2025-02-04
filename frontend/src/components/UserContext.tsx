import { createContext } from "react";
import { UserState } from "@/components/UserContextTypes";
import { User } from "@shared/shared_types";

export const defaultState: UserState = {
    user: {
        user_id: "",
        user_name: "",
        roles: [],
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateUser: (newState?: Partial<User>) => {},
};

export const UserContext = createContext<UserState>(defaultState);
