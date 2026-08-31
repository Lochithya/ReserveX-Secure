import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { EnvelopeIcon, LockClosedIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import { loginUser } from "../services/auth.service";

const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 21 21">
    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
  </svg>
);

const GithubIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0 text-slate-800" fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, loginWithAuth0 } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSocialLogin = async (connection) => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      await loginWithAuth0({
        authorizationParams: {
          connection: connection,
          prompt: "select_account",
        },
      });
    } catch (err) {
      toast.error(`Failed to connect with provider`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await loginUser(email, password);
      
      console.log("Login response:", response);
      
      if (response?.role?.toUpperCase() !== "VENDOR") {
        throw "Access Denied: This portal is for Vendors only.";
      }
      
      const { token, type, ...userData } = response;
      
      // Verify token was saved
      const savedToken = localStorage.getItem("token");
      console.log("Token saved to localStorage:", savedToken ? "YES" : "NO");
      
      // Call AuthContext login to update state
      login(userData, token);
      
      toast.success("Welcome back!");
      
      // Give a small delay to ensure state updates
      setTimeout(() => {
        navigate("/home");
      }, 100);
      
    } catch (errorMessage) {
      toast.error(typeof errorMessage === "string" ? errorMessage : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#f0f4ff" }}>
      {/* ── Left brand panel ── */}
      <div
        className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col items-center justify-center p-14"
        style={{
          background: "linear-gradient(145deg, #4f46e5 0%, #6366f1 45%, #818cf8 100%)",
        }}
      >
        {/* Soft white orbs for depth */}
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-10"
          style={{ background: "white", filter: "blur(60px)", transform: "translate(-30%, -30%)" }} />
        <div className="absolute bottom-0 right-0 w-56 h-56 rounded-full opacity-10"
          style={{ background: "white", filter: "blur(50px)", transform: "translate(20%, 20%)" }} />

        <div className="relative z-10 text-center">
          {/* Logo */}
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 bg-white/20 backdrop-blur-sm border border-white/30"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
          >
            <span className="text-white font-black text-3xl tracking-tight">RX</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">ReserveX</h1>
          <p className="text-indigo-100 text-base font-medium mb-10">Stall Reservation Platform</p>

          {/* Feature cards */}
          <div className="space-y-3 text-left max-w-xs mx-auto">
            {[
              { icon: "🏛️", title: "Multi-Event Support", desc: "Book stalls across exhibitions, fairs & expos" },
              { icon: "🔐", title: "OIDC Secured", desc: "Enterprise-grade Auth0 Single Sign-On" },
              { icon: "⚡", title: "Instant Confirmation", desc: "QR-coded receipts delivered to your inbox" },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
              >
                <span className="text-xl mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{item.title}</p>
                  <p className="text-indigo-100 text-xs mt-0.5 opacity-80">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right auth panel ── */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">

          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-3"
              style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)" }}
            >
              <span className="text-white font-black text-xl">RX</span>
            </div>
            <h1 className="text-2xl font-black text-slate-800">ReserveX</h1>
          </div>

          {/* White card */}
          <div
            className="rounded-2xl bg-white"
            style={{
              boxShadow: "0 4px 6px rgba(79,70,229,0.06), 0 20px 40px rgba(79,70,229,0.10)",
              border: "1px solid rgba(99,102,241,0.12)"
            }}
          >
            {/* Tabs */}
            <div
              className="flex m-5 mb-0 p-1 rounded-xl"
              style={{ background: "#f1f2ff" }}
            >
              <button
                type="button"
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg text-white transition-all"
                style={{
                  background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                  boxShadow: "0 4px 12px rgba(79,70,229,0.3)"
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all text-slate-500 hover:text-indigo-600"
              >
                Sign Up
              </button>
            </div>

            <div className="p-7 pt-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h2>
              <p className="text-sm text-slate-400 mb-6">Sign in to manage your stall reservations</p>

              {/* Direct Social SSO buttons */}
              <div className="space-y-2.5 mb-5">
                <button
                  type="button"
                  onClick={() => handleSocialLogin("google-oauth2")}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl font-medium text-sm text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 shadow-sm"
                >
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin("windowslive")}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl font-medium text-sm text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 shadow-sm"
                >
                  <MicrosoftIcon />
                  <span>Continue with Microsoft</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin("github")}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl font-medium text-sm text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 shadow-sm"
                >
                  <GithubIcon />
                  <span>Continue with GitHub</span>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs font-medium text-slate-400">or sign in with email</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Email or Username
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="publisher@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-700 placeholder-slate-300 bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-700 placeholder-slate-300 bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm text-white mt-1 transition-all duration-200 disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                    boxShadow: "0 4px 14px rgba(79,70,229,0.3)"
                  }}
                  onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 22px rgba(79,70,229,0.4)"; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(79,70,229,0.3)"; }}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : "Sign In with Password"}
                </button>
              </form>

              {/* Footer */}
              <div className="flex items-center justify-center gap-1.5 mt-6 pt-5 border-t border-slate-100">
                <ShieldCheckIcon className="h-3.5 w-3.5 text-slate-300" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-300">
                  OIDC &amp; JWT Secured Portal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
