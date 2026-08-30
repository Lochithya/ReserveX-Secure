import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { EnvelopeIcon, LockClosedIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import { loginUser } from "../services/auth.service";

const Auth0Icon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.98 10.277L19.467 2.541a.59.59 0 0 0-.256-.307.6.6 0 0 0-.395-.067.6.6 0 0 0-.356.195L12 10.744 5.54 2.362a.6.6 0 0 0-.356-.195.6.6 0 0 0-.395.067.59.59 0 0 0-.256.307L2.02 10.277a11.96 11.96 0 0 0 4.347 12.35.59.59 0 0 0 .708 0L12 18.995l4.925 3.632a.59.59 0 0 0 .708 0 11.96 11.96 0 0 0 4.347-12.35z" fill="white" />
  </svg>
);

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, loginWithAuth0 } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAuth0Login = async () => {
    try {
      await loginWithAuth0();
    } catch (err) {
      toast.error("Failed to redirect to Auth0");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await loginUser(email, password);
      if (response?.role?.toUpperCase() !== "VENDOR") {
        throw "Access Denied: This portal is for Vendors only.";
      }
      const { token, type, ...userData } = response;
      login(userData, token);
      toast.success("Welcome back!");
      navigate("/home");
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

              {/* Auth0 button */}
              <button
                type="button"
                onClick={handleAuth0Login}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl font-semibold text-sm mb-5 transition-all duration-200 text-white"
                style={{
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  boxShadow: "0 4px 14px rgba(249,115,22,0.3)"
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(249,115,22,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(249,115,22,0.3)"; }}
              >
                <Auth0Icon />
                <span>Continue with Auth0 (SSO / OIDC)</span>
              </button>

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
