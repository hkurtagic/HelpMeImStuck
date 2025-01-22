import { useState } from "react";
import { UserContext } from "@/components/UserContext";
import { User } from "@shared/shared_types";
import {UserState} from "@/components/UserContextTypes.tsx";
import { defaultState } from "@/components/UserContext";


export default function UserContextProvider(props: {
    children: React.ReactNode;
}): JSX.Element {
    const [state, setState] = useState<UserState>(defaultState);

    const updateState = (newState: Partial<User>) => {
        setState((prev) => ({
            ...prev,
            user: { ...prev.user, ...newState }
        }));
    };


    return (
        <UserContext.Provider value={{ ...state, updateUser: updateState }}>
            {props.children}
        </UserContext.Provider>
    );
}
