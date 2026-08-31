import { createContext, useEffect, useState, useRef, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getCurrentUser } from "../services/auth.service";
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const {
        isAuthenticated: auth0IsAuthenticated,
        user: auth0User,
        loginWithRedirect,
        logout: auth0Logout,
        getAccessTokenSilently,
        getIdTokenClaims,
        isLoading: auth0Loading,
    } = useAuth0();

    const hasNotifiedRef = useRef(false);

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

    const [loading, setLoading] = useState(true); // Start as true, then set to false after check

    // Initialize auth state on mount
    useEffect(() => {
        const initAuth = () => {
            const token = localStorage.getItem("token");
            const savedUser = localStorage.getItem("user");
            
            if (token && savedUser) {
                try {
                    const userObj = JSON.parse(savedUser);
                    setUser(userObj);
                    setIsAuthenticated(true);
                    console.log("Auth initialized from localStorage");
                } catch (error) {
                    console.error("Failed to parse saved user:", error);
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
            
            // If not using Auth0, loading is done
            if (!auth0Loading && !auth0IsAuthenticated) {
                setLoading(false);
            }
        };
        
        initAuth();
    }, []);

    // Sync Auth0 session when authenticated via Auth0 SSO
    useEffect(() => {
        const syncAuth0User = async () => {
            if (auth0IsAuthenticated && auth0User) {
                try {
                    let token = "";
                    try {
                        const claims = await getIdTokenClaims();
                        if (claims && claims.__raw) {
                            token = claims.__raw;
                        }
                    } catch (e) {
                        console.warn("Could not get ID token claims:", e);
                    }

                    if (!token) {
                        try {
                            token = await getAccessTokenSilently();
                        } catch (e) {
                            console.warn("Could not get access token silently:", e);
                        }
                    }

                    if (token) {
                        localStorage.setItem("token", token);
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

                    // Trigger toast notification on successful SSO login/signup
                    if (!hasNotifiedRef.current) {
                        hasNotifiedRef.current = true;
                        toast.success(`Welcome, ${vendorProfile.name || "Vendor"}!`);
                    }
                } catch (err) {
                    console.error("Failed to sync Auth0 user profile:", err);
                    toast.error("Failed to sync profile. Please try again.");
                }
            }
            setLoading(false);
        };

        if (!auth0Loading) {
            syncAuth0User();
        }
    }, [auth0IsAuthenticated, auth0User, auth0Loading, getAccessTokenSilently, getIdTokenClaims]);

    const login = (userData, token) => {
        hasNotifiedRef.current = true;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
    };

    const loginWithAuth0 = async (options = {}) => {
        hasNotifiedRef.current = false;
        await loginWithRedirect(options);
    };

    const logout = () => {
        hasNotifiedRef.current = false;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
        toast.success("Signed out successfully");

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
                auth0IsAuthenticated,
                auth0User,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};