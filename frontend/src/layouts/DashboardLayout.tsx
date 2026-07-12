import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { sidebarConfig } from './SidebarConfig';
import { LogOut, Truck } from 'lucide-react';

export default function DashboardLayout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const allowedSidebarItems = sidebarConfig.filter((item) => role && item.roles.includes(role));

  return (
    <div className="flex min-h-screen bg-[#1e1f22]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2b2d31] flex-shrink-0 flex flex-col border-r border-[#1e1f22] shadow-2xl z-10">
        <div className="px-6 py-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5865f2] text-white flex items-center justify-center font-bold shadow-[0_0_15px_rgba(88,101,242,0.4)] flex-shrink-0 transition-transform duration-300 hover:scale-110">
            <Truck size={20} />
          </div>
          <span className="font-bold text-lg text-[#f2f3f5] tracking-wide">TransitOps</span>
        </div>

        <nav className="mt-2 px-3 flex-1 overflow-y-auto">
          <ul className="flex flex-col gap-1">
            {allowedSidebarItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-semibold transition-all duration-300 ${
                      isActive
                        ? 'bg-[#4752c4] text-white shadow-md transform scale-[1.02]'
                        : 'text-[#949ba4] hover:bg-[#313338] hover:text-[#dbdee1] hover:translate-x-1'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-5 bg-[#1e1f22] flex items-center gap-4 mt-auto">
          <div className="w-10 h-10 rounded-full bg-[#313338] text-[#dbdee1] flex items-center justify-center font-bold text-sm flex-shrink-0 border border-[#4f545c]">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col leading-tight flex-1 min-w-0">
            <span className="text-sm font-bold text-[#f2f3f5] truncate">{user?.name}</span>
            <span className="text-xs font-semibold text-[#5865f2] uppercase tracking-wider mt-0.5">{role?.replace('_', ' ')}</span>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2.5 rounded-full text-[#949ba4] hover:text-[#f23f42] hover:bg-[#313338] transition-all duration-300 hover:rotate-12"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-[#1e1f22] p-8">
        <Outlet />
      </main>
    </div>
  );
}