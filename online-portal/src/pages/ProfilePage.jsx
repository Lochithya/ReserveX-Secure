import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import {
  UserCircle,
  User,
  Briefcase,
  Mail,
  Phone,
  ShieldCheck,
  CalendarDays,
  Bookmark,
  AtSign,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  ShieldAlert,
  Edit3,
  ExternalLink,
  Ban
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import LogoutConfirmModal from "../components/LogoutConfirmModal";
import { updateUserProfile, changePassword } from "../services/auth.service";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { user, logout, refreshUser, auth0IsAuthenticated, auth0User } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'security'

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    username: "",
    businessName: "",
    contactNumber: ""
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form state (for manual accounts)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Determine if this is an OIDC account (passwordless) or manual account
  const isOidcAccount = Boolean(
    user?.authProvider === "auth0" ||
    user?.hasPassword === false ||
    auth0IsAuthenticated ||
    auth0User
  );

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        username: user.username || "",
        businessName: user.businessName || "",
        contactNumber: user.contactNumber || ""
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/");
    setShowLogoutModal(false);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }
    if (!profileForm.username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }
    if (!profileForm.businessName.trim()) {
      toast.error("Business name cannot be empty");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const updatedData = await updateUserProfile(profileForm);
      await refreshUser();
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (isOidcAccount) {
      toast.error("Password modification is disabled for SSO accounts");
      return;
    }

    if (!passwordForm.currentPassword) {
      toast.error("Current password is required");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await changePassword(passwordForm);
      toast.success("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to change password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const formattedCreatedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Registered Vendor";

  return (
    <>
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-10 px-4 sm:px-8 lg:px-16 flex items-center justify-center">
        <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-200/80 flex flex-col md:flex-row">

          {/* ── Left Sidebar ── */}
          <div className="md:w-1/3 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full filter blur-2xl pointer-events-none" />

            <div className="relative z-10 text-center">
              <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-inner border border-white/20">
                <UserCircle size={64} strokeWidth={1.5} className="text-blue-300" />
              </div>

              <h2 className="text-xl font-bold tracking-tight text-white mb-1">
                {user.name || user.businessName || "Vendor"}
              </h2>
              <p className="text-blue-300 text-xs font-mono mb-4">
                @{user.username || "vendor"}
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[11px] font-semibold border border-emerald-500/30">
                  <ShieldCheck size={13} />
                  {user.role?.replace("ROLE_", "") || "VENDOR"}
                </span>

                {isOidcAccount ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-[11px] font-semibold border border-blue-500/30">
                    <Sparkles size={13} />
                    OIDC / SSO Account
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-700/60 text-slate-300 rounded-full text-[11px] font-semibold border border-slate-600/50">
                    <KeyRound size={13} />
                    Manual Password
                  </span>
                )}
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left text-xs space-y-2 text-slate-300 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Bookings:</span>
                  <span className="font-bold text-white">{user.noOfCurrentBookings ?? 0} / 3 Stalls</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Member Since:</span>
                  <span className="font-bold text-white">{formattedCreatedDate}</span>
                </div>
              </div>
            </div>

            {/* Bottom quick actions */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={() => navigate("/home")}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all text-center"
              >
                Go to Home
              </button>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-all text-center"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* ── Right Content Panel ── */}
          <div className="md:w-2/3 p-8 sm:p-10 bg-white flex flex-col justify-between">
            <div>
              {/* Header Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 mb-6 gap-3">
                <div>
                  <h3 className="text-2xl font-black text-slate-800">Account Settings</h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Manage your credentials, business identity, and security preferences.
                  </p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                  <button
                    type="button"
                    onClick={() => setActiveTab("profile")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === "profile"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Profile Details
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("security")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activeTab === "security"
                        ? "bg-white text-blue-600 shadow-sm"
                        : isOidcAccount
                        ? "text-slate-400 hover:text-slate-600"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {isOidcAccount && <Lock size={12} className="text-slate-400" />}
                    <span>Security &amp; Password</span>
                    {isOidcAccount && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-500 rounded font-normal">
                        SSO
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* ── Tab 1: Profile Form ── */}
              {activeTab === "profile" && (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Full Name <span className="text-orange-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-700 bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Username <span className="text-orange-500">*</span>
                      </label>
                      <div className="relative">
                        <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <input
                          type="text"
                          value={profileForm.username}
                          onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-700 bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">Unique identifier for stall bookings</span>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Organization / Business Name <span className="text-orange-500">*</span>
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <input
                          type="text"
                          value={profileForm.businessName}
                          onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-700 bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Contact Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <input
                          type="tel"
                          value={profileForm.contactNumber}
                          onChange={(e) => setProfileForm({ ...profileForm, contactNumber: e.target.value })}
                          placeholder="e.g. +94 77 123 4567"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-700 bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Email Address (Verified Primary Identity)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-500 bg-slate-100 border border-slate-200 cursor-not-allowed"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Email is locked as the verified account anchor</span>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all disabled:opacity-60"
                    >
                      <Save size={15} />
                      <span>{isUpdatingProfile ? "Saving Changes..." : "Save Profile Details"}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ── Tab 2: Security & Password ── */}
              {activeTab === "security" && (
                <div>
                  {isOidcAccount ? (
                    // ── GREYED OUT / DISABLED SECTION FOR OIDC USERS ──
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50/70 p-6 space-y-6">
                      
                      {/* Notice Banner */}
                      <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/90 flex items-start gap-3.5">
                        <div className="p-2 rounded-lg bg-blue-600 text-white flex-shrink-0">
                          <ShieldCheck size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">
                            Password Management Disabled (OIDC / SSO Account)
                          </h4>
                          <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                            Your account is authenticated via <strong>OpenID Connect Single Sign-On (Google / Microsoft / GitHub)</strong>. 
                            Because authentication is passwordless on ReserveX, local password modifications are disabled.
                          </p>
                        </div>
                      </div>

                      {/* Visually greyed-out & disabled password inputs */}
                      <div className="opacity-40 pointer-events-none select-none space-y-4 filter grayscale">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                            Current Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                              type="password"
                              disabled
                              value="••••••••••••"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-100 border border-slate-300 text-slate-400 cursor-not-allowed"
                            />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                              New Password
                            </label>
                            <div className="relative">
                              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <input
                                type="password"
                                disabled
                                value="••••••••••••"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-100 border border-slate-300 text-slate-400 cursor-not-allowed"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                              Confirm New Password
                            </label>
                            <div className="relative">
                              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <input
                                type="password"
                                disabled
                                value="••••••••••••"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-100 border border-slate-300 text-slate-400 cursor-not-allowed"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Informational Guidance Box */}
                      <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
                        <AlertCircle size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-700">Need to change your login credentials?</span>
                          <p className="text-slate-500 mt-0.5">
                            Please update your password or enable Two-Factor Authentication directly on your identity provider's portal (e.g. your Google Account or Microsoft Account settings).
                          </p>
                        </div>
                      </div>

                    </div>
                  ) : (
                    // ── ACTIVE PASSWORD FORM FOR MANUAL ACCOUNTS ──
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed flex items-start gap-2.5">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-amber-600" />
                        <span>
                          To change your password, provide your current password followed by your new password (min. 6 characters).
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                          Current Password <span className="text-orange-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                          <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            required
                            placeholder="Enter current password"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-700 bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                            New Password <span className="text-orange-500">*</span>
                          </label>
                          <div className="relative">
                            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <input
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                              required
                              minLength={6}
                              placeholder="Min. 6 characters"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-700 bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                            Confirm New Password <span className="text-orange-500">*</span>
                          </label>
                          <div className="relative">
                            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <input
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                              required
                              minLength={6}
                              placeholder="Re-enter new password"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-700 bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-3">
                        <button
                          type="submit"
                          disabled={isUpdatingPassword}
                          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all disabled:opacity-60"
                        >
                          <Lock size={15} />
                          <span>{isUpdatingPassword ? "Updating Password..." : "Update Password"}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};

export default ProfilePage;
