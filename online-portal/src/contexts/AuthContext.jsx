import { createContext, useEffect, useState, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getCurrentUser } from "../services/auth.service";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const {
        isAuthenticated: auth0IsAuthenticated,
        user: auth0User,
        loginWithRedirect,
        logout: auth0Logout,
        getAccessTokenSilently,
        isLoading: auth0Loading,
    } = useAuth0();

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        if (!savedUser) return null;
        try {
            return JSON.parse(savedUser);
        } catch (error) {
            localStorage.removeItem("user");
            return null;
        }
    });

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!localStorage.getItem("token");
    });

    const [loading, setLoading] = useState(true);

    // Sync Auth0 session when authenticated via Auth0 SSO
    useEffect(() => {
        const syncAuth0User = async () => {
            if (auth0IsAuthenticated && auth0User) {
                try {
                    let token = "";
                    try {
                        token = await getAccessTokenSilently();
                    } catch (e) {
                        console.warn("Could not get access token silently, using fallback ID token:", e);
                    }

                    const fullName = auth0User.name || auth0User.nickname || "Vendor";
                    const derivedUsername = auth0User["https://reservex.lk/username"] ||
                        (auth0User.name && auth0User.name.trim() ? auth0User.name.trim().split(/\s+/)[0] : (auth0User.nickname || auth0User.email?.split("@")[0] || "Vendor"));
                    const derivedBusinessName = auth0User["https://reservex.lk/business_name"] || `${derivedUsername} Shop`;

                    const vendorProfile = {
                        name: fullName,
                        username: derivedUsername,
                        email: auth0User.email || "",
                        contactNumber: auth0User["https://reservex.lk/contact_number"] || auth0User.phone_number || "",
                        businessName: derivedBusinessName,
                        role: "VENDOR",
                        noOfCurrentBookings: 0,
                        authProvider: "auth0"
                    };

                    if (token) {
                        localStorage.setItem("token", token);
                    }
                    localStorage.setItem("user", JSON.stringify(vendorProfile));
                    setUser(vendorProfile);
                    setIsAuthenticated(true);

                    // Attempt to fetch DB profile if backend JIT created it
                    try {
                        const dbUser = await getCurrentUser();
                        if (dbUser) {
                            const updatedUser = { ...vendorProfile, ...dbUser };
                            localStorage.setItem("user", JSON.stringify(updatedUser));
                            setUser(updatedUser);
                        }
                    } catch (err) {
                        console.debug("Backend profile sync will occur on first API call");
                    }
                } catch (err) {
                    console.error("Failed to sync Auth0 user profile:", err);
                }
            }
            setLoading(false);
        };

        if (!auth0Loading) {
            syncAuth0User();
        }
    }, [auth0IsAuthenticated, auth0User, auth0Loading, getAccessTokenSilently]);

    const login = (userData, token) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
    };

    const loginWithAuth0 = async (options = {}) => {
        await loginWithRedirect(options);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);

        if (auth0IsAuthenticated) {
            auth0Logout({ logoutParams: { returnTo: window.location.origin } });
        }
    };

    const refreshUser = async () => {
        try {
            const userData = await getCurrentUser();
            const updatedUser = {
                ...userData,
                noOfCurrentBookings: userData.noOfCurrentBookings ?? 0
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            console.error("Failed to refresh user data:", error);
            return user;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: isAuthenticated || auth0IsAuthenticated,
                user,
                login,
                loginWithAuth0,
                logout,
                refreshUser,
                loading: loading || auth0Loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};