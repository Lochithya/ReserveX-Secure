import React, { useContext } from "react";
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
    AtSign
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

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
    };

    const formattedCreatedDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
        : "Registered Vendor";

    return (
        <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-12 px-6 sm:px-12 lg:px-24 flex items-center justify-center">
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 flex flex-col md:flex-row">

                {/* Left Header Sidebar */}
                <div className="md:w-1/3 bg-gradient-to-br from-blue-600 to-indigo-700 p-10 text-white flex flex-col items-center justify-center text-center relative overflow-hidden">
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="w-28 h-28 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 mx-auto shadow-inner border border-white/20">
                            <UserCircle size={72} strokeWidth={1.5} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight mb-1">
                            {user.name || user.businessName || "Vendor"}
                        </h2>
                        <p className="text-blue-200 text-sm font-medium mb-3">
                            @{user.username || "vendor"}
                        </p>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/10 mb-6">
                            <ShieldCheck size={14} className="text-green-300" />
                            <span className="uppercase tracking-wider">
                                {user.role?.replace("ROLE_", "") || "VENDOR"}
                            </span>
                        </div>

                        <p className="text-blue-100 text-xs max-w-[220px] mx-auto opacity-90 leading-relaxed">
                            Official vendor account for ReserveX Stall Reservations.
                        </p>
                    </div>
                </div>

                {/* Right Content Profile Details */}
                <div className="md:w-2/3 p-8 sm:p-12 bg-white">
                    <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
                        <div>
                            <h3 className="text-2xl font-extrabold text-slate-800">Account Profile</h3>
                            <p className="text-slate-500 text-sm mt-1">
                                Your registered business and vendor contact details.
                            </p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-y-6 gap-x-8 mb-10">

                        <ProfileDetail
                            icon={<User />}
                            label="Full Name"
                            value={user.name}
                        />

                        <ProfileDetail
                            icon={<AtSign />}
                            label="Username"
                            value={user.username ? `@${user.username}` : null}
                        />

                        <ProfileDetail
                            icon={<Briefcase />}
                            label="Organization / Business"
                            value={user.businessName}
                        />

                        <ProfileDetail
                            icon={<Mail />}
                            label="Email Address"
                            value={user.email}
                        />

                        <ProfileDetail
                            icon={<Phone />}
                            label="Contact Number"
                            value={user.contactNumber}
                        />

                        <ProfileDetail
                            icon={<Bookmark />}
                            label="Current Bookings"
                            value={`${user.noOfCurrentBookings ?? 0} Stall(s)`}
                        />

                        <ProfileDetail
                            icon={<CalendarDays />}
                            label="Member Since"
                            value={formattedCreatedDate}
                        />
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-4">
                        <button
                            onClick={() => navigate("/home")}
                            className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors pointer shadow-sm"
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-2.5 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors border border-red-100 shadow-sm"
                        >
                            Sign Out
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

const ProfileDetail = ({ icon, label, value }) => (
    <div className="flex items-start gap-3.5">
        <div className="mt-0.5 flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50/80 border border-blue-100 text-blue-600 shrink-0">
            {React.cloneElement(icon, { size: 18, strokeWidth: 2 })}
        </div>
        <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                {label}
            </p>
            <p className="text-slate-800 font-semibold text-sm whitespace-pre-line">
                {value || "Not provided"}
            </p>
        </div>
    </div>
);

export default ProfilePage;
