import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { sidebarConfig } from './SidebarConfig';

export default function DashboardLayout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const allowedSidebarItems = sidebarConfig.filter((item) => role && item.roles.includes(role));

  return (
    <div className="flex min-h-screen bg-[#313338]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2b2d31] flex-shrink-0 flex flex-col border-r border-[#1e1f22]">
        <div className="p-4 flex items-center gap-2.5 shadow-[0_1px_0_rgba(0,0,0,0.2)]">
          <div className="w-8 h-8 rounded-[10px] bg-[#5865f2] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            T
          </div>
          <span className="font-bold text-base text-[#f2f3f5] tracking-wide">TransitOps</span>
        </div>

        <nav className="mt-3 px-2 flex-1 overflow-y-auto">
          <ul className="flex flex-col gap-0.5">
            {allowedSidebarItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-2.5 py-2 rounded-md text-[15px] font-medium transition-colors ${
                      isActive
                        ? 'bg-[#5865f2]/15 text-[#f2f3f5]'
                        : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-3 bg-[#1e1f22] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#5865f2] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col leading-tight flex-1 min-w-0">
            <span className="text-[13px] font-semibold text-[#f2f3f5] truncate">{user?.name}</span>
            <span className="text-[11px] text-[#949ba4]">{role}</span>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="text-[#949ba4] hover:text-[#f23f42] text-xs font-medium flex-shrink-0"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto text-[#dbdee1]">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-[#f2f3f5]">Dashboard</h1>
        </header>
        <Outlet />
      </main>
    </div>
  );
}