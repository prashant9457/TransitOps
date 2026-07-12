import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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
      toast.success('Registration successful. Welcome to TransitOps!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });

  const onLogin = (data: LoginFormValues) => loginMutation.mutate(data);
  const onRegister = (data: RegisterFormValues) => registerMutation.mutate({ ...data, role: 'DRIVER' });

  return (
    <div className="w-full">
      <div className="flex gap-4 mb-6 border-b border-[#313338] pb-4">
        <button 
          onClick={() => setActiveTab('login')}
          className={`flex-1 text-sm font-semibold uppercase tracking-wider pb-2 transition-colors ${activeTab === 'login' ? 'text-[#5865f2] border-b-2 border-[#5865f2]' : 'text-[#949ba4] hover:text-[#dbdee1]'}`}
        >
          Sign In
        </button>
        <button 
          onClick={() => setActiveTab('register')}
          className={`flex-1 text-sm font-semibold uppercase tracking-wider pb-2 transition-colors ${activeTab === 'register' ? 'text-[#5865f2] border-b-2 border-[#5865f2]' : 'text-[#949ba4] hover:text-[#dbdee1]'}`}
        >
          New Driver Registration
        </button>
      </div>

      {activeTab === 'login' && (
        <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wider mb-1.5">Email Address</label>
            <input 
              type="email" 
              {...registerLogin('email')}
              className="block w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-4 py-2.5 focus:outline-none focus:border-[#5865f2] transition-colors" 
              placeholder="admin@transitops.com" 
            />
            {loginErrors.email && <p className="text-[#f23f42] text-xs mt-1">{loginErrors.email.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wider mb-1.5">Password</label>
            <input 
              type="password" 
              {...registerLogin('password')}
              className="block w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-4 py-2.5 focus:outline-none focus:border-[#5865f2] transition-colors" 
              placeholder="••••••••" 
            />
            {loginErrors.password && <p className="text-[#f23f42] text-xs mt-1">{loginErrors.password.message}</p>}
          </div>
          <button 
            type="submit" 
            disabled={loginMutation.isPending}
            className="block w-full bg-[#5865f2] text-white py-2.5 mt-2 rounded-md hover:bg-[#4752c4] font-medium text-sm text-center transition-colors disabled:opacity-50"
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      )}

      {activeTab === 'register' && (
        <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wider mb-1.5">Full Name</label>
              <input 
                type="text" 
                {...registerSignup('name')}
                className="block w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-4 py-2.5 focus:outline-none focus:border-[#23a559] transition-colors" 
                placeholder="John Doe" 
              />
              {registerErrors.name && <p className="text-[#f23f42] text-xs mt-1">{registerErrors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wider mb-1.5">Contact</label>
              <input 
                type="text" 
                {...registerSignup('contactNumber')}
                className="block w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-4 py-2.5 focus:outline-none focus:border-[#23a559] transition-colors" 
                placeholder="+91 9876543210" 
              />
              {registerErrors.contactNumber && <p className="text-[#f23f42] text-xs mt-1">{registerErrors.contactNumber.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wider mb-1.5">Email Address</label>
              <input 
                type="email" 
                {...registerSignup('email')}
                className="block w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-4 py-2.5 focus:outline-none focus:border-[#23a559] transition-colors" 
                placeholder="driver@transitops.com" 
              />
              {registerErrors.email && <p className="text-[#f23f42] text-xs mt-1">{registerErrors.email.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wider mb-1.5">Password</label>
              <input 
                type="password" 
                {...registerSignup('password')}
                className="block w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-4 py-2.5 focus:outline-none focus:border-[#23a559] transition-colors" 
                placeholder="••••••••" 
              />
              {registerErrors.password && <p className="text-[#f23f42] text-xs mt-1">{registerErrors.password.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wider mb-1.5">License #</label>
              <input 
                type="text" 
                {...registerSignup('licenseNumber')}
                className="block w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-4 py-2.5 focus:outline-none focus:border-[#23a559] transition-colors" 
                placeholder="GJ-01-XXXX" 
              />
              {registerErrors.licenseNumber && <p className="text-[#f23f42] text-xs mt-1">{registerErrors.licenseNumber.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wider mb-1.5">Category</label>
              <select 
                {...registerSignup('licenseCategory')}
                className="block w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-4 py-2.5 focus:outline-none focus:border-[#23a559] transition-colors" 
              >
                <option value="">Select</option>
                <option value="LMV">LMV (Light)</option>
                <option value="HMV">HMV (Heavy)</option>
                <option value="TRANS">TRANS (Commercial)</option>
              </select>
              {registerErrors.licenseCategory && <p className="text-[#f23f42] text-xs mt-1">{registerErrors.licenseCategory.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wider mb-1.5">Expiry Date</label>
              <input 
                type="date" 
                {...registerSignup('licenseExpiry')}
                className="block w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-4 py-2.5 focus:outline-none focus:border-[#23a559] transition-colors" 
              />
              {registerErrors.licenseExpiry && <p className="text-[#f23f42] text-xs mt-1">{registerErrors.licenseExpiry.message}</p>}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={registerMutation.isPending}
            className="block w-full bg-[#23a559] text-white py-2.5 mt-2 rounded-md hover:bg-[#1f914e] font-medium text-sm text-center transition-colors disabled:opacity-50"
          >
            {registerMutation.isPending ? 'Registering...' : 'Register Driver Account'}
          </button>
        </form>
      )}
    </div>
  );
}
