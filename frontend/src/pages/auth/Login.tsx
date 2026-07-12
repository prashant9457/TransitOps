import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogIn, UserPlus } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  contactNumber: z.string().min(10, 'Valid contact number is required'),
  licenseNumber: z.string().min(5, 'Valid license number is required'),
  licenseCategory: z.string().min(1, 'License category is required'),
  licenseExpiry: z.string().min(1, 'License expiry date is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const { register: registerLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const { register: registerSignup, handleSubmit: handleRegisterSubmit, formState: { errors: registerErrors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      login(data.accessToken, data.user);
      navigate('/dashboard');
      toast.success('Signed in successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      login(data.accessToken, data.user);
      navigate('/dashboard');
      toast.success('Registration successful. Welcome!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });

  const onLogin = (data: LoginFormValues) => loginMutation.mutate(data);
  const onRegister = (data: RegisterFormValues) => registerMutation.mutate({ ...data, role: 'DRIVER' });

  return (
    <div className="w-full">
      <div className="flex bg-[#1e1f22] rounded-xl p-1.5 mb-8 shadow-inner">
        <button 
          onClick={() => setActiveTab('login')}
          className={`flex-1 flex justify-center items-center gap-2 text-sm font-semibold py-3 rounded-lg transition-all duration-300 ${activeTab === 'login' ? 'bg-[#5865f2] text-white shadow-md transform scale-[1.02]' : 'text-[#949ba4] hover:text-[#f2f3f5] hover:bg-[#313338]'}`}
        >
          <LogIn size={18} /> Sign In
        </button>
        <button 
          onClick={() => setActiveTab('register')}
          className={`flex-1 flex justify-center items-center gap-2 text-sm font-semibold py-3 rounded-lg transition-all duration-300 ${activeTab === 'register' ? 'bg-[#5865f2] text-white shadow-md transform scale-[1.02]' : 'text-[#949ba4] hover:text-[#f2f3f5] hover:bg-[#313338]'}`}
        >
          <UserPlus size={18} /> New Driver
        </button>
      </div>

      <div className="transition-all duration-300">
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#949ba4] uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                {...registerLogin('email')}
                className="block w-full bg-[#1e1f22] text-[#dbdee1] text-base border border-[#313338] rounded-xl px-4 py-3 outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2] transition-all" 
                placeholder="driver@transitops.com" 
              />
              {loginErrors.email && <p className="text-[#f23f42] text-sm mt-1">{loginErrors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-[#949ba4] uppercase tracking-wider">Password</label>
                <a href="#" className="text-sm text-[#5865f2] hover:text-[#4752c4] font-medium transition-colors">Forgot password?</a>
              </div>
              <input 
                type="password" 
                {...registerLogin('password')}
                className="block w-full bg-[#1e1f22] text-[#dbdee1] text-base border border-[#313338] rounded-xl px-4 py-3 outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2] transition-all" 
                placeholder="••••••••" 
              />
              {loginErrors.password && <p className="text-[#f23f42] text-sm mt-1">{loginErrors.password.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={loginMutation.isPending}
              className="w-full bg-[#5865f2] text-white py-3.5 mt-4 rounded-xl hover:bg-[#4752c4] hover:shadow-[0_0_15px_rgba(88,101,242,0.4)] font-bold text-base transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loginMutation.isPending ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>
        )}

        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  {...registerSignup('name')}
                  className="block w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-xl px-3 py-2.5 outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2] transition-all" 
                />
                {registerErrors.name && <p className="text-[#f23f42] text-xs">{registerErrors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wider">Contact</label>
                <input 
                  type="text" 
                  {...registerSignup('contactNumber')}
                  className="block w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-xl px-3 py-2.5 outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2] transition-all" 
                />
                {registerErrors.contactNumber && <p className="text-[#f23f42] text-xs">{registerErrors.contactNumber.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  {...registerSignup('email')}
                  className="block w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-xl px-3 py-2.5 outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2] transition-all" 
                />
                {registerErrors.email && <p className="text-[#f23f42] text-xs">{registerErrors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wider">Password</label>
                <input 
                  type="password" 
                  {...registerSignup('password')}
                  className="block w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-xl px-3 py-2.5 outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2] transition-all" 
                />
                {registerErrors.password && <p className="text-[#f23f42] text-xs">{registerErrors.password.message}</p>}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-[#313338]">
              <h4 className="text-xs font-bold text-[#949ba4] uppercase tracking-wider mb-3">License & Credential Details</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <input 
                    type="text" 
                    {...registerSignup('licenseNumber')}
                    placeholder="License ID"
                    className="block w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-xl px-3 py-2.5 outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2] transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <select 
                    {...registerSignup('licenseCategory')}
                    className="block w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-xl px-3 py-2.5 outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2] transition-all" 
                  >
                    <option value="">Category</option>
                    <option value="LMV">LMV</option>
                    <option value="HMV">HMV</option>
                    <option value="TRANS">TRANS</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <input 
                    type="date" 
                    {...registerSignup('licenseExpiry')}
                    className="block w-full bg-[#1e1f22] text-[#949ba4] text-sm border border-[#313338] rounded-xl px-3 py-2.5 outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2] transition-all" 
                  />
                </div>
              </div>
              {(registerErrors.licenseNumber || registerErrors.licenseCategory || registerErrors.licenseExpiry) && (
                <p className="text-[#f23f42] text-xs mt-2 font-medium">Please fill all license details correctly.</p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={registerMutation.isPending}
              className="w-full bg-[#23a559] text-white py-3.5 mt-6 rounded-xl hover:bg-[#1c8446] hover:shadow-[0_0_15px_rgba(35,165,89,0.4)] font-bold text-base transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {registerMutation.isPending ? 'Registering...' : 'Complete Registration'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
