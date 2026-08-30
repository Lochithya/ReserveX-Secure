import { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import {
  Menu,
  X,
  UserCircle,
  LogOut,
  Store,
  ShieldCheck,
  Sparkles,
  ChevronRight
} from "lucide-react";
import logo from "../assets/logo.jpeg";
import LogoutConfirmModal from "./LogoutConfirmModal";

const NavBar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsOpen(false);
    setShowLogoutModal(false);
  };

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.toLowerCase().startsWith(path.toLowerCase())) return true;
    return false;
  };

  const navLinks = !isAuthenticated
    ? [
        { name: "About Us", path: "/" },
        { name: "Exhibitions", path: "/exhibitions" },
        { name: "Contact Us", path: "/contact" },
      ]
    : [
        { name: "Home", path: "/home" },
        { name: "Exhibitions", path: "/exhibitions" },
        { name: "About Us", path: "/" },
        { name: "Contact Us", path: "/contact" },
      ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl border-b shadow-lg shadow-blue-900/20 transition-all" style={{ background: 'rgba(20, 50, 100, 0.96)', borderColor: 'rgba(59,130,246,0.18)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* ── Brand Logo ── */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-blue-500/20 border border-white/20 group-hover:scale-105 transition-transform duration-300">
              <img
                src={logo}
                alt="ReserveX Logo"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-white text-xl sm:text-2xl font-black tracking-tight group-hover:text-blue-400 transition-colors">
                  ReserveX
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Secure
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase -mt-0.5 hidden sm:block">
                Stall Management Portal
              </span>
            </div>
          </Link>

          {/* ── Desktop Navigation Links ── */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path + link.name}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-[15px] font-semibold transition-all duration-200 ${
                  isActive(link.path)
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* ── Desktop Right Actions ── */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl text-[15px] font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[15px] font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-900/40 hover:shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <span>Register</span>
                  <ChevronRight size={15} />
                </Link>
              </>
            ) : (
              <>
                {/* Exhibition discovery CTA */}
                <Link
                  to="/exhibitions"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm sm:text-[15px] font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <Store size={16} />
                  <span>Explore Exhibitions</span>
                </Link>

                {/* Profile Pill */}
                <Link
                  to="/profile"
                  className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border transition-all duration-200 ${
                    isActive("/profile")
                      ? "bg-blue-600/20 border-blue-500/40 text-white"
                      : "bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-slate-200 hover:text-white"
                  }`}
                  aria-label="User Profile"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-inner">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "V"}
                  </div>

                  <div className="flex flex-col text-left pr-1 max-w-[120px]">
                    <span className="text-xs font-bold text-white truncate leading-tight">
                      {user?.businessName || user?.name || "Vendor"}
                    </span>
                    <span className="text-[10px] text-blue-300 flex items-center gap-1 font-medium leading-none mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {user?.role?.replace("ROLE_", "") || "VENDOR"}
                    </span>
                  </div>
                </Link>

                {/* Sign Out Button */}
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger Menu Button ── */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && (
              <Link
                to="/profile"
                className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold"
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : "V"}
              </Link>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>

      {/* ── Mobile Dropdown Menu ── */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-6 py-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          
          {isAuthenticated && user && (
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : "V"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.name || user.businessName}</p>
                <p className="text-xs text-blue-300">@{user.username || "vendor"} • {user.role?.replace("ROLE_", "") || "VENDOR"}</p>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.path + link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive(link.path)
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2.5">
            {!isAuthenticated ? (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="py-2.5 px-4 text-center rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="py-2.5 px-4 text-center rounded-xl text-xs font-bold text-white bg-blue-600"
                >
                  Register
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/exhibitions"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-900/40"
                >
                  <Store size={16} />
                  <span>Explore Exhibitions</span>
                </Link>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 border border-slate-700/80"
                  >
                    <UserCircle size={15} />
                    <span>My Profile</span>
                  </Link>

                  <button
                    onClick={() => {
                      setShowLogoutModal(true);
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-red-300 bg-red-500/10 border border-red-500/20"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </header>
  );
};

export default NavBar;
