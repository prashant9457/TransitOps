import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';

export default function Maintenance() {
  const queryClient = useQueryClient();
  const [vehicleId, setVehicleId] = useState('');
  const [issue, setIssue] = useState('');
  const [cost, setCost] = useState('');
  const [status, setStatus] = useState('OPEN');

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data } = await api.get('/vehicles');
      return data;
    },
  });

  const { data: logs, isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn: async () => {
      const { data } = await api.get('/maintenance');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/maintenance', data),
    onSuccess: () => {
      toast.success('Maintenance log created');
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setVehicleId('');
      setIssue('');
      setCost('');
      setStatus('OPEN');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create log')
  });

  const handleSubmit = () => {
    if (!vehicleId || !issue) return toast.error('Please fill required fields');
    createMutation.mutate({ vehicleId, issue, cost, status });
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-[#1e1f22] text-[#f2f3f5] p-6 gap-12 overflow-y-auto custom-scrollbar">
      
      {/* Left Column: Form & Rules */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6">
        
        {/* Form */}
        <div className="flex flex-col gap-4">
          <h2 className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">LOG SERVICE RECORD</h2>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">VEHICLE</label>
            <select 
              value={vehicleId} onChange={e => setVehicleId(e.target.value)}
              className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2 focus:outline-none focus:border-[#d97706] transition-colors"
            >
              <option value="">Select Vehicle</option>
              {vehicles?.map((v: any) => (
                <option key={v.id} value={v.id}>{v.registrationNumber} - {v.model}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">SERVICE TYPE</label>
            <input 
              type="text" 
              value={issue} onChange={e => setIssue(e.target.value)}
              placeholder="e.g. Oil Change"
              className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2 focus:outline-none focus:border-[#d97706] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">COST</label>
            <input 
              type="number" 
              value={cost} onChange={e => setCost(e.target.value)}
              placeholder="0"
              className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2 focus:outline-none focus:border-[#d97706] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">STATUS</label>
            <select 
              value={status} onChange={e => setStatus(e.target.value)}
              className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2 focus:outline-none focus:border-[#d97706] transition-colors"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress (To Shop)</option>
              <option value="COMPLETED">Completed (Available)</option>
            </select>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="w-full bg-[#d97706] hover:bg-[#b45309] text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors mt-2 disabled:opacity-50"
          >
            Save
          </button>
        </div>

        {/* Rules Section */}
        <div className="flex flex-col gap-4 mt-4 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#23a559] w-20">Available</span>
            <span className="text-[#949ba4] flex-1 text-center">———— creating active record ————&gt;</span>
            <span className="text-[#d97706] w-20 text-right">In Shop</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#d97706] w-20">In Shop</span>
            <span className="text-[#949ba4] flex-1 text-center">———— closing record (not retired) ————&gt;</span>
            <span className="text-[#23a559] w-20 text-right">Available</span>
          </div>
          <div className="text-[#d97706] mt-2 font-sans italic opacity-90">
            Note: In Shop vehicles are removed from the dispatch pool.
          </div>
        </div>

      </div>

      {/* Right Column: Service Log */}
      <div className="flex-1 flex flex-col gap-4">
        <h2 className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">SERVICE LOG</h2>
        
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#313338] text-[10px] font-medium text-[#949ba4] uppercase tracking-wider">
                <th className="py-4 pr-4">VEHICLE</th>
                <th className="py-4 px-4">SERVICE</th>
                <th className="py-4 px-4">COST</th>
                <th className="py-4 pl-4">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#313338] text-sm text-[#dbdee1]">
              {isLoading ? (
                <tr><td colSpan={4} className="py-4 text-[#949ba4]">Loading...</td></tr>
              ) : logs?.length === 0 ? (
                <tr><td colSpan={4} className="py-4 text-[#949ba4]">No records found.</td></tr>
              ) : (
                logs?.map((log: any) => (
                  <tr key={log.id} className="hover:bg-[#2b2d31]/40 transition-colors">
                    <td className="py-4 pr-4 font-mono">{log.vehicle?.registrationNumber || 'N/A'}</td>
                    <td className="py-4 px-4">{log.issue}</td>
                    <td className="py-4 px-4">{log.cost.toLocaleString()}</td>
                    <td className="py-4 pl-4">
                      <span className={`inline-block px-3 py-1.5 rounded-md text-xs font-medium text-white w-24 text-center ${
                        log.status === 'COMPLETED' ? 'bg-[#23a559]' : 'bg-[#d97706]'
                      }`}>
                        {log.status === 'IN_PROGRESS' ? 'In Shop' : log.status === 'COMPLETED' ? 'Completed' : 'Open'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
