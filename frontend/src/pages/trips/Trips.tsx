import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import { Modal } from '@/components/Modal';
import { PostTripLogForm } from '@/components/forms/PostTripLogForm';
import type { Trip, Vehicle, Driver } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function Trips() {
  const { role, user } = useAuth();
  const queryClient = useQueryClient();
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

  // Filtering for Admin
  const [statusFilter, setStatusFilter] = useState('All');
  const [driverFilter, setDriverFilter] = useState('All');

  const [logTripId, setLogTripId] = useState<string | null>(null);

  // Fetch Live Trips
  const { data: rawTrips, isLoading: tripsLoading, isError: tripsError } = useQuery<Trip[]>({
    queryKey: ['trips'],
    queryFn: async () => {
      if (role === 'DRIVER') {
        const { data } = await api.get('/trips/my-trips');
        return data;
      } else {
        const { data } = await api.get('/trips');
        return data;
      }
    },
  });

  // Fetch available vehicles
  const { data: vehicles, isLoading: vehiclesLoading, isError: vehiclesError } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data } = await api.get('/vehicles');
      return data.filter((v: Vehicle) => v.status === 'AVAILABLE');
    },
    enabled: role === 'ADMIN' || role === 'FLEET_MANAGER',
  });

  // Fetch available drivers
  const { data: drivers, isLoading: driversLoading, isError: driversError } = useQuery<Driver[]>({
    queryKey: ['drivers'],
    queryFn: async () => {
      const { data } = await api.get('/drivers');
      return data.filter((d: Driver) => d.status === 'AVAILABLE');
    },
    enabled: role === 'ADMIN' || role === 'FLEET_MANAGER',
  });

  const createTripMutation = useMutation({
    mutationFn: (data: any) => api.post('/trips', data),
    onSuccess: () => {
      toast.success('Trip created and assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      // Reset form
      setSource(''); setDestination(''); setVehicleId(''); setDriverId(''); 
      setVehicleSearch(''); setDriverSearch('');
      setCargoWeight(''); setPlannedDistance(''); setScheduledStartTime(''); setScheduledEndTime('');
      setIsOpenToAll(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create trip')
  });

  const dispatchMutation = useMutation({
    mutationFn: (id: string) => api.post(`/trips/${id}/dispatch`),
    onSuccess: () => {
      toast.success('Trip dispatched! Ready for driver.');
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to dispatch trip')
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => api.post(`/trips/${id}/start`),
    onSuccess: () => {
      toast.success('Journey started successfully! Drive safely.');
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to start journey')
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.post(`/trips/${id}/complete`),
    onSuccess: () => {
      toast.success('Trip marked as completed!');
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to complete trip')
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.post(`/trips/${id}/cancel`),
    onSuccess: () => {
      toast.success('Trip cancelled successfully!');
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to cancel trip')
  });

  const logMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.post(`/trips/${id}/log`, data),
    onSuccess: () => {
      toast.success('Post-trip data logged successfully!');
      setLogTripId(null);
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to log trip data')
  });

  const claimMutation = useMutation({
    mutationFn: (id: string) => api.post(`/trips/${id}/claim`),
    onSuccess: () => {
      toast.success('Bonus trip claimed successfully! It is now assigned to you.');
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to claim trip')
  });

  const selectedVehicle = useMemo(() => vehicles?.find((v: Vehicle) => v.id === vehicleId), [vehicles, vehicleId]);
  const capacityError = selectedVehicle && Number(cargoWeight) > selectedVehicle.capacity 
    ? Number(cargoWeight) - selectedVehicle.capacity 
    : 0;

  const handleCreate = () => {
    if (!source || !destination || !vehicleId || (!isOpenToAll && !driverId) || !cargoWeight || !scheduledStartTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (capacityError > 0) return;

    createTripMutation.mutate({
      vehicleId,
      driverId,
      source,
      destination,
      cargoWeight: Number(cargoWeight),
      plannedDistance: Number(plannedDistance),
      scheduledStartTime,
      scheduledEndTime,
      isOpenToAll
    });
  };

  const canDispatch = role === 'ADMIN' || role === 'FLEET_MANAGER';
  const isDriver = role === 'DRIVER';

  if (tripsLoading) return <div className="p-6 text-[#949ba4] text-sm">Loading trips data...</div>;
  if (tripsError) return <div className="p-6 text-[#f23f42] text-sm">Error loading data. Please try again.</div>;

  // Apply Filters
  let filteredTrips = rawTrips || [];
  if (canDispatch) {
    if (statusFilter !== 'All') {
      if (statusFilter === 'Delayed') {
        const now = new Date();
        filteredTrips = filteredTrips.filter(t => 
          (t.status === 'READY_TO_START' || t.status === 'ASSIGNED') && 
          t.scheduledStartTime && 
          new Date(t.scheduledStartTime) < now && 
          !t.actualStartTime
        );
      } else {
        filteredTrips = filteredTrips.filter(t => t.status === statusFilter);
      }
    }
    if (driverFilter !== 'All') {
      filteredTrips = filteredTrips.filter(t => t.driver?.name === driverFilter);
    }
  }

  // Get unique drivers for filter
  const uniqueDriversInTrips = Array.from(new Set(rawTrips?.map(t => t.driver?.name).filter(Boolean)));

  return (
    <div className="flex flex-col lg:flex-row h-full bg-[#1e1f22] text-[#f2f3f5] p-6 gap-8 overflow-y-auto custom-scrollbar">
      
      {/* Left Column: Create Trip (Only for Admin/Fleet Manager) */}
      {canDispatch && (
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          {/* Trip Lifecycle Visual */}
          <div className="flex flex-col gap-2">
            <h2 className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">TRIP LIFECYCLE</h2>
            <div className="flex items-center justify-between mt-2 px-2 relative">
              <div className="absolute top-2 left-4 right-4 h-0.5 bg-[#313338] z-0"></div>
              
              <div className="flex flex-col items-center gap-1 z-10 w-1/5">
                <div className="w-4 h-4 rounded-full bg-[#23a559] ring-4 ring-[#1e1f22]"></div>
                <span className="text-[8px] text-[#23a559] font-medium text-center">Assigned</span>
              </div>
              <div className="flex flex-col items-center gap-1 z-10 w-1/5">
                <div className="w-4 h-4 rounded-full bg-[#f0b232] ring-4 ring-[#1e1f22]"></div>
                <span className="text-[8px] text-[#f0b232] font-medium text-center">Ready</span>
              </div>
              <div className="flex flex-col items-center gap-1 z-10 w-1/5">
                <div className="w-4 h-4 rounded-full bg-[#5865f2] ring-4 ring-[#1e1f22]"></div>
                <span className="text-[8px] text-[#5865f2] font-medium text-center">In Progress</span>
              </div>
              <div className="flex flex-col items-center gap-1 z-10 w-1/5">
                <div className="w-4 h-4 rounded-full bg-[#949ba4] ring-4 ring-[#1e1f22]"></div>
                <span className="text-[8px] text-[#949ba4] font-medium text-center">Done</span>
              </div>
            </div>
          </div>

          {/* Create Trip Form */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">CREATE & ASSIGN TRIP</h2>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">SOURCE</label>
                <input type="text" value={source} onChange={e => setSource(e.target.value)} placeholder="Gandhinagar" className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2 focus:border-[#5865f2] outline-none"/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">DESTINATION</label>
                <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Ahmedabad" className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2 focus:border-[#5865f2] outline-none"/>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">SCHED. START</label>
                <input type="datetime-local" value={scheduledStartTime} onChange={e => setScheduledStartTime(e.target.value)} className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2 focus:border-[#5865f2] outline-none"/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">SCHED. END</label>
                <input type="datetime-local" value={scheduledEndTime} onChange={e => setScheduledEndTime(e.target.value)} className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2 focus:border-[#5865f2] outline-none"/>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">VEHICLE (SEARCH TO ASSIGN)</label>
              <input 
                type="text" 
                value={vehicleSearch} 
                onChange={e => { setVehicleSearch(e.target.value); if (vehicleId) setVehicleId(''); }} 
                onFocus={() => setVehicleFocused(true)}
                onBlur={() => setTimeout(() => setVehicleFocused(false), 150)}
                placeholder="Click to view or search..." 
                className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2 focus:border-[#5865f2] outline-none"
              />
              {vehicleFocused && !vehicleId && (
                <div className="absolute top-[100%] left-0 right-0 bg-[#2b2d31] border border-[#313338] mt-1 rounded-md max-h-40 overflow-y-auto z-50 shadow-lg custom-scrollbar">
                  {vehicles?.filter((v: Vehicle) => v.registrationNumber.toLowerCase().includes(vehicleSearch.toLowerCase())).map((v: Vehicle) => (
                    <div 
                      key={v.id} 
                      onMouseDown={(e) => { e.preventDefault(); setVehicleId(v.id); setVehicleSearch(`${v.registrationNumber} (${v.capacity}kg)`); }} 
                      className="px-3 py-2 text-sm text-[#dbdee1] hover:bg-[#5865f2] cursor-pointer border-b border-[#313338]"
                    >
                      {v.registrationNumber} <span className="opacity-75">- {v.capacity}kg</span>
                    </div>
                  ))}
                  {vehicles?.filter((v: Vehicle) => v.registrationNumber.toLowerCase().includes(vehicleSearch.toLowerCase())).length === 0 && (
                    <div className="px-3 py-2 text-sm text-[#949ba4] italic">No available vehicles found.</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 bg-[#2b2d31] p-3 rounded-md border border-[#313338]">
              <input 
                type="checkbox" 
                checked={isOpenToAll}
                onChange={e => {
                  setIsOpenToAll(e.target.checked);
                  if (e.target.checked) {
                    setDriverId('');
                    setDriverSearch('');
                  }
                }}
                className="w-4 h-4 rounded bg-[#1e1f22] border-[#313338] text-[#5865f2] focus:ring-[#5865f2] cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[#f0b232]">Open to All Drivers (Bonus Trip)</span>
                <span className="text-[10px] text-[#949ba4]">Any available driver can claim this trip</span>
              </div>
            </div>

            {!isOpenToAll && (
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">DRIVER (SEARCH TO ASSIGN)</label>
                <input 
                  type="text" 
                  value={driverSearch} 
                  onChange={e => { setDriverSearch(e.target.value); if (driverId) setDriverId(''); }} 
                  onFocus={() => setDriverFocused(true)}
                  onBlur={() => setTimeout(() => setDriverFocused(false), 150)}
                  placeholder="Click to view or search..." 
                  className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2 focus:border-[#5865f2] outline-none"
                />
                {driverFocused && !driverId && (
                  <div className="absolute top-[100%] left-0 right-0 bg-[#2b2d31] border border-[#313338] mt-1 rounded-md max-h-40 overflow-y-auto z-50 shadow-lg custom-scrollbar">
                    {drivers?.filter((d: Driver) => d.name.toLowerCase().includes(driverSearch.toLowerCase()) || d.licenseNumber.toLowerCase().includes(driverSearch.toLowerCase())).map((d: Driver) => (
                      <div 
                        key={d.id} 
                        onMouseDown={(e) => { e.preventDefault(); setDriverId(d.id); setDriverSearch(`${d.name} (${d.licenseNumber})`); }} 
                        className="px-3 py-2 text-sm text-[#dbdee1] hover:bg-[#5865f2] cursor-pointer border-b border-[#313338] flex justify-between"
                      >
                        <span>{d.name}</span><span className="opacity-75 font-mono text-xs">{d.licenseNumber}</span>
                      </div>
                    ))}
                    {drivers?.filter((d: Driver) => d.name.toLowerCase().includes(driverSearch.toLowerCase()) || d.licenseNumber.toLowerCase().includes(driverSearch.toLowerCase())).length === 0 && (
                      <div className="px-3 py-2 text-sm text-[#949ba4] italic">No available drivers found.</div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">WEIGHT (KG)</label>
                <input type="number" value={cargoWeight} onChange={e => setCargoWeight(e.target.value)} placeholder="700" className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2 focus:border-[#5865f2] outline-none"/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">DISTANCE (KM)</label>
                <input type="number" value={plannedDistance} onChange={e => setPlannedDistance(e.target.value)} placeholder="38" className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2 focus:border-[#5865f2] outline-none"/>
              </div>
            </div>

            {capacityError > 0 && selectedVehicle && (
              <div className="border border-[#f23f42] rounded-md p-3 bg-[#f23f42]/10 mt-2">
                <div className="text-xs text-[#f2f3f5]">Vehicle Capacity: {selectedVehicle.capacity} kg | Cargo: {cargoWeight} kg</div>
                <div className="text-xs text-[#f23f42] font-semibold mt-1">✕ Exceeded by {capacityError} kg - creation blocked</div>
              </div>
            )}

            <button 
              onClick={handleCreate}
              disabled={capacityError > 0 || createTripMutation.isPending}
              className="w-full mt-2 bg-[#5865f2] hover:bg-[#4752c4] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              {createTripMutation.isPending ? 'Assigning...' : capacityError > 0 ? 'Create (disabled)' : 'Create & Assign Trip'}
            </button>
          </div>
        </div>
      )}

      {/* Right Column: Live Board */}
      <div className={`flex-1 flex flex-col gap-4 ${canDispatch ? 'border-l border-[#313338] pl-0 lg:pl-8 mt-8 lg:mt-0' : ''}`}>
        <div className="flex justify-between items-center">
          <h2 className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">
            {isDriver ? 'MY ASSIGNED TRIPS' : 'OPERATIONS LIVE BOARD'}
          </h2>
          {canDispatch && (
            <div className="flex gap-2">
              <select value={driverFilter} onChange={e => setDriverFilter(e.target.value)} className="bg-[#1e1f22] text-[#949ba4] text-xs border border-[#313338] rounded-md px-2 py-1 outline-none">
                <option value="All">All Drivers</option>
                {uniqueDriversInTrips.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-[#1e1f22] text-[#949ba4] text-xs border border-[#313338] rounded-md px-2 py-1 outline-none">
                <option value="All">All Statuses</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="READY_TO_START">Ready To Start</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="Delayed">⚠️ Delayed</option>
              </select>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-4">
          {filteredTrips.length === 0 ? (
            <div className="text-sm text-[#949ba4]">{isDriver ? 'You have no assigned trips right now.' : 'No trips match the current filters.'}</div>
          ) : (
            filteredTrips.map((trip: Trip) => {
              const isDelayed = (trip.status === 'READY_TO_START' || trip.status === 'ASSIGNED') && trip.scheduledStartTime && new Date(trip.scheduledStartTime) < new Date() && !trip.actualStartTime;

              return (
                <div key={trip.id} className={`border ${isDelayed ? 'border-[#f23f42]/50' : 'border-[#313338]'} border-dashed rounded-md p-4 bg-[#1e1f22] flex flex-col gap-3 relative`}>
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[#dbdee1] font-mono text-sm">{trip.id.substring(0,8).toUpperCase()}</span>
                        {isDelayed && <span className="bg-[#f23f42]/20 text-[#f23f42] text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Delayed</span>}
                      </div>
                      <span className="text-[#f2f3f5] font-medium text-sm mt-1">
                        {trip.source} → {trip.destination}
                        {trip.isOpenToAll && trip.status === 'ASSIGNED' && (
                          <span className="ml-2 bg-[#f0b232]/20 text-[#f0b232] text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider border border-[#f0b232]/30">Bonus Trip (Open)</span>
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-[#949ba4] uppercase tracking-wider text-right">
                      {trip.vehicle?.registrationNumber || 'UNASSIGNED'} <br/> 
                      {trip.isOpenToAll && trip.status === 'ASSIGNED' ? <span className="text-[#f0b232] font-semibold">OPEN TO ALL</span> : (trip.driver?.name || 'UNASSIGNED')}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-[#949ba4] bg-[#2b2d31] p-2 rounded-md">
                    <div><span className="font-semibold">Sched Start:</span> {trip.scheduledStartTime ? new Date(trip.scheduledStartTime).toLocaleString() : 'N/A'}</div>
                    <div><span className="font-semibold">Actual Start:</span> {trip.actualStartTime ? new Date(trip.actualStartTime).toLocaleString() : '—'}</div>
                  </div>
                  
                  {/* Operations Visual Timeline */}
                  <div className="mt-2 pt-4 border-t border-[#313338] flex justify-between items-start relative px-2">
                    <div className="absolute top-[5px] left-6 right-6 h-0.5 bg-[#313338] z-0"></div>
                    
                    {[
                      { label: 'Assigned', active: true, date: trip.createdAt },
                      { label: 'Accepted', active: !!trip.driverAcceptedAt || trip.status !== 'ASSIGNED', date: trip.driverAcceptedAt },
                      { label: 'Dispatched', active: !!trip.dispatchedAt || trip.status === 'IN_PROGRESS' || trip.status === 'COMPLETED', date: trip.dispatchedAt || trip.actualStartTime },
                      { label: 'Maint. Check', active: !!trip.maintenanceRequired, date: null, isWarning: true },
                      { label: 'Reached', active: trip.status === 'COMPLETED', date: trip.actualEndTime },
                      { label: 'Logged', active: !!trip.reportsLogged, date: null }
                    ].map((step, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5 z-10 w-1/6">
                        <div className={`w-3 h-3 rounded-full ring-4 ring-[#1e1f22] ${step.active ? (step.isWarning ? 'bg-[#f0b232]' : 'bg-[#5865f2]') : 'bg-[#313338]'}`}></div>
                        <span className={`text-[8px] font-bold uppercase tracking-wider text-center ${step.active ? (step.isWarning ? 'text-[#f0b232]' : 'text-[#5865f2]') : 'text-[#949ba4]'}`}>
                          {step.label}
                        </span>
                        {step.active && step.date && (
                          <span className="text-[8px] text-[#949ba4] font-mono leading-tight text-center">
                            {new Date(step.date).toLocaleDateString()}
                          </span>
                        )}
                        {step.label === 'Maint. Check' && (
                          <span className="text-[8px] text-[#949ba4] font-mono leading-tight text-center">
                            {step.active ? 'YES' : 'NO'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-1 pt-2 border-t border-[#313338]">
                    <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${
                      trip.status === 'IN_PROGRESS' ? 'bg-[#5865f2] text-white' :
                      trip.status === 'READY_TO_START' ? 'bg-[#f0b232] text-white' :
                      trip.status === 'ASSIGNED' ? 'bg-[#23a559] text-white' :
                      trip.status === 'CANCELLED' ? 'bg-[#f23f42] text-white' :
                      'bg-[#4f545c] text-white'
                    }`}>
                      {trip.status.replace(/_/g, ' ')}
                    </span>
                    
                    <div className="flex gap-2">
                      {/* Driver Button */}
                      {isDriver && trip.status === 'READY_TO_START' && (
                        <button 
                          onClick={() => startMutation.mutate(trip.id)}
                          disabled={startMutation.isPending}
                          className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          Start Journey
                        </button>
                      )}

                      {/* Fleet Manager / Admin Buttons */}
                      {canDispatch && trip.status === 'ASSIGNED' && (
                        <button 
                          onClick={() => dispatchMutation.mutate(trip.id)}
                          disabled={dispatchMutation.isPending}
                          className="bg-[#f0b232] hover:bg-[#d69f2c] text-[#1e1f22] px-3 py-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          Dispatch to Driver
                        </button>
                      )}
                      {(canDispatch || isDriver) && (trip.status === 'IN_PROGRESS' || trip.status === 'READY_TO_START') && (
                        <button 
                          onClick={() => completeMutation.mutate(trip.id)}
                          disabled={completeMutation.isPending}
                          className="bg-[#23a559]/20 hover:bg-[#23a559]/30 text-[#23a559] px-3 py-1.5 rounded-md text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          Complete
                        </button>
                      )}
                      {canDispatch && (trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED') && (
                        <button 
                          onClick={() => cancelMutation.mutate(trip.id)}
                          disabled={cancelMutation.isPending}
                          className="bg-[#f23f42]/20 hover:bg-[#f23f42]/30 text-[#f23f42] px-3 py-1.5 rounded-md text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                      
                      {/* Driver Log Button */}
                      {(isDriver || canDispatch) && trip.status === 'COMPLETED' && !trip.reportsLogged && (
                        <button 
                          onClick={() => setLogTripId(trip.id)}
                          className="bg-[#23a559] hover:bg-[#1c8446] text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors shadow-lg"
                        >
                          Log Trip Data
                        </button>
                      )}

                      {/* Claim Bonus Trip Button */}
                      {isDriver && trip.isOpenToAll && trip.status === 'ASSIGNED' && (
                        <button 
                          onClick={() => claimMutation.mutate(trip.id)}
                          disabled={claimMutation.isPending}
                          className="bg-[#f0b232] hover:bg-[#d69f2c] text-[#1e1f22] px-4 py-1.5 rounded-md text-xs font-bold transition-colors shadow-lg disabled:opacity-50 animate-pulse hover:animate-none"
                        >
                          {claimMutation.isPending ? 'Claiming...' : 'Claim Bonus Trip!'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Post Trip Log Modal */}
      {logTripId && (
        <Modal 
          isOpen={!!logTripId} 
          onClose={() => setLogTripId(null)} 
          title="Submit Post-Trip Log"
        >
          <PostTripLogForm 
            vehicleOdometer={rawTrips?.find(t => t.id === logTripId)?.vehicle?.odometer || 0}
            onSubmit={(data) => logMutation.mutate({ id: logTripId, data })}
            isLoading={logMutation.isPending}
          />
        </Modal>
      )}
    </div>
  );
}
