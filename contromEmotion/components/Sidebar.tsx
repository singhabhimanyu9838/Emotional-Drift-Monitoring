import React from "react";
import {
  LayoutDashboard,
  MessageCircle,
  Phone,
  Settings,
  Activity,
  ShieldCheck,
  BookText,
  Info,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  onNavigate?: () => void; // 👈 Optional close function
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: MessageCircle, label: "Chat Therapy", path: "/chat" },
    { icon: BookText, label: "Journal", path: "/journal" },
    { icon: Phone, label: "Voice Sessions", path: "/voice" },
    { icon: Activity, label: "Wellness Path", path: "/wellness" },
    { icon: Info, label: "About Sonia", path: "/about" },
    { icon: Settings, label: "Preferences", path: "/settings" },
  ];

  return (
    <div className="w-64 glass-sidebar flex flex-col h-full sticky top-0 z-50">
      {/* Logo */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
          S
        </div>
        <span className="font-bold text-white text-xl tracking-tight">
          Sonia
        </span>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate} // 👈 CLOSE SIDEBAR ON MOBILE
            className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative ${
              location.pathname === item.path
                ? "bg-white/10 text-white font-semibold"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            {location.pathname === item.path && (
              <div className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
            )}

            <item.icon
              className={`w-5 h-5 transition-colors ${
                location.pathname === item.path
                  ? "text-indigo-400"
                  : "text-slate-500 group-hover:text-slate-300"
              }`}
            />

            {item.label}
          </Link>
        ))}
      </nav>

      {/* Footer Section */}
      <div className="p-6">
        <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
              Sonia Vault
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Your emotional data is encrypted on secure external servers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
