import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">TransitOps</h1>
          <p className="text-gray-500">Smart Transport Operations Platform</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
