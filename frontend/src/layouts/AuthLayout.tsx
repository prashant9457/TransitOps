import { Outlet } from 'react-router-dom';
import { Truck } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#1e1f22] flex items-center justify-center p-4">
      <div className="w-full max-w-[480px]">
        <div className="text-center mb-10 flex flex-col items-center transform transition-all duration-500 hover:scale-105">
          <div className="w-16 h-16 rounded-2xl bg-[#5865f2] text-white flex items-center justify-center font-bold text-2xl mb-6 shadow-[0_0_20px_rgba(88,101,242,0.4)]">
            <Truck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[#f2f3f5] tracking-tight mb-2">TransitOps</h1>
          <p className="text-base text-[#949ba4]">Intelligent Fleet & Transport Management</p>
        </div>
        <div className="bg-[#2b2d31] rounded-2xl border border-[#313338] shadow-2xl overflow-hidden p-8 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:border-[#4f545c]">
          <Outlet />
        </div>
        
        <p className="text-center text-sm text-[#4f545c] mt-10 transition-colors hover:text-[#949ba4]">
          &copy; {new Date().getFullYear()} TransitOps Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
}
