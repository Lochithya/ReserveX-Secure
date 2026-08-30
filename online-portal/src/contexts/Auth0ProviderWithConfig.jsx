import React from "react";
import { Auth0Provider } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

export const Auth0ProviderWithConfig = ({ children }) => {
  const navigate = useNavigate();

  const domain = (import.meta.env.VITE_AUTH0_DOMAIN || "").trim();
  const clientId = (import.meta.env.VITE_AUTH0_CLIENT_ID || "").trim();
  const audience = (import.meta.env.VITE_AUTH0_AUDIENCE || "").trim();
  const redirectUri = window.location.origin;

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || "/home");
  };

  const authorizationParams = {
    redirect_uri: redirectUri,
    scope: "openid profile email",
    ...(audience ? { audience } : {}),
  };

  if (!domain || !clientId) {
    return <>{children}</>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={authorizationParams}
      onRedirectCallback={onRedirectCallback}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithConfig;
