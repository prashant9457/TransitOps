import { Outlet, Link, useNavigate } from 'react-router-dom';
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
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white shadow-md flex-shrink-0 flex flex-col">
        <div className="p-4 font-bold text-xl text-blue-600">TransitOps</div>
        <nav className="mt-6 px-4 flex-1">
          <ul>
            {allowedSidebarItems.map((item) => (
              <li key={item.path} className="mb-2">
                <Link to={item.path} className="text-gray-700 hover:text-blue-600 block py-2">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <button 
            onClick={handleLogout}
            className="w-full text-left text-red-600 hover:text-red-700 font-medium py-2"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-gray-900">{user?.name}</span>
              <span className="text-xs text-gray-500">{role}</span>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full text-white flex items-center justify-center font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
