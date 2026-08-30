import { useState, useContext } from "react";
import { registerUser } from "../services/auth.service";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  IdentificationIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

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

const Field = ({ label, icon: Icon, required, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
      {label} {required && <span className="text-orange-500">*</span>}
    </label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
      {children}
    </div>
  </div>
);

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "", username: "", business_name: "",
    email: "", contact_number: "", password: "", confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithAuth0 } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSocialSignUp = async (connection) => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      await loginWithAuth0({
        authorizationParams: {
          connection: connection,
          screen_hint: "signup",
          prompt: "select_account",
        },
      });
    } catch (err) {
      toast.error(`Failed to connect with provider`);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (formData.password !== formData.confirmPassword) { toast.error("Passwords do not match"); return; }
    setIsLoading(true);
    try {
      const response = await registerUser(formData);
      toast.success(response.message || "Account created! Please sign in.");
      navigate("/login");
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-700 placeholder-slate-300 bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all";

  return (
    <div className="min-h-screen flex" style={{ background: "#f0f4ff" }}>

      {/* ── Left brand panel ── */}
      <div
        className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col items-center justify-center p-14"
        style={{ background: "linear-gradient(145deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)" }}
      >
        {/* Subtle white glows */}
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: "white", filter: "blur(70px)", transform: "translate(-30%, -30%)" }} />
        <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full opacity-10"
          style={{ background: "white", filter: "blur(60px)", transform: "translate(20%, 20%)" }} />

        <div className="relative z-10 text-center">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 bg-white/20 backdrop-blur-sm border border-white/30"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
          >
            <span className="text-white font-black text-3xl">RX</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">ReserveX</h1>
          <p className="text-indigo-100 font-medium mb-8">Stall Reservation Platform</p>

          <div
            className="p-5 rounded-2xl text-left"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
          >
            <p className="text-white font-semibold text-sm mb-3">Why join ReserveX?</p>
            {[
              "Reserve stalls at top exhibitions & events",
              "Instant QR-coded booking confirmations",
              "Manage all reservations from one home page",
              "Secure OIDC / Auth0 authentication"
            ].map(text => (
              <div key={text} className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
                <p className="text-indigo-100 text-xs opacity-90">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right registration panel ── */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-xl py-8">

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
            <div className="flex m-5 mb-0 p-1 rounded-xl" style={{ background: "#f1f2ff" }}>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all text-slate-500 hover:text-indigo-600"
              >
                Sign In
              </button>
              <button
                type="button"
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg text-white"
                style={{
                  background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                  boxShadow: "0 4px 12px rgba(79,70,229,0.3)"
                }}
              >
                Sign Up
              </button>
            </div>

            <div className="p-7 pt-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Create Vendor Account</h2>
              <p className="text-sm text-slate-400 mb-5">
                Sign up instantly with Auth0 SSO, or fill the form below
              </p>

              {/* Direct Social SSO buttons */}
              <div className="space-y-2.5 mb-5">
                <button
                  type="button"
                  onClick={() => handleSocialSignUp("google-oauth2")}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl font-medium text-sm text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 shadow-sm"
                >
                  <GoogleIcon />
                  <span>Sign up with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialSignUp("windowslive")}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl font-medium text-sm text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 shadow-sm"
                >
                  <MicrosoftIcon />
                  <span>Sign up with Microsoft</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialSignUp("github")}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl font-medium text-sm text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 shadow-sm"
                >
                  <GithubIcon />
                  <span>Sign up with GitHub</span>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs font-medium text-slate-400">or register manually</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full Name" icon={UserIcon} required>
                    <input type="text" name="name" value={formData.name} placeholder="e.g. John Silva"
                      onChange={handleChange} required className={inputClass} />
                  </Field>
                  <Field label="Username" icon={IdentificationIcon} required>
                    <input type="text" name="username" value={formData.username} placeholder="e.g. john_silva"
                      onChange={handleChange} required className={inputClass} />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Business / Organization" icon={BuildingStorefrontIcon} required>
                    <input type="text" name="business_name" value={formData.business_name} placeholder="e.g. Sarasavi Publishers"
                      onChange={handleChange} required className={inputClass} />
                  </Field>
                  <Field label="Contact Number" icon={PhoneIcon} required>
                    <input type="tel" name="contact_number" value={formData.contact_number} placeholder="e.g. +94 77 123 4567"
                      onChange={handleChange} required className={inputClass} />
                  </Field>
                </div>

                <Field label="Email Address" icon={EnvelopeIcon} required>
                  <input type="email" name="email" value={formData.email} placeholder="e.g. vendor@example.com"
                    onChange={handleChange} required className={inputClass} />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Password" icon={LockClosedIcon} required>
                    <input type="password" name="password" value={formData.password} placeholder="At least 6 characters"
                      onChange={handleChange} required minLength={6} className={inputClass} />
                  </Field>
                  <Field label="Confirm Password" icon={LockClosedIcon} required>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} placeholder="Re-enter password"
                      onChange={handleChange} required minLength={6} className={inputClass} />
                  </Field>
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
                      Creating Account...
                    </span>
                  ) : "Create Account"}
                </button>
              </form>

              <p className="text-center text-sm text-slate-400 mt-5">
                Already registered?{" "}
                <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                  Sign In here
                </Link>
              </p>

              <div className="flex items-center justify-center gap-1.5 mt-5 pt-5 border-t border-slate-100">
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

export default RegisterPage;
