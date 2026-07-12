import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import { Modal } from '@/components/Modal';
import { PostTripLogForm } from '@/components/forms/PostTripLogForm';
import type { Trip, Vehicle, Driver } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function Trips() {
  const { role } = useAuth();
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

  // Modals & Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [driverFilter, setDriverFilter] = useState('All');
  const [logTripId, setLogTripId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data } = await api.get('/vehicles');
      return data.filter((v: Vehicle) => v.status === 'AVAILABLE');
    },
    enabled: role === 'ADMIN' || role === 'FLEET_MANAGER',
  });

  // Fetch available drivers
  const { data: drivers } = useQuery<Driver[]>({
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
      setIsCreateModalOpen(false);
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

  if (tripsLoading) return <div className="p-6 text-[#949ba4] text-sm">Loading transits...</div>;
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

  const uniqueDriversInTrips = Array.from(new Set(rawTrips?.map(t => t.driver?.name).filter(Boolean)));

  return (
    <div className="flex flex-col h-full bg-[#1e1f22] text-[#f2f3f5] overflow-hidden">
      
      {/* Header & Controls */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-[#313338] bg-[#1e1f22] z-10 shrink-0">
        <h1 className="text-xl font-bold tracking-tight">
          {isDriver ? 'My Assigned Transits' : 'Operations Live Board'}
        </h1>
        
        <div className="flex items-center gap-4">
          {canDispatch && (
            <>
              <select value={driverFilter} onChange={e => setDriverFilter(e.target.value)} className="bg-[#1e1f22] text-[#949ba4] text-sm border border-[#313338] rounded-md px-3 py-2 outline-none focus:border-[#5865f2] transition-colors">
                <option value="All">All Drivers</option>
                {uniqueDriversInTrips.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-[#1e1f22] text-[#949ba4] text-sm border border-[#313338] rounded-md px-3 py-2 outline-none focus:border-[#5865f2] transition-colors">
                <option value="All">All Statuses</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="READY_TO_START">Ready To Start</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="Delayed">⚠️ Delayed</option>
              </select>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#23a559] hover:bg-[#1c8446] text-white px-5 py-2 rounded-md font-bold text-sm transition-colors shadow-lg shadow-[#23a559]/20 flex items-center gap-2"
              >
                <span>+ New Transit</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* GitHub-style List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#1e1f22]">
        <div className="flex flex-col rounded-md border border-[#313338] bg-[#2b2d31]">
          {filteredTrips.length === 0 ? (
            <div className="p-8 text-center text-[#949ba4]">{isDriver ? 'You have no assigned trips right now.' : 'No transits match the current filters.'}</div>
          ) : (
            filteredTrips.map((trip: Trip, index: number) => {
              const isDelayed = (trip.status === 'READY_TO_START' || trip.status === 'ASSIGNED') && trip.scheduledStartTime && new Date(trip.scheduledStartTime) < new Date() && !trip.actualStartTime;
              const isLast = index === filteredTrips.length - 1;

              return (
                <div key={trip.id} className={`p-4 flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between hover:bg-[#313338]/40 transition-colors ${!isLast ? 'border-b border-[#313338]' : ''}`}>
                  
                  {/* Left: Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1.5 flex shrink-0">
                      <div className={`w-2.5 h-2.5 rounded-full ring-2 ${
                        trip.status === 'COMPLETED' ? 'bg-[#23a559] ring-[#23a559]/30' : 
                        trip.status === 'CANCELLED' ? 'bg-[#f23f42] ring-[#f23f42]/30' : 
                        'bg-[#5865f2] ring-[#5865f2]/30 animate-pulse'
                      }`}></div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[15px] tracking-tight">{trip.source} → {trip.destination}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          trip.status === 'IN_PROGRESS' ? 'bg-[#5865f2]/20 text-[#5865f2]' :
                          trip.status === 'READY_TO_START' ? 'bg-[#f0b232]/20 text-[#f0b232]' :
                          trip.status === 'ASSIGNED' ? 'bg-[#23a559]/20 text-[#23a559]' :
                          trip.status === 'CANCELLED' ? 'bg-[#f23f42]/20 text-[#f23f42]' :
                          'bg-[#4f545c]/30 text-[#dbdee1]'
                        }`}>
                          {trip.status.replace(/_/g, ' ')}
                        </span>
                        {isDelayed && <span className="bg-[#f23f42]/20 text-[#f23f42] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-[#f23f42]/30">Delayed</span>}
                        {trip.isOpenToAll && trip.status === 'ASSIGNED' && <span className="bg-[#f0b232]/20 text-[#f0b232] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-[#f0b232]/30 shadow-[0_0_10px_rgba(240,178,50,0.2)]">Bonus Trip</span>}
                      </div>
                      
                      <div className="text-xs text-[#949ba4] mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-mono bg-[#1e1f22] px-1.5 py-0.5 rounded text-[#dbdee1] border border-[#313338]">{trip.id.substring(0,7).toUpperCase()}</span>
                        <span>Vehicle: <span className="text-[#dbdee1]">{trip.vehicle?.registrationNumber || 'Unassigned'}</span></span>
                        <span>Driver: <span className={trip.isOpenToAll && trip.status === 'ASSIGNED' ? 'text-[#f0b232] font-semibold' : 'text-[#dbdee1]'}>{trip.isOpenToAll && trip.status === 'ASSIGNED' ? 'OPEN TO ALL' : (trip.driver?.name || 'Unassigned')}</span></span>
                        <span>Distance: <span className="text-[#dbdee1]">{trip.plannedDistance}km</span></span>
                        <span className="text-[#4f545c]">|</span>
                        <span>Start: {trip.scheduledStartTime ? new Date(trip.scheduledStartTime).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}) : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Compressed Timeline (Hidden on small screens) */}
                  <div className="flex-1 w-full xl:w-auto px-6 py-2 bg-[#1e1f22]/50 rounded-lg border border-[#313338]/50 flex justify-between items-center relative hidden md:flex shrink-0 min-w-[350px] max-w-[500px]">
                    <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-[#313338] z-0"></div>
                    {[
                      { label: 'Assigned', active: true },
                      { label: 'Accepted', active: !!trip.driverAcceptedAt || trip.status !== 'ASSIGNED' },
                      { label: 'Dispatched', active: !!trip.dispatchedAt || trip.status === 'IN_PROGRESS' || trip.status === 'COMPLETED' },
                      { label: 'Maint', active: !!trip.maintenanceRequired, isWarning: true },
                      { label: 'Reached', active: trip.status === 'COMPLETED' },
                      { label: 'Logged', active: !!trip.reportsLogged }
                    ].map((step, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5 z-10">
                        <div className={`w-2.5 h-2.5 rounded-full ring-4 ring-[#2b2d31] ${step.active ? (step.isWarning ? 'bg-[#f0b232]' : 'bg-[#5865f2]') : 'bg-[#313338]'}`}></div>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${step.active ? (step.isWarning ? 'text-[#f0b232]' : 'text-[#5865f2]') : 'text-[#949ba4]'}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 xl:min-w-[220px] justify-end shrink-0">
                    {/* Driver Actions */}
                    {isDriver && trip.status === 'READY_TO_START' && (
                      <button onClick={() => startMutation.mutate(trip.id)} disabled={startMutation.isPending} className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-4 py-1.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 shadow-lg">
                        Start Journey
                      </button>
                    )}
                    {isDriver && trip.isOpenToAll && trip.status === 'ASSIGNED' && (
                      <button onClick={() => claimMutation.mutate(trip.id)} disabled={claimMutation.isPending} className="bg-[#f0b232] hover:bg-[#d69f2c] text-[#1e1f22] px-4 py-1.5 rounded-md text-sm font-bold transition-colors shadow-[0_0_15px_rgba(240,178,50,0.3)] disabled:opacity-50 animate-pulse hover:animate-none">
                        {claimMutation.isPending ? 'Claiming...' : 'Claim Bonus Trip!'}
                      </button>
                    )}

                    {/* Fleet Manager Actions */}
                    {canDispatch && trip.status === 'ASSIGNED' && (
                      <button onClick={() => dispatchMutation.mutate(trip.id)} disabled={dispatchMutation.isPending} className="bg-[#f0b232] hover:bg-[#d69f2c] text-[#1e1f22] px-4 py-1.5 rounded-md text-sm font-bold transition-colors disabled:opacity-50 shadow-lg">
                        Dispatch
                      </button>
                    )}
                    {(canDispatch || isDriver) && (trip.status === 'IN_PROGRESS' || trip.status === 'READY_TO_START') && (
                      <button onClick={() => completeMutation.mutate(trip.id)} disabled={completeMutation.isPending} className="bg-[#23a559]/20 hover:bg-[#23a559]/30 text-[#23a559] px-4 py-1.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 border border-[#23a559]/30">
                        Complete
                      </button>
                    )}
                    {canDispatch && (trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED') && (
                      <button onClick={() => cancelMutation.mutate(trip.id)} disabled={cancelMutation.isPending} className="bg-[#f23f42]/10 hover:bg-[#f23f42]/20 text-[#f23f42] px-3 py-1.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-50">
                        Cancel
                      </button>
                    )}
                    
                    {/* Universal Log Action */}
                    {(isDriver || canDispatch) && trip.status === 'COMPLETED' && !trip.reportsLogged && (
                      <button onClick={() => setLogTripId(trip.id)} className="bg-[#23a559] hover:bg-[#1c8446] text-white px-4 py-1.5 rounded-md text-sm font-bold transition-colors shadow-lg">
                        Log Data
                      </button>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create Trip Modal (With Backdrop Blur via Modal Component) */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create & Assign Transit">
        <div className="flex flex-col gap-4 text-[#dbdee1]">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">SOURCE</label>
              <input type="text" value={source} onChange={e => setSource(e.target.value)} placeholder="Gandhinagar" className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2.5 focus:border-[#5865f2] outline-none transition-colors"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">DESTINATION</label>
              <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Ahmedabad" className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2.5 focus:border-[#5865f2] outline-none transition-colors"/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">SCHED. START</label>
              <input type="datetime-local" value={scheduledStartTime} onChange={e => setScheduledStartTime(e.target.value)} className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2.5 focus:border-[#5865f2] outline-none transition-colors"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">SCHED. END</label>
              <input type="datetime-local" value={scheduledEndTime} onChange={e => setScheduledEndTime(e.target.value)} className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2.5 focus:border-[#5865f2] outline-none transition-colors"/>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">VEHICLE (SEARCH TO ASSIGN)</label>
            <input 
              type="text" 
              value={vehicleSearch} 
              onChange={e => { setVehicleSearch(e.target.value); if (vehicleId) setVehicleId(''); }} 
              onFocus={() => setVehicleFocused(true)}
              onBlur={() => setTimeout(() => setVehicleFocused(false), 200)}
              placeholder="Click to view or search..." 
              className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2.5 focus:border-[#5865f2] outline-none transition-colors"
            />
            {vehicleFocused && !vehicleId && (
              <div className="absolute top-[100%] left-0 right-0 bg-[#2b2d31] border border-[#313338] mt-1 rounded-md max-h-48 overflow-y-auto z-50 shadow-2xl custom-scrollbar">
                {vehicles?.filter((v: Vehicle) => v.registrationNumber.toLowerCase().includes(vehicleSearch.toLowerCase())).map((v: Vehicle) => (
                  <div 
                    key={v.id} 
                    onMouseDown={(e) => { e.preventDefault(); setVehicleId(v.id); setVehicleSearch(`${v.registrationNumber} (${v.capacity}kg)`); }} 
                    className="px-3 py-2.5 text-sm text-[#dbdee1] hover:bg-[#5865f2] cursor-pointer border-b border-[#313338] transition-colors"
                  >
                    {v.registrationNumber} <span className="opacity-75">- {v.capacity}kg</span>
                  </div>
                ))}
                {vehicles?.filter((v: Vehicle) => v.registrationNumber.toLowerCase().includes(vehicleSearch.toLowerCase())).length === 0 && (
                  <div className="px-3 py-2.5 text-sm text-[#949ba4] italic">No available vehicles found.</div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 bg-[#1e1f22] p-3 rounded-md border border-[#313338]">
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
              className="w-4 h-4 rounded bg-[#313338] border-none text-[#5865f2] focus:ring-0 cursor-pointer"
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
                onBlur={() => setTimeout(() => setDriverFocused(false), 200)}
                placeholder="Click to view or search..." 
                className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2.5 focus:border-[#5865f2] outline-none transition-colors"
              />
              {driverFocused && !driverId && (
                <div className="absolute top-[100%] left-0 right-0 bg-[#2b2d31] border border-[#313338] mt-1 rounded-md max-h-48 overflow-y-auto z-50 shadow-2xl custom-scrollbar">
                  {drivers?.filter((d: Driver) => d.name.toLowerCase().includes(driverSearch.toLowerCase()) || d.licenseNumber.toLowerCase().includes(driverSearch.toLowerCase())).map((d: Driver) => (
                    <div 
                      key={d.id} 
                      onMouseDown={(e) => { e.preventDefault(); setDriverId(d.id); setDriverSearch(`${d.name} (${d.licenseNumber})`); }} 
                      className="px-3 py-2.5 text-sm text-[#dbdee1] hover:bg-[#5865f2] cursor-pointer border-b border-[#313338] flex justify-between transition-colors"
                    >
                      <span>{d.name}</span><span className="opacity-75 font-mono text-xs">{d.licenseNumber}</span>
                    </div>
                  ))}
                  {drivers?.filter((d: Driver) => d.name.toLowerCase().includes(driverSearch.toLowerCase()) || d.licenseNumber.toLowerCase().includes(driverSearch.toLowerCase())).length === 0 && (
                    <div className="px-3 py-2.5 text-sm text-[#949ba4] italic">No available drivers found.</div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">WEIGHT (KG)</label>
              <input type="number" value={cargoWeight} onChange={e => setCargoWeight(e.target.value)} placeholder="700" className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2.5 focus:border-[#5865f2] outline-none transition-colors"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">DISTANCE (KM)</label>
              <input type="number" value={plannedDistance} onChange={e => setPlannedDistance(e.target.value)} placeholder="38" className="w-full bg-[#1e1f22] text-[#dbdee1] text-sm border border-[#313338] rounded-md px-3 py-2.5 focus:border-[#5865f2] outline-none transition-colors"/>
            </div>
          </div>

          {capacityError > 0 && selectedVehicle && (
            <div className="border border-[#f23f42] rounded-md p-3 bg-[#f23f42]/10 mt-1">
              <div className="text-xs text-[#f2f3f5]">Vehicle Capacity: {selectedVehicle.capacity} kg | Cargo: {cargoWeight} kg</div>
              <div className="text-xs text-[#f23f42] font-semibold mt-1">✕ Exceeded by {capacityError} kg - creation blocked</div>
            </div>
          )}

          <div className="pt-2 mt-2 border-t border-[#1e1f22]">
            <button 
              onClick={handleCreate}
              disabled={capacityError > 0 || createTripMutation.isPending}
              className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              {createTripMutation.isPending ? 'Assigning...' : capacityError > 0 ? 'Create (disabled)' : 'Create & Assign Transit'}
            </button>
          </div>
        </div>
      </Modal>

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
