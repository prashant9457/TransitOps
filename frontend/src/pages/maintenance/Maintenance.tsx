import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import type { Vehicle, MaintenanceLog } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Wrench, CheckCircle2, CircleDollarSign, ArrowRight, Play, Check } from 'lucide-react';

export default function Maintenance() {
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN' || role === 'FLEET_MANAGER';
  const queryClient = useQueryClient();

  // Form State
  const [vehicleId, setVehicleId] = useState('');
  const [issue, setIssue] = useState('');
  const [cost, setCost] = useState('');
  const [status, setStatus] = useState<'OPEN' | 'IN_PROGRESS' | 'COMPLETED'>('OPEN');

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: async () => (await api.get('/vehicles')).data,
  });

  const { data: logs, isLoading: logsLoading } = useQuery<MaintenanceLog[]>({
    queryKey: ['maintenance'],
    queryFn: async () => (await api.get('/maintenance')).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/maintenance', data),
    onSuccess: () => {
      toast.success('Maintenance log created');
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setVehicleId(''); setIssue(''); setCost(''); setStatus('OPEN');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create log')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.patch(`/maintenance/${id}`, data),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update status')
  });

  const handleSubmit = () => {
    if (!vehicleId || !issue) return toast.error('Please fill required fields');
    createMutation.mutate({ vehicleId, issue, cost: Number(cost), status });
  };

  const handleStartWork = (id: string) => {
    updateMutation.mutate({ id, data: { status: 'IN_PROGRESS' } });
  };

  const handleCompleteWork = (id: string) => {
    const finalCost = prompt('Enter final repair cost ($):', '0');
    if (finalCost !== null) {
      updateMutation.mutate({ id, data: { status: 'COMPLETED', cost: Number(finalCost) } });
    }
  };

  if (vehiclesLoading || logsLoading) {
    return <div className="p-8 text-[#949ba4] text-base font-medium">Loading maintenance data...</div>;
  }

  const vehiclesInShop = logs?.filter(l => l.status === 'IN_PROGRESS').length || 0;
  const vehiclesRepaired = logs?.filter(l => l.status === 'COMPLETED').length || 0;
  const totalRepairCosts = logs?.filter(l => l.status === 'COMPLETED').reduce((acc, log) => acc + log.cost, 0) || 0;

  return (
    <div className="flex flex-col gap-8 text-[#f2f3f5] min-h-full max-w-7xl">
      
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-4xl font-bold tracking-tight text-[#f2f3f5] mb-2">Maintenance</h1>
        <p className="text-base font-medium text-[#949ba4]">Track vehicle repairs, log service issues, and monitor shop status.</p>
      </div>

      {/* Admin Summary Cards */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <SummaryCard title="Vehicles In Shop" value={vehiclesInShop} icon={<Wrench size={24} />} color="#d97706" />
          <SummaryCard title="Vehicles Repaired" value={vehiclesRepaired} icon={<CheckCircle2 size={24} />} color="#23a559" />
          <SummaryCard title="Total Repair Costs" value={`$${totalRepairCosts.toLocaleString()}`} icon={<CircleDollarSign size={24} />} color="#f23f42" />
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
        
        {/* Left Column: Form */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6">
          <div className="bg-[#2b2d31] rounded-2xl border border-[#313338] shadow-lg p-6">
            <h2 className="text-sm font-bold text-[#f2f3f5] uppercase tracking-wider mb-5">
              {isAdmin ? 'Log New Service Record' : 'Submit Repair Request'}
            </h2>
            
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#949ba4] uppercase tracking-wider">Vehicle</label>
                <select 
                  value={vehicleId} onChange={e => setVehicleId(e.target.value)}
                  className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm font-semibold border border-[#313338] rounded-xl px-4 py-3 focus:outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2] transition-all cursor-pointer"
                >
                  <option value="">Select Vehicle</option>
                  {vehicles?.map((v: Vehicle) => (
                    <option key={v.id} value={v.id}>{v.registrationNumber} - {v.model}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#949ba4] uppercase tracking-wider">Service Type / Issue</label>
                <input 
                  type="text" 
                  value={issue} onChange={e => setIssue(e.target.value)}
                  placeholder="e.g. Engine Check"
                  className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm font-semibold border border-[#313338] rounded-xl px-4 py-3 focus:outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2] transition-all"
                />
              </div>

              {isAdmin && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#949ba4] uppercase tracking-wider">Estimated Cost</label>
                  <input 
                    type="number" 
                    value={cost} onChange={e => setCost(e.target.value)}
                    placeholder="0"
                    className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm font-semibold border border-[#313338] rounded-xl px-4 py-3 focus:outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2] transition-all"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#949ba4] uppercase tracking-wider">Initial Status</label>
                <select 
                  value={status} onChange={e => setStatus(e.target.value as any)}
                  disabled={!isAdmin}
                  className={`w-full bg-[#1e1f22] text-[#dbdee1] text-sm font-semibold border border-[#313338] rounded-xl px-4 py-3 focus:outline-none focus:border-[#5865f2] transition-all cursor-pointer ${!isAdmin ? 'opacity-50' : ''}`}
                >
                  <option value="OPEN">Open (Requested)</option>
                  {isAdmin && <option value="IN_PROGRESS">In Progress (To Shop)</option>}
                  {isAdmin && <option value="COMPLETED">Completed (Available)</option>}
                </select>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="w-full bg-[#5865f2] hover:bg-[#4752c4] hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(88,101,242,0.4)] text-white px-4 py-3.5 rounded-xl text-base font-bold transition-all mt-4 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isAdmin ? 'Save Service Record' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Service Log List */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-[#2b2d31] rounded-2xl border border-[#313338] shadow-lg overflow-hidden">
            <div className="px-8 py-6 border-b border-[#313338] flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#f2f3f5]">Service & Repair History</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1e1f22]/60 border-b border-[#313338] text-xs font-bold text-[#949ba4] uppercase tracking-wider">
                    <th className="px-8 py-5">Vehicle</th>
                    <th className="px-8 py-5">Issue / Service</th>
                    <th className="px-8 py-5">Cost</th>
                    <th className="px-8 py-5 text-right">Status & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#313338] text-base text-[#dbdee1]">
                  {logs?.length === 0 ? (
                    <tr><td colSpan={4} className="px-8 py-10 text-center text-[#949ba4] font-medium text-sm">No maintenance records found.</td></tr>
                  ) : (
                    logs?.map((log: MaintenanceLog) => (
                      <tr key={log.id} className="hover:bg-[#313338]/40 transition-colors group">
                        <td className="px-8 py-5 font-bold text-[#f2f3f5]">{log.vehicle?.registrationNumber || 'N/A'}</td>
                        <td className="px-8 py-5 font-medium">{log.issue}</td>
                        <td className="px-8 py-5 font-mono text-sm">${log.cost.toLocaleString()}</td>
                        <td className="px-8 py-5 text-right flex items-center justify-end gap-4">
                          <StatusBadge status={log.status} />
                          
                          {/* Admin Actions */}
                          {isAdmin && log.status === 'OPEN' && (
                            <button 
                              onClick={() => handleStartWork(log.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d97706]/10 text-[#d97706] hover:bg-[#d97706] hover:text-white rounded-lg text-xs font-bold transition-all duration-300"
                              title="Start Work (Move to Shop)"
                            >
                              <Play size={14} /> Start
                            </button>
                          )}
                          {isAdmin && log.status === 'IN_PROGRESS' && (
                            <button 
                              onClick={() => handleCompleteWork(log.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#23a559]/10 text-[#23a559] hover:bg-[#23a559] hover:text-white rounded-lg text-xs font-bold transition-all duration-300"
                              title="Complete Repair"
                            >
                              <Check size={14} strokeWidth={3} /> Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, color }: { title: string; value: any; icon: React.ReactNode; color: string }) {
  return (
    <div className="relative bg-[#2b2d31] border border-[#313338] rounded-2xl p-6 flex flex-col justify-between shadow-lg hover:-translate-y-1 hover:shadow-xl hover:border-[#4f545c] transition-all duration-300 overflow-hidden group">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 group-hover:w-2" style={{ backgroundColor: color }}></div>
      <div className="flex items-center justify-between mb-4 ml-2">
        <span className="text-xs font-bold text-[#949ba4] uppercase tracking-wider">{title}</span>
        <span className="text-[#4f545c] transition-colors duration-300 group-hover:text-[#f2f3f5]">{icon}</span>
      </div>
      <div className="text-4xl font-bold text-[#f2f3f5] tracking-tight ml-2">
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let color = 'text-[#dbdee1] bg-[#4f545c] border border-[#4f545c]/50';
  let label = 'Unknown';

  if (status === 'OPEN') {
    color = 'text-[#949ba4] bg-[#313338] border border-[#4f545c]';
    label = 'Requested';
  } else if (status === 'IN_PROGRESS') {
    color = 'text-[#d97706] bg-[#d97706]/10 border border-[#d97706]/30 shadow-[0_0_10px_rgba(217,119,6,0.2)] animate-pulse';
    label = 'In Shop';
  } else if (status === 'COMPLETED') {
    color = 'text-[#23a559] bg-[#23a559]/10 border border-[#23a559]/30';
    label = 'Completed';
  }

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider uppercase ${color}`}>
      {label}
    </span>
  );
}
