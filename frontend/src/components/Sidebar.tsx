import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Truck,
  UserCog,
  Route as RouteIcon,
  Wrench,
  Fuel,
  Receipt,
  BarChart3,
  Settings,
} from "lucide-react";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/users", label: "Users", icon: Users },
  { to: "/vehicles", label: "Vehicles", icon: Truck },
  { to: "/drivers", label: "Drivers", icon: UserCog },
  { to: "/trips", label: "Trips", icon: RouteIcon },
  { to: "/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/fuel-logs", label: "Fuel Logs", icon: Fuel },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="ts-sidebar">
      <div className="ts-sidebar-header">
        <div className="ts-logo-badge">T</div>
        <span className="ts-logo-text">TransitOps</span>
      </div>

      <nav className="ts-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `ts-nav-item ${isActive ? "active" : ""}`}
          >
            <Icon size={18} className="ts-nav-icon" strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="ts-sidebar-footer">
        <div className="ts-user-avatar">KP</div>
        <div className="ts-user-info">
          <span className="ts-user-name">Krishna</span>
          <span className="ts-user-status">
            <span className="ts-status-dot" />
            Online
          </span>
        </div>
      </div>
    </aside>
  );
}