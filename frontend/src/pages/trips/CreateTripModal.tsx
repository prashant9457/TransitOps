import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/Modal';
import type { Vehicle, Driver } from '@/types';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles?: Vehicle[];
  drivers?: Driver[];
  onCreate: (data: any) => void;
  isPending: boolean;
}

export function CreateTripModal({ isOpen, onClose, vehicles, drivers, onCreate, isPending }: CreateTripModalProps) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [driverSearch, setDriverSearch] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [plannedDistance, setPlannedDistance] = useState('');
  const [scheduledStartTime, setScheduledStartTime] = useState('');
  const [scheduledEndTime, setScheduledEndTime] = useState('');
  const [isOpenToAll, setIsOpenToAll] = useState(false);
  const [vehicleFocused, setVehicleFocused] = useState(false);
  const [driverFocused, setDriverFocused] = useState(false);

  const selectedVehicle = useMemo(() => vehicles?.find(v => v.id === vehicleId), [vehicles, vehicleId]);
  const capacityError = selectedVehicle && Number(cargoWeight) > selectedVehicle.capacity
    ? Number(cargoWeight) - selectedVehicle.capacity : 0;

  const inputClass = 'w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2.5 focus:border-[#5865f2] outline-none transition-colors';
  const labelClass = 'text-[10px] font-bold text-[#949ba4] uppercase tracking-wider';

  const resetForm = () => {
    setSource(''); setDestination(''); setVehicleId(''); setDriverId('');
    setVehicleSearch(''); setDriverSearch('');
    setCargoWeight(''); setPlannedDistance(''); setScheduledStartTime(''); setScheduledEndTime('');
    setIsOpenToAll(false);
  };

  const handleCreate = () => {
    if (!source || !destination || !vehicleId || (!isOpenToAll && !driverId) || !cargoWeight || !scheduledStartTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (capacityError > 0) return;
    onCreate({ vehicleId, driverId, source, destination, cargoWeight: Number(cargoWeight), plannedDistance: Number(plannedDistance), scheduledStartTime, scheduledEndTime, isOpenToAll });
    resetForm();
  };

  const filteredVehicles = vehicles?.filter(v => v.registrationNumber.toLowerCase().includes(vehicleSearch.toLowerCase()));
  const filteredDrivers = drivers?.filter(d => d.name.toLowerCase().includes(driverSearch.toLowerCase()) || d.licenseNumber.toLowerCase().includes(driverSearch.toLowerCase()));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create & Assign Transit">
      <div className="flex flex-col gap-4 text-[#dbdee1]">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>SOURCE</label>
            <input type="text" value={source} onChange={e => setSource(e.target.value)} placeholder="Gandhinagar" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>DESTINATION</label>
            <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Ahmedabad" className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>SCHED. START</label>
            <input type="datetime-local" value={scheduledStartTime} onChange={e => setScheduledStartTime(e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>SCHED. END</label>
            <input type="datetime-local" value={scheduledEndTime} onChange={e => setScheduledEndTime(e.target.value)} className={inputClass} />
          </div>
        </div>

        {/* Vehicle Search */}
        <div className="flex flex-col gap-1.5 relative">
          <label className={labelClass}>VEHICLE (SEARCH TO ASSIGN)</label>
          <input
            type="text" value={vehicleSearch}
            onChange={e => { setVehicleSearch(e.target.value); if (vehicleId) setVehicleId(''); }}
            onFocus={() => setVehicleFocused(true)}
            onBlur={() => setTimeout(() => setVehicleFocused(false), 200)}
            placeholder="Click to view or search..." className={inputClass}
          />
          {vehicleFocused && !vehicleId && (
            <div className="absolute top-[100%] left-0 right-0 bg-[#2b2d31] border border-[#313338] mt-1 rounded-md max-h-48 overflow-y-auto z-50 shadow-2xl custom-scrollbar">
              {filteredVehicles?.map(v => (
                <div key={v.id} onMouseDown={e => { e.preventDefault(); setVehicleId(v.id); setVehicleSearch(`${v.registrationNumber} (${v.capacity}kg)`); }}
                  className="px-3 py-2.5 text-sm text-[#dbdee1] hover:bg-[#5865f2] cursor-pointer border-b border-[#313338] transition-colors">
                  {v.registrationNumber} <span className="opacity-75">- {v.capacity}kg</span>
                </div>
              ))}
              {filteredVehicles?.length === 0 && <div className="px-3 py-2.5 text-sm text-[#949ba4] italic">No available vehicles found.</div>}
            </div>
          )}
        </div>

        {/* Open to All Toggle */}
        <div className="flex items-center gap-3 bg-[#1e1f22] p-3 rounded-md border border-[#313338]">
          <input type="checkbox" checked={isOpenToAll}
            onChange={e => { setIsOpenToAll(e.target.checked); if (e.target.checked) { setDriverId(''); setDriverSearch(''); } }}
            className="w-4 h-4 rounded bg-[#313338] border-none text-[#5865f2] focus:ring-0 cursor-pointer"
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#f0b232]">Open to All Drivers (Bonus Trip)</span>
            <span className="text-[10px] text-[#949ba4]">Any available driver can claim this trip</span>
          </div>
        </div>

        {/* Driver Search */}
        {!isOpenToAll && (
          <div className="flex flex-col gap-1.5 relative">
            <label className={labelClass}>DRIVER (SEARCH TO ASSIGN)</label>
            <input
              type="text" value={driverSearch}
              onChange={e => { setDriverSearch(e.target.value); if (driverId) setDriverId(''); }}
              onFocus={() => setDriverFocused(true)}
              onBlur={() => setTimeout(() => setDriverFocused(false), 200)}
              placeholder="Click to view or search..." className={inputClass}
            />
            {driverFocused && !driverId && (
              <div className="absolute top-[100%] left-0 right-0 bg-[#2b2d31] border border-[#313338] mt-1 rounded-md max-h-48 overflow-y-auto z-50 shadow-2xl custom-scrollbar">
                {filteredDrivers?.map(d => (
                  <div key={d.id} onMouseDown={e => { e.preventDefault(); setDriverId(d.id); setDriverSearch(`${d.name} (${d.licenseNumber})`); }}
                    className="px-3 py-2.5 text-sm text-[#dbdee1] hover:bg-[#5865f2] cursor-pointer border-b border-[#313338] flex justify-between transition-colors">
                    <span>{d.name}</span><span className="opacity-75 font-mono text-xs">{d.licenseNumber}</span>
                  </div>
                ))}
                {filteredDrivers?.length === 0 && <div className="px-3 py-2.5 text-sm text-[#949ba4] italic">No available drivers found.</div>}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>WEIGHT (KG)</label>
            <input type="number" value={cargoWeight} onChange={e => setCargoWeight(e.target.value)} placeholder="700" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>DISTANCE (KM)</label>
            <input type="number" value={plannedDistance} onChange={e => setPlannedDistance(e.target.value)} placeholder="38" className={inputClass} />
          </div>
        </div>

        {capacityError > 0 && selectedVehicle && (
          <div className="border border-[#f23f42] rounded-md p-3 bg-[#f23f42]/10 mt-1">
            <div className="text-xs text-[#f2f3f5]">Vehicle Capacity: {selectedVehicle.capacity} kg | Cargo: {cargoWeight} kg</div>
            <div className="text-xs text-[#f23f42] font-semibold mt-1">✕ Exceeded by {capacityError} kg - creation blocked</div>
          </div>
        )}

        <div className="pt-2 mt-2 border-t border-[#1e1f22]">
          <button onClick={handleCreate} disabled={capacityError > 0 || isPending}
            className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50">
            {isPending ? 'Assigning...' : capacityError > 0 ? 'Create (disabled)' : 'Create & Assign Transit'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
