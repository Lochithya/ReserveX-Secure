import { useState } from "react";
import { registerUser } from "../services/auth.service";
import { useNavigate, Link } from "react-router-dom";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  IdentificationIcon
} from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    business_name: "",
    email: "",
    contact_number: "",
    password: "",
    confirmPassword: ""
  });

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await registerUser(formData);
      toast.success(response.message || "Account created successfully! Please sign in.");
      navigate("/login");
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
          ReserveX Stall Reservation Platform
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">Vendor Registration</h1>
        <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm">
          Register your business to reserve stalls, manage bookings, and showcase at exhibitions and events.
        </p>
      </div>

      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="flex-1 py-3.5 text-sm font-semibold text-slate-500 hover:text-blue-600 transition text-center"
          >
            Sign In
          </button>
          <button
            type="button"
            className="flex-1 py-3.5 text-sm font-semibold border-b-2 border-blue-600 text-blue-600 bg-blue-50/40 text-center"
          >
            Sign Up
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">Create Vendor Account</h2>
            <p className="text-xs text-slate-500 mt-1">
              Please fill in all the required details to create your official vendor profile.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    <UserIcon className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    placeholder="e.g. John Silva"
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    <IdentificationIcon className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    placeholder="e.g. john_silva"
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Business Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Business / Organization Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    <BuildingStorefrontIcon className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    name="business_name"
                    value={formData.business_name}
                    placeholder="e.g. Sarasavi Publishers / Apex Retail"
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    <PhoneIcon className="h-5 w-5" />
                  </span>
                  <input
                    type="tel"
                    name="contact_number"
                    value={formData.contact_number}
                    placeholder="e.g. +94 77 123 4567"
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  placeholder="e.g. vendor@example.com"
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    <LockClosedIcon className="h-5 w-5" />
                  </span>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    placeholder="At least 6 characters"
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    <LockClosedIcon className="h-5 w-5" />
                  </span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    placeholder="Re-enter password"
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl text-white font-semibold shadow-md transition-all ${
                  isLoading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-blue-500/20"
                }`}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already registered?{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
