import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useState } from "react";
import { logoutUser, signupUser } from "../helpers/api.communication";
import { checkAuthStatus, loginUser } from "../helpers/api.communication";
type User={
    name:string
    email:string
}
type UserAuth = {
    isLoggedIn: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    checkStatus: () => Promise<void>;
};

 const AuthContext=createContext<UserAuth|null>(null);
const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    async function checkStatus() {
        const data = await checkAuthStatus();
        if (data) {
            setUser({ name: data.name, email: data.email });
            setIsLoggedIn(true);
        }
    }

    useEffect(() => {
        checkStatus();
    }, []);

    const login = async (email: string, password: string) => {
        const data = await loginUser(email, password);
        if (data) {
            setUser({ name: data.name, email: data.email });
            setIsLoggedIn(true);
        }
    };

    const signup = async (name: string, email: string, password: string) => {
        const data = await signupUser(name, email, password);
        if (data) {
            setUser({ name: data.name, email: data.email });
            setIsLoggedIn(true);
        }
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
        setIsLoggedIn(false);
        window.location.reload();
    };

    const value = { user, isLoggedIn, login, signup, logout, checkStatus };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth=()=>
    {
        return useContext(AuthContext);
    };
export default AuthProvider;
