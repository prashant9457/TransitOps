import { useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/Modal';

interface ExpenseModalProps {
  tripId: string;
  onClose: () => void;
  onSubmit: (tripId: string, data: any) => void;
  isPending: boolean;
}

export function ExpenseModal({ tripId, onClose, onSubmit, isPending }: ExpenseModalProps) {
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [miscCost, setMiscCost] = useState('');
  const [expenseType, setExpenseType] = useState('MISC');
  const [description, setDescription] = useState('');

  const inputClass = 'w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2 outline-none focus:border-[#5865f2]';
  const labelClass = 'text-[10px] font-bold text-[#949ba4] uppercase tracking-wider';

  const handleSubmit = () => {
    if ((!fuelLiters || !fuelCost) && !miscCost) {
      toast.error('Please enter at least one expense type');
      return;
    }
    onSubmit(tripId, { fuelLiters, fuelCost, miscCost, expenseType, description });
  };

  return (
    <Modal isOpen onClose={onClose} title="Log Mid-Trip Expense">
      <div className="flex flex-col gap-4 text-[#dbdee1]">
        <div className="bg-[#2b2d31] p-4 rounded-md border border-[#313338]">
          <h3 className="text-sm font-semibold text-[#f2f3f5] mb-3">Fuel Purchase</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Liters Filled</label>
              <input type="number" value={fuelLiters} onChange={e => setFuelLiters(e.target.value)} placeholder="0" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Total Cost ($)</label>
              <input type="number" value={fuelCost} onChange={e => setFuelCost(e.target.value)} placeholder="0.00" className={inputClass} />
            </div>
          </div>
        </div>

        <div className="bg-[#2b2d31] p-4 rounded-md border border-[#313338]">
          <h3 className="text-sm font-semibold text-[#f2f3f5] mb-3">Other Expenses</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Expense Type</label>
              <select value={expenseType} onChange={e => setExpenseType(e.target.value)} className={inputClass}>
                <option value="MISC">Miscellaneous</option>
                <option value="TOLL">Toll Tax</option>
                <option value="FOOD">Food / Allowances</option>
                <option value="REPAIR">Minor Repair</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Cost ($)</label>
              <input type="number" value={miscCost} onChange={e => setMiscCost(e.target.value)} placeholder="0.00" className={inputClass} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Highway toll" className={inputClass} />
          </div>
        </div>

        <div className="pt-2 mt-2 border-t border-[#1e1f22]">
          <button onClick={handleSubmit} disabled={isPending}
            className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50">
            {isPending ? 'Saving...' : 'Save Expenses'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
