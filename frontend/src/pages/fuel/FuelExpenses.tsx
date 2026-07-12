import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FuelExpenses() {
  const queryClient = useQueryClient();
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  
  const [vehicleId, setVehicleId] = useState('');
  const [liters, setLiters] = useState('');
  const [cost, setCost] = useState('');
  const [odometer, setOdometer] = useState('');
  
  const [expenseType, setExpenseType] = useState('TOLL');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [tripId, setTripId] = useState('');

  const { data: vehicles } = useQuery({ queryKey: ['vehicles'], queryFn: async () => (await api.get('/vehicles')).data });
  const { data: trips } = useQuery({ queryKey: ['trips'], queryFn: async () => (await api.get('/trips')).data });
  const { data: fuelLogs, isLoading: loadingFuel } = useQuery({ queryKey: ['fuel'], queryFn: async () => (await api.get('/fuel')).data });
  const { data: expenses, isLoading: loadingExp } = useQuery({ queryKey: ['expenses'], queryFn: async () => (await api.get('/expenses')).data });

  const fuelMutation = useMutation({
    mutationFn: (data: any) => api.post('/fuel', data),
    onSuccess: () => {
      toast.success('Fuel logged');
      queryClient.invalidateQueries({ queryKey: ['fuel'] });
      setShowFuelForm(false);
    }
  });

  const expenseMutation = useMutation({
    mutationFn: (data: any) => api.post('/expenses', data),
    onSuccess: () => {
      toast.success('Expense added');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setShowExpenseForm(false);
    }
  });

  const handleLogFuel = () => {
    if (!vehicleId || !liters || !cost) return toast.error('Fill required fields');
    fuelMutation.mutate({ vehicleId, liters, cost, odometer });
  };

  const handleAddExpense = () => {
    if (!vehicleId || !expenseAmount || !expenseType) return toast.error('Fill required fields');
    expenseMutation.mutate({ vehicleId, tripId, type: expenseType, amount: expenseAmount, description: expenseDesc });
  };

  const totalFuelCost = fuelLogs?.reduce((acc: number, f: any) => acc + (f.cost || 0), 0) || 0;
  const totalExpenseCost = expenses?.reduce((acc: number, e: any) => acc + (e.amount || 0), 0) || 0;
  const totalCost = totalFuelCost + totalExpenseCost;

  return (
    <div className="flex flex-col h-full bg-[#1e1f22] text-[#f2f3f5] p-6 gap-8 relative">
      {/* Top Header Buttons */}
      <div className="flex justify-end gap-4 w-full border-b border-[#313338] pb-4">
        <button onClick={() => setShowFuelForm(!showFuelForm)} className="bg-[#d97706] hover:bg-[#b45309] text-white px-5 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors">
          <Plus size={16} /> Log Fuel
        </button>
        <button onClick={() => setShowExpenseForm(!showExpenseForm)} className="bg-[#d97706] hover:bg-[#b45309] text-white px-5 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors">
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {showFuelForm && (
        <div className="bg-[#2b2d31] p-4 rounded-md border border-[#313338] flex gap-4 items-end">
          <div className="flex-1"><label className="block text-xs mb-1 text-[#949ba4]">Vehicle</label>
            <select value={vehicleId} onChange={e=>setVehicleId(e.target.value)} className="w-full bg-[#1e1f22] text-sm px-2 py-1.5 rounded-md border border-[#313338] text-white">
              <option value="">Select Vehicle</option>{vehicles?.map((v:any) => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}
            </select>
          </div>
          <div className="flex-1"><label className="block text-xs mb-1 text-[#949ba4]">Liters</label>
            <input type="number" value={liters} onChange={e=>setLiters(e.target.value)} className="w-full bg-[#1e1f22] text-sm px-2 py-1.5 rounded-md border border-[#313338] text-white"/>
          </div>
          <div className="flex-1"><label className="block text-xs mb-1 text-[#949ba4]">Cost</label>
            <input type="number" value={cost} onChange={e=>setCost(e.target.value)} className="w-full bg-[#1e1f22] text-sm px-2 py-1.5 rounded-md border border-[#313338] text-white"/>
          </div>
          <button onClick={handleLogFuel} disabled={fuelMutation.isPending} className="bg-[#5865f2] px-4 py-1.5 rounded-md text-sm">Save</button>
        </div>
      )}

      {showExpenseForm && (
        <div className="bg-[#2b2d31] p-4 rounded-md border border-[#313338] flex flex-wrap gap-4 items-end">
          <div className="w-32"><label className="block text-xs mb-1 text-[#949ba4]">Type</label>
            <select value={expenseType} onChange={e=>setExpenseType(e.target.value)} className="w-full bg-[#1e1f22] text-sm px-2 py-1.5 rounded-md border border-[#313338] text-white">
              <option value="TOLL">Toll</option><option value="MAINTENANCE">Maintenance</option><option value="OTHER">Other</option>
            </select>
          </div>
          <div className="w-40"><label className="block text-xs mb-1 text-[#949ba4]">Vehicle</label>
            <select value={vehicleId} onChange={e=>setVehicleId(e.target.value)} className="w-full bg-[#1e1f22] text-sm px-2 py-1.5 rounded-md border border-[#313338] text-white">
              <option value="">Select Vehicle</option>{vehicles?.map((v:any) => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}
            </select>
          </div>
          <div className="w-40"><label className="block text-xs mb-1 text-[#949ba4]">Trip (Optional)</label>
            <select value={tripId} onChange={e=>setTripId(e.target.value)} className="w-full bg-[#1e1f22] text-sm px-2 py-1.5 rounded-md border border-[#313338] text-white">
              <option value="">None</option>{trips?.map((t:any) => <option key={t.id} value={t.id}>{t.source.substring(0,5)}... to {t.destination.substring(0,5)}...</option>)}
            </select>
          </div>
          <div className="w-24"><label className="block text-xs mb-1 text-[#949ba4]">Amount</label>
            <input type="number" value={expenseAmount} onChange={e=>setExpenseAmount(e.target.value)} className="w-full bg-[#1e1f22] text-sm px-2 py-1.5 rounded-md border border-[#313338] text-white"/>
          </div>
          <div className="flex-1"><label className="block text-xs mb-1 text-[#949ba4]">Description</label>
            <input type="text" value={expenseDesc} onChange={e=>setExpenseDesc(e.target.value)} className="w-full bg-[#1e1f22] text-sm px-2 py-1.5 rounded-md border border-[#313338] text-white"/>
          </div>
          <button onClick={handleAddExpense} disabled={expenseMutation.isPending} className="bg-[#5865f2] px-4 py-1.5 rounded-md text-sm">Save</button>
        </div>
      )}

      <div className="flex flex-col gap-10 overflow-y-auto custom-scrollbar flex-1">
        {/* Fuel Logs */}
        <div className="flex flex-col gap-4">
          <h2 className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">FUEL LOGS</h2>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#313338] text-[10px] font-medium text-[#949ba4] uppercase tracking-wider">
                  <th className="py-4 pr-4 w-1/4">VEHICLE</th>
                  <th className="py-4 px-4 w-1/4 text-center">DATE</th>
                  <th className="py-4 px-4 w-1/4 text-center">LITERS</th>
                  <th className="py-4 pl-4 w-1/4 text-right">FUEL COST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#313338] text-sm text-[#dbdee1]">
                {loadingFuel ? <tr><td colSpan={4} className="py-4 text-[#949ba4]">Loading...</td></tr> : fuelLogs?.map((fuel: any) => (
                  <tr key={fuel.id} className="hover:bg-[#2b2d31]/40 transition-colors">
                    <td className="py-4 pr-4 font-mono">{fuel.vehicle?.registrationNumber || 'N/A'}</td>
                    <td className="py-4 px-4 text-center">{new Date(fuel.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-center">{fuel.liters} L</td>
                    <td className="py-4 pl-4 text-right">{fuel.cost.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Other Expenses */}
        <div className="flex flex-col gap-4">
          <h2 className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">OTHER EXPENSES (TOLL / MISC)</h2>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#313338] text-[10px] font-medium text-[#949ba4] uppercase tracking-wider">
                  <th className="py-4 pr-4">TRIP</th>
                  <th className="py-4 px-4">VEHICLE</th>
                  <th className="py-4 px-4 text-center">TYPE</th>
                  <th className="py-4 px-4 text-center">DESC</th>
                  <th className="py-4 pl-4 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#313338] text-sm text-[#dbdee1]">
                {loadingExp ? <tr><td colSpan={5} className="py-4 text-[#949ba4]">Loading...</td></tr> : expenses?.map((expense: any) => (
                  <tr key={expense.id} className="hover:bg-[#2b2d31]/40 transition-colors">
                    <td className="py-4 pr-4 font-mono">{expense.tripId ? expense.tripId.substring(0,8).toUpperCase() : '—'}</td>
                    <td className="py-4 px-4 font-mono">{expense.vehicle?.registrationNumber || 'N/A'}</td>
                    <td className="py-4 px-4 text-center">{expense.type}</td>
                    <td className="py-4 px-4 text-center">{expense.description || '—'}</td>
                    <td className="py-4 pl-4 text-right flex justify-end">
                      <span className="inline-block px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[#5865f2]">
                        {expense.amount.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Cost */}
        <div className="flex items-center justify-between border-t border-[#313338] pt-4 pb-8 mt-4">
          <div className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">
            TOTAL OPERATIONAL COST (AUTO) = FUEL + EXPENSES
          </div>
          <div className="text-sm font-bold text-[#d97706]">
            {totalCost.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
