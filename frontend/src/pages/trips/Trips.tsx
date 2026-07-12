import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/axios';
import { Modal } from '@/components/Modal';
import { PostTripLogForm } from '@/components/forms/PostTripLogForm';
import { useAuth } from '@/contexts/AuthContext';
import { useTripMutations } from './useTripMutations';
import { TripRow } from './TripRow';
import { CreateTripModal } from './CreateTripModal';
import { ExpenseModal } from './ExpenseModal';
import type { Trip, Vehicle, Driver } from '@/types';

export default function Trips() {
  const { role } = useAuth();
  const mutations = useTripMutations();

  const [statusFilter, setStatusFilter] = useState('All');
  const [driverFilter, setDriverFilter] = useState('All');
  const [logTripId, setLogTripId] = useState<string | null>(null);
  const [expenseTripId, setExpenseTripId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

  const canDispatch = role === 'ADMIN' || role === 'FLEET_MANAGER';
  const isDriver = role === 'DRIVER';

  // Queries
  const { data: rawTrips, isLoading, isError } = useQuery<Trip[]>({
    queryKey: ['trips'],
    queryFn: async () => {
      const { data } = await api.get(isDriver ? '/trips/my-trips' : '/trips');
      return data;
    },
  });

  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data } = await api.get('/vehicles');
      return data.filter((v: Vehicle) => v.status === 'AVAILABLE');
    },
    enabled: canDispatch,
  });

  const { data: drivers } = useQuery<Driver[]>({
    queryKey: ['drivers'],
    queryFn: async () => {
      const { data } = await api.get('/drivers');
      return data.filter((d: Driver) => d.status === 'AVAILABLE');
    },
    enabled: canDispatch,
  });

  if (isLoading) return <div className="p-6 text-[#949ba4] text-sm">Loading transits...</div>;
  if (isError) return <div className="p-6 text-[#f23f42] text-sm">Error loading data. Please try again.</div>;

  // Filters
  let filteredTrips = rawTrips || [];
  if (canDispatch) {
    if (statusFilter !== 'All') {
      if (statusFilter === 'Delayed') {
        const now = new Date();
        filteredTrips = filteredTrips.filter(t =>
          (t.status === 'READY_TO_START' || t.status === 'ASSIGNED') &&
          t.scheduledStartTime && new Date(t.scheduledStartTime) < now && !t.actualStartTime
        );
      } else {
        filteredTrips = filteredTrips.filter(t => t.status === statusFilter);
      }
    }
    if (driverFilter !== 'All') {
      filteredTrips = filteredTrips.filter(t => t.driver?.name === driverFilter);
    }
  }

  const uniqueDrivers = Array.from(new Set(rawTrips?.map(t => t.driver?.name).filter(Boolean)));

  const pendingFlags = {
    accept: mutations.accept.isPending,
    claim: mutations.claim.isPending,
    dispatch: mutations.dispatch.isPending,
    start: mutations.start.isPending,
    complete: mutations.complete.isPending,
    cancel: mutations.cancel.isPending,
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1f22] text-[#f2f3f5] overflow-hidden">

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-[#313338] bg-[#1e1f22] z-10 shrink-0">
        <h1 className="text-xl font-bold tracking-tight">
          {isDriver ? 'My Assigned Transits' : 'Operations Live Board'}
        </h1>
        <div className="flex items-center gap-4">
          {canDispatch && (
            <>
              <select value={driverFilter} onChange={e => setDriverFilter(e.target.value)} className="bg-[#1e1f22] text-[#949ba4] text-sm border border-[#313338] rounded-md px-3 py-2 outline-none focus:border-[#5865f2] transition-colors">
                <option value="All">All Drivers</option>
                {uniqueDrivers.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-[#1e1f22] text-[#949ba4] text-sm border border-[#313338] rounded-md px-3 py-2 outline-none focus:border-[#5865f2] transition-colors">
                <option value="All">All Statuses</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="READY_TO_START">Ready To Start</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="Delayed">⚠️ Delayed</option>
              </select>
              <button onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#23a559] hover:bg-[#1c8446] text-white px-5 py-2 rounded-md font-bold text-sm transition-colors shadow-lg shadow-[#23a559]/20 flex items-center gap-2">
                <span>+ New Transit</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Trip List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#1e1f22]">
        <div className="flex flex-col rounded-md border border-[#313338] bg-[#2b2d31]">
          {filteredTrips.length === 0 ? (
            <div className="p-8 text-center text-[#949ba4]">{isDriver ? 'You have no assigned trips right now.' : 'No transits match the current filters.'}</div>
          ) : (
            filteredTrips.map((trip, index) => (
              <TripRow
                key={trip.id}
                trip={trip}
                isLast={index === filteredTrips.length - 1}
                isDriver={isDriver}
                canDispatch={canDispatch}
                expandedTripId={expandedTripId}
                onToggleExpand={id => setExpandedTripId(expandedTripId === id ? null : id)}
                onAccept={id => mutations.accept.mutate(id)}
                onClaim={id => mutations.claim.mutate(id)}
                onDispatch={id => mutations.dispatch.mutate(id)}
                onStart={id => mutations.start.mutate(id)}
                onComplete={id => mutations.complete.mutate(id)}
                onCancel={id => mutations.cancel.mutate(id)}
                onLogExpense={id => setExpenseTripId(id)}
                onLogFinal={id => setLogTripId(id)}
                isPending={pendingFlags}
              />
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateTripModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        vehicles={vehicles}
        drivers={drivers}
        onCreate={data => { mutations.createTrip.mutate(data); setIsCreateModalOpen(false); }}
        isPending={mutations.createTrip.isPending}
      />

      {logTripId && (
        <Modal isOpen onClose={() => setLogTripId(null)} title="Submit Post-Trip Log">
          <PostTripLogForm
            vehicleOdometer={rawTrips?.find(t => t.id === logTripId)?.vehicle?.odometer || 0}
            onSubmit={data => mutations.log.mutate({ id: logTripId, data }, { onSuccess: () => setLogTripId(null) })}
            isLoading={mutations.log.isPending}
          />
        </Modal>
      )}

      {expenseTripId && (
        <ExpenseModal
          tripId={expenseTripId}
          onClose={() => setExpenseTripId(null)}
          onSubmit={(id, data) => mutations.midTripExpense.mutate({ id, data }, { onSuccess: () => setExpenseTripId(null) })}
          isPending={mutations.midTripExpense.isPending}
        />
      )}
    </div>
  );
}
