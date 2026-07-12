import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';

export default function Trips() {
  const queryClient = useQueryClient();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [plannedDistance, setPlannedDistance] = useState('');

  // Fetch Live Trips
  const { data: trips, isLoading: tripsLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const { data } = await api.get('/trips');
      return data;
    },
  });

  // Fetch available vehicles
  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data } = await api.get('/vehicles');
      return data.filter((v: any) => v.status === 'AVAILABLE');
    },
  });

  // Fetch available drivers
  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const { data } = await api.get('/drivers');
      return data.filter((d: any) => d.status === 'AVAILABLE');
    },
  });

  const dispatchMutation = useMutation({
    mutationFn: (data: any) => api.post('/trips/dispatch', data),
    onSuccess: () => {
      toast.success('Trip dispatched successfully!');
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      // Reset form
      setSource(''); setDestination(''); setVehicleId(''); setDriverId(''); setCargoWeight(''); setPlannedDistance('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to dispatch trip');
    }
  });

  const selectedVehicle = useMemo(() => vehicles?.find((v: any) => v.id === vehicleId), [vehicles, vehicleId]);
  const capacityError = selectedVehicle && Number(cargoWeight) > selectedVehicle.capacity 
    ? Number(cargoWeight) - selectedVehicle.capacity 
    : 0;

  const handleDispatch = () => {
    if (!source || !destination || !vehicleId || !driverId || !cargoWeight) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (capacityError > 0) return;

    dispatchMutation.mutate({
      vehicleId,
      driverId,
      source,
      destination,
      cargoWeight: Number(cargoWeight),
      plannedDistance: Number(plannedDistance)
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-[#1e1f22] text-[#f2f3f5] p-6 gap-8 overflow-y-auto custom-scrollbar">
      {/* Left Column: Create Trip */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        
        {/* Trip Lifecycle */}
        <div className="flex flex-col gap-2">
          <h2 className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">TRIP LIFECYCLE</h2>
          <div className="flex items-center justify-between mt-2 px-2 relative">
            <div className="absolute top-2 left-6 right-6 h-0.5 bg-[#313338] z-0"></div>
            
            <div className="flex flex-col items-center gap-1 z-10">
              <div className="w-4 h-4 rounded-full bg-[#23a559] ring-4 ring-[#1e1f22]"></div>
              <span className="text-[10px] text-[#23a559] font-medium">Draft</span>
            </div>
            
            <div className="flex flex-col items-center gap-1 z-10">
              <div className="w-4 h-4 rounded-full bg-[#5865f2] ring-4 ring-[#1e1f22]"></div>
              <span className="text-[10px] text-[#5865f2] font-medium">Dispatched</span>
            </div>
            
            <div className="flex flex-col items-center gap-1 z-10">
              <div className="w-4 h-4 rounded-full bg-[#4f545c] ring-4 ring-[#1e1f22]"></div>
              <span className="text-[10px] text-[#949ba4] font-medium">Completed</span>
            </div>
            
            <div className="flex flex-col items-center gap-1 z-10">
              <div className="w-4 h-4 rounded-full bg-[#4f545c] ring-4 ring-[#1e1f22]"></div>
              <span className="text-[10px] text-[#949ba4] font-medium">Cancelled</span>
            </div>
          </div>
        </div>

        {/* Create Trip Form */}
        <div className="flex flex-col gap-4">
          <h2 className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">CREATE TRIP</h2>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">SOURCE</label>
            <input 
              type="text" 
              value={source} onChange={e => setSource(e.target.value)}
              placeholder="Gandhinagar Depot"
              className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2 focus:outline-none focus:border-[#5865f2] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">DESTINATION</label>
            <input 
              type="text" 
              value={destination} onChange={e => setDestination(e.target.value)}
              placeholder="Ahmedabad Hub"
              className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2 focus:outline-none focus:border-[#5865f2] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">VEHICLE (AVAILABLE ONLY)</label>
            <select 
              value={vehicleId} onChange={e => setVehicleId(e.target.value)}
              className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2 focus:outline-none focus:border-[#5865f2] transition-colors"
            >
              <option value="">Select Vehicle</option>
              {vehicles?.map((v: any) => (
                <option key={v.id} value={v.id}>{v.registrationNumber} - {v.capacity} kg capacity</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">DRIVER (AVAILABLE ONLY)</label>
            <select 
              value={driverId} onChange={e => setDriverId(e.target.value)}
              className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2 focus:outline-none focus:border-[#5865f2] transition-colors"
            >
              <option value="">Select Driver</option>
              {drivers?.map((d: any) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">CARGO WEIGHT (KG)</label>
            <input 
              type="number" 
              value={cargoWeight} onChange={e => setCargoWeight(e.target.value)}
              placeholder="700"
              className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2 focus:outline-none focus:border-[#5865f2] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">PLANNED DISTANCE (KM)</label>
            <input 
              type="number" 
              value={plannedDistance} onChange={e => setPlannedDistance(e.target.value)}
              placeholder="38"
              className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2 focus:outline-none focus:border-[#5865f2] transition-colors"
            />
          </div>

          {capacityError > 0 && selectedVehicle && (
            <div className="border border-[#f23f42] rounded-md p-3 bg-[#f23f42]/10 mt-2">
              <div className="text-xs text-[#f2f3f5]">Vehicle Capacity: {selectedVehicle.capacity} kg</div>
              <div className="text-xs text-[#f2f3f5]">Cargo Weight: {cargoWeight} kg</div>
              <div className="text-xs text-[#f23f42] font-semibold mt-1">
                ✕ Capacity exceeded by {capacityError} kg - dispatch blocked
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <button 
              onClick={handleDispatch}
              disabled={capacityError > 0 || dispatchMutation.isPending}
              className="flex-1 bg-[#2b2d31] hover:bg-[#313338] text-[#dbdee1] border border-[#313338] px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {capacityError > 0 ? 'Dispatch (disabled)' : 'Dispatch'}
            </button>
            <button className="flex-1 bg-[#f23f42]/10 hover:bg-[#f23f42]/20 text-[#f23f42] px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Live Board */}
      <div className="flex-1 flex flex-col gap-4 border-l border-[#313338] pl-0 lg:pl-8 mt-8 lg:mt-0">
        <h2 className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">LIVE BOARD</h2>
        
        <div className="flex flex-col gap-4">
          {tripsLoading ? (
            <div className="text-sm text-[#949ba4]">Loading live board...</div>
          ) : trips?.length === 0 ? (
            <div className="text-sm text-[#949ba4]">No trips available.</div>
          ) : (
            trips?.map((trip: any) => (
              <div key={trip.id} className="border border-[#313338] border-dashed rounded-md p-4 bg-[#1e1f22] flex flex-col gap-3 relative">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[#dbdee1] font-mono text-sm">{trip.id.substring(0,8).toUpperCase()}</span>
                    <span className="text-[#f2f3f5] font-medium text-sm mt-1">
                      {trip.source} → {trip.destination}
                    </span>
                  </div>
                  <div className="text-xs text-[#949ba4] uppercase tracking-wider">
                    {trip.vehicle?.registrationNumber || 'UNASSIGNED'} / {trip.driver?.name?.split(' ')[0] || ''}
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${
                    trip.status === 'DISPATCHED' ? 'bg-[#5865f2] text-white' :
                    trip.status === 'DRAFT' ? 'bg-[#949ba4] text-white' :
                    trip.status === 'CANCELLED' ? 'bg-[#f23f42] text-white' :
                    'bg-[#23a559] text-white'
                  }`}>
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1).toLowerCase()}
                  </span>
                  
                  <span className="text-xs text-[#949ba4]">
                    {trip.status === 'DRAFT' ? 'Awaiting driver' : 
                     trip.status === 'CANCELLED' ? 'Vehicle went to shop' :
                     '45 min'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-[10px] text-[#949ba4] font-mono italic mt-4 opacity-75">
          On Complete: odometer -{'>'} fuel log -{'>'} expenses -{'>'} Vehicle & Driver Available
        </div>
      </div>
    </div>
  );
}
