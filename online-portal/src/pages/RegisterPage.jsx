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

const Auth0Icon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.98 10.277L19.467 2.541a.59.59 0 0 0-.256-.307.6.6 0 0 0-.395-.067.6.6 0 0 0-.356.195L12 10.744 5.54 2.362a.6.6 0 0 0-.356-.195.6.6 0 0 0-.395.067.59.59 0 0 0-.256.307L2.02 10.277a11.96 11.96 0 0 0 4.347 12.35.59.59 0 0 0 .708 0L12 18.995l4.925 3.632a.59.59 0 0 0 .708 0 11.96 11.96 0 0 0 4.347-12.35z" fill="white" />
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

  const handleAuth0SignUp = async () => {
    try {
      await loginWithAuth0({ authorizationParams: { screen_hint: "signup" } });
    } catch (err) {
      toast.error("Failed to redirect to Auth0");
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
              "Manage all reservations from one dashboard",
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

              {/* Auth0 button */}
              <button
                type="button"
                onClick={handleAuth0SignUp}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl font-semibold text-sm mb-5 transition-all duration-200 text-white"
                style={{
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  boxShadow: "0 4px 14px rgba(249,115,22,0.3)"
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(249,115,22,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(249,115,22,0.3)"; }}
              >
                <Auth0Icon />
                <span>Sign up with Auth0 (Instant SSO)</span>
              </button>

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
