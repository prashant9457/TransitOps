import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export default function Analytics() {
  const { data: vehicles } = useQuery({ queryKey: ['vehicles'], queryFn: async () => (await api.get('/vehicles')).data });
  const { data: fuel } = useQuery({ queryKey: ['fuel'], queryFn: async () => (await api.get('/fuel')).data });
  const { data: expenses } = useQuery({ queryKey: ['expenses'], queryFn: async () => (await api.get('/expenses')).data });
  const { data: trips } = useQuery({ queryKey: ['trips'], queryFn: async () => (await api.get('/trips')).data });

  const totalAcquisitionCost = vehicles?.reduce((acc: number, v: any) => acc + (v.acquisitionCost || 0), 0) || 0;
  const totalFuelCost = fuel?.reduce((acc: number, f: any) => acc + (f.cost || 0), 0) || 0;
  const totalExpensesCost = expenses?.reduce((acc: number, e: any) => acc + (e.amount || 0), 0) || 0;
  const operationalCost = totalFuelCost + totalExpensesCost;
  
  // Mock Revenue based on completed trips ($500 per trip)
  const completedTripsCount = trips?.filter((t: any) => t.status === 'COMPLETED').length || 0;
  const simulatedRevenue = completedTripsCount * 5000;
  
  const roi = totalAcquisitionCost > 0 ? ((simulatedRevenue - operationalCost) / totalAcquisitionCost) * 100 : 0;
  const fleetUtilization = vehicles?.length ? (vehicles.filter((v: any) => v.status === 'ON_TRIP').length / vehicles.length) * 100 : 0;

  return (
    <div className="flex flex-col h-full bg-[#1e1f22] text-[#f2f3f5] p-6 gap-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Fuel Efficiency */}
        <div className="bg-[#1e1f22] border border-[#313338] rounded-md p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5865f2]"></div>
          <div className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider mb-3 ml-2">
            SIMULATED REVENUE
          </div>
          <div className="text-3xl font-light text-[#f2f3f5] ml-2">
            {simulatedRevenue.toLocaleString()}
          </div>
        </div>

        {/* Fleet Utilization */}
        <div className="bg-[#1e1f22] border border-[#313338] rounded-md p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#23a559]"></div>
          <div className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider mb-3 ml-2">
            FLEET UTILIZATION
          </div>
          <div className="text-3xl font-light text-[#f2f3f5] ml-2">
            {fleetUtilization.toFixed(1)}%
          </div>
        </div>

        {/* Operational Cost */}
        <div className="bg-[#1e1f22] border border-[#313338] rounded-md p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#d97706]"></div>
          <div className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider mb-3 ml-2">
            OPERATIONAL COST
          </div>
          <div className="text-3xl font-light text-[#f2f3f5] ml-2">
            {operationalCost.toLocaleString()}
          </div>
        </div>

        {/* Vehicle ROI */}
        <div className="bg-[#1e1f22] border border-[#313338] rounded-md p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#23a559]"></div>
          <div className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider mb-3 ml-2">
            VEHICLE ROI
          </div>
          <div className="text-3xl font-light text-[#f2f3f5] ml-2">
            {roi.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="text-[#949ba4] text-xs font-mono italic opacity-75">
        ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* Monthly Revenue Chart */}
        <div>
          <h2 className="text-sm font-bold text-[#949ba4] uppercase tracking-wider mb-6">MONTHLY REVENUE (SIMULATED)</h2>
          <div className="flex items-end gap-2 h-48 border-b border-[#313338] pb-1">
            <div className="w-1/6 bg-[#5865f2] hover:bg-[#4752c4] transition-colors rounded-t-sm h-[30%]"></div>
            <div className="w-1/6 bg-[#5865f2] hover:bg-[#4752c4] transition-colors rounded-t-sm h-[50%]"></div>
            <div className="w-1/6 bg-[#5865f2] hover:bg-[#4752c4] transition-colors rounded-t-sm h-[45%]"></div>
            <div className="w-1/6 bg-[#5865f2] hover:bg-[#4752c4] transition-colors rounded-t-sm h-[65%]"></div>
            <div className="w-1/6 bg-[#5865f2] hover:bg-[#4752c4] transition-colors rounded-t-sm h-[85%]"></div>
            <div className="w-1/6 bg-[#5865f2] hover:bg-[#4752c4] transition-colors rounded-t-sm h-[80%]"></div>
          </div>
        </div>

        {/* Top Costliest Vehicles */}
        <div>
          <h2 className="text-sm font-bold text-[#949ba4] uppercase tracking-wider mb-6">ACQUISITION COSTS</h2>
          <div className="space-y-6">
            {vehicles?.slice(0, 4).map((v: any, index: number) => (
              <div key={v.id} className="flex items-center gap-4">
                <div className="w-24 text-sm text-[#dbdee1] font-mono">{v.registrationNumber}</div>
                <div className="flex-1 h-4 bg-[#1e1f22] rounded-r-sm overflow-hidden border border-[#313338]">
                  <div 
                    className="h-full" 
                    style={{ 
                      width: `${Math.min((v.acquisitionCost / (totalAcquisitionCost || 1)) * 100, 100)}%`,
                      backgroundColor: index === 0 ? '#f23f42' : index === 1 ? '#d97706' : '#5865f2'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
