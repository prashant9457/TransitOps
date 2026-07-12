import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Settings as SettingsType } from '@/types';

export default function Settings() {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [depotName, setDepotName] = useState('Gandhinagar Depot GJ4');
  const [currency, setCurrency] = useState('INR (Rs)');
  const [distanceUnit, setDistanceUnit] = useState('Kilometers');

  const { data: settings, isLoading, isError } = useQuery<SettingsType>({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await api.get('/settings');
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setDepotName(settings.depotName || 'Gandhinagar Depot GJ4');
      setCurrency(settings.currency || 'INR (Rs)');
      setDistanceUnit(settings.distanceUnit || 'Kilometers');
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: { depotName: string, currency: string, distanceUnit: string }) => api.patch('/settings', data),
    onSuccess: () => {
      toast.success('Settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update settings')
  });

  const handleSave = () => {
    if (role !== 'ADMIN') {
      toast.error('Only ADMIN can update settings');
      return;
    }
    updateMutation.mutate({ depotName, currency, distanceUnit });
  };

  if (isLoading) {
    return <div className="p-6 text-[#949ba4] text-sm">Loading settings...</div>;
  }

  if (isError) {
    return <div className="p-6 text-[#f23f42] text-sm">Error loading settings. Please try again.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1f22] text-[#f2f3f5] p-6 gap-8 overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* General Settings Column */}
        <div className="flex flex-col gap-6">
          <h2 className="text-sm font-bold text-[#949ba4] uppercase tracking-wider">GENERAL</h2>
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">DEPOT NAME</label>
            <input 
              type="text" 
              value={depotName}
              onChange={(e) => setDepotName(e.target.value)}
              className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-4 py-2.5 focus:outline-none focus:border-[#5865f2] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">CURRENCY</label>
            <input 
              type="text" 
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-4 py-2.5 focus:outline-none focus:border-[#5865f2] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">DISTANCE UNIT</label>
            <input 
              type="text" 
              value={distanceUnit}
              onChange={(e) => setDistanceUnit(e.target.value)}
              className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-4 py-2.5 focus:outline-none focus:border-[#5865f2] transition-colors"
            />
          </div>

          <div className="pt-2">
            <button 
              onClick={handleSave}
              disabled={updateMutation.isPending || role !== 'ADMIN'}
              className="bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white px-6 py-2.5 rounded-md text-sm font-medium transition-colors"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save changes'}
            </button>
            {role !== 'ADMIN' && <div className="text-xs text-[#f23f42] mt-2">Only Admins can change global settings.</div>}
          </div>
        </div>

        {/* RBAC Table Column */}
        <div className="flex flex-col gap-6">
          <h2 className="text-sm font-bold text-[#949ba4] uppercase tracking-wider">ROLE-BASED ACCESS (RBAC)</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#dbdee1]">
              <thead>
                <tr className="border-b border-[#313338]">
                  <th className="py-3 pr-4 text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">ROLE</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#949ba4] uppercase tracking-wider text-center">FLEET</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#949ba4] uppercase tracking-wider text-center">DRIVERS</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#949ba4] uppercase tracking-wider text-center">TRIPS</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#949ba4] uppercase tracking-wider text-center">FUEL/EXP.</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#949ba4] uppercase tracking-wider text-center">ANALYTICS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#313338]">
                {/* Fleet Manager */}
                <tr className="hover:bg-[#2b2d31]/40 transition-colors">
                  <td className="py-4 pr-4 font-medium">Fleet Manager</td>
                  <td className="py-4 px-4 text-center"><Check size={16} className="mx-auto text-[#dbdee1]" /></td>
                  <td className="py-4 px-4 text-center"><Check size={16} className="mx-auto text-[#dbdee1]" /></td>
                  <td className="py-4 px-4 text-center text-[#949ba4]">—</td>
                  <td className="py-4 px-4 text-center text-[#949ba4]">—</td>
                  <td className="py-4 px-4 text-center"><Check size={16} className="mx-auto text-[#dbdee1]" /></td>
                </tr>
                {/* Dispatcher */}
                <tr className="hover:bg-[#2b2d31]/40 transition-colors">
                  <td className="py-4 pr-4 font-medium">Dispatcher</td>
                  <td className="py-4 px-4 text-center text-xs">View</td>
                  <td className="py-4 px-4 text-center text-[#949ba4]">—</td>
                  <td className="py-4 px-4 text-center"><Check size={16} className="mx-auto text-[#dbdee1]" /></td>
                  <td className="py-4 px-4 text-center text-[#949ba4]">—</td>
                  <td className="py-4 px-4 text-center text-[#949ba4]">—</td>
                </tr>
                {/* Safety Officer */}
                <tr className="hover:bg-[#2b2d31]/40 transition-colors">
                  <td className="py-4 pr-4 font-medium">Safety Officer</td>
                  <td className="py-4 px-4 text-center text-[#949ba4]">—</td>
                  <td className="py-4 px-4 text-center"><Check size={16} className="mx-auto text-[#dbdee1]" /></td>
                  <td className="py-4 px-4 text-center text-xs">View</td>
                  <td className="py-4 px-4 text-center text-[#949ba4]">—</td>
                  <td className="py-4 px-4 text-center text-[#949ba4]">—</td>
                </tr>
                {/* Financial Analyst */}
                <tr className="hover:bg-[#2b2d31]/40 transition-colors">
                  <td className="py-4 pr-4 font-medium">Financial Analyst</td>
                  <td className="py-4 px-4 text-center text-xs">View</td>
                  <td className="py-4 px-4 text-center text-[#949ba4]">—</td>
                  <td className="py-4 px-4 text-center text-[#949ba4]">—</td>
                  <td className="py-4 px-4 text-center"><Check size={16} className="mx-auto text-[#dbdee1]" /></td>
                  <td className="py-4 px-4 text-center"><Check size={16} className="mx-auto text-[#dbdee1]" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
