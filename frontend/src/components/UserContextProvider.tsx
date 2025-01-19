import { useState } from "react";
import { UserContext } from "@/components/UserContext";
import { User } from "@shared/shared_types";


export default function UserContextProvider(props: {
	children: React.ReactNode;
}): JSX.Element {
	const [state, setState] = useState({});

	const updateState = (newState: Partial<User>) => {
		setState({ ...state, user: newState });
	};

	return (
		<UserContext.Provider value={{ ...state, updateUser: updateState }}>
			{props.children}
		</UserContext.Provider>
	);
}
