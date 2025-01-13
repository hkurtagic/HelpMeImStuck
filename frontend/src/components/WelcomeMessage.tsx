import React, { useContext } from "react";
import { UserContext } from "@/components/UserContext";

const WelcomeMessage: React.FC = () => {
    // Zugriff auf den UserContext
    const { user } = useContext(UserContext);

    return (
        <div>
            {/* Nutzername oder "Guest" anzeigen */}
            <h3>Hello {user?.user_name || "Guest"}</h3>
        </div>
    );
};

export default WelcomeMessage;
