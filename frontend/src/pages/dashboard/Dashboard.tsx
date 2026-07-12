import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import type { Trip } from '@/types';
import { useState } from 'react';
import { Clock, Activity, Target, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [delayedTripsFilter, setDelayedTripsFilter] = useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-metrics', user?.role],
    queryFn: async () => {
      const endpoint = user?.role === 'DRIVER' ? '/dashboard/my-metrics' : '/dashboard/metrics';
      const res = await api.get(endpoint);
      return res.data;
    },
  });

  const { data: allTrips, isLoading: tripsLoading } = useQuery<Trip[]>({
    queryKey: ['trips'],
    queryFn: async () => {
      const res = await api.get('/trips');
      return res.data;
    },
    enabled: user?.role === 'ADMIN' || user?.role === 'FLEET_MANAGER',
  });

  const m = data?.metrics;
  const recentTrips = data?.recentTrips || [];
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'FLEET_MANAGER';

  let delayedTripsList: Trip[] = [];
  if (isAdmin && allTrips) {
    const now = new Date();
    delayedTripsList = allTrips.filter(t => 
      (t.status === 'READY_TO_START' || t.status === 'ASSIGNED') && 
      t.scheduledStartTime && 
      new Date(t.scheduledStartTime) < now && 
      !t.actualStartTime
    );
  }

  let widgetTrips = allTrips || [];
  if (delayedTripsFilter === 'Delayed') {
    const now = new Date();
    widgetTrips = widgetTrips.filter(t => (t.status === 'READY_TO_START' || t.status === 'ASSIGNED') && t.scheduledStartTime && new Date(t.scheduledStartTime) < now && !t.actualStartTime);
  } else if (delayedTripsFilter !== 'All') {
    widgetTrips = widgetTrips.filter(t => t.status.replace('_', ' ') === delayedTripsFilter.toUpperCase() || t.status === delayedTripsFilter.toUpperCase());
  }

  widgetTrips = [...widgetTrips].sort((a, b) => {
    if (!a.scheduledStartTime) return 1;
    if (!b.scheduledStartTime) return -1;
    return new Date(b.scheduledStartTime).getTime() - new Date(a.scheduledStartTime).getTime();
  });

  const formatDelay = (scheduled: string) => {
    const diffMs = new Date().getTime() - new Date(scheduled).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="flex flex-col gap-10 text-[#f2f3f5] min-h-full">
      
      {/* Welcome Section */}
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#f2f3f5] mb-2">
            Dashboard
          </h1>
          <p className="text-base font-medium text-[#949ba4]">
            Welcome back, {user?.name}. Here is your operational overview.
          </p>
        </div>
      </div>

      {/* Admin Delayed Trips Warning Banner */}
      {isAdmin && delayedTripsList.length > 0 && (
        <div className="bg-[#f23f42]/10 border border-[#f23f42]/30 rounded-2xl p-5 flex items-center justify-between shadow-[0_0_15px_rgba(242,63,66,0.1)] transform transition-all hover:scale-[1.01]">
          <div className="flex items-center gap-4">
            <div className="bg-[#f23f42]/20 p-2 rounded-full">
              <AlertCircle size={24} className="text-[#f23f42] animate-pulse" />
            </div>
            <span className="text-[#dbdee1] font-bold text-base">Action Required: Delayed trips detected!</span>
          </div>
          <span className="text-[#f23f42] text-sm font-bold bg-[#f23f42]/20 px-4 py-2 rounded-xl border border-[#f23f42]/30">{delayedTripsList.length} Delayed Operations</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {isAdmin ? (
          <>
            <MetricCard title="Active Vehicles" value={isLoading ? '...' : m?.activeVehicles} icon={<Activity size={24} />} color="#5865f2" />
            <MetricCard title="Available Vehicles" value={isLoading ? '...' : m?.availableVehicles} color="#23a559" />
            <MetricCard title="Active Trips" value={isLoading ? '...' : m?.activeTrips} icon={<Clock size={24} />} color="#5865f2" />
            <MetricCard title="Fleet Utilization" value={isLoading ? '...' : `${m?.fleetUtilization}%`} icon={<Target size={24} />} color="#23a559" />
          </>
        ) : (
          <>
            <MetricCard title="Assigned Trips" value={isLoading ? '...' : m?.assignedTrips} color="#f0b232" />
            <MetricCard title="Completed Trips" value={isLoading ? '...' : m?.completedTrips} icon={<Target size={24} />} color="#23a559" />
            <MetricCard title="Total Travelled" value={isLoading ? '...' : `${m?.totalTravelledDistance || 0} km`} color="#5865f2" />
            <MetricCard title="Total Costs" value={isLoading ? '...' : `$${m?.totalCosts || 0}`} color="#f23f42" />
          </>
        )}
      </div>

      {/* Admin Delay Widget */}
      {isAdmin && (
        <div className="flex flex-col bg-[#2b2d31] rounded-2xl border border-[#313338] shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <div className="flex justify-between items-center px-8 py-6 border-b border-[#313338]">
            <h2 className="text-lg font-bold text-[#f2f3f5]">Live Operations Board</h2>
            <select 
              value={delayedTripsFilter} 
              onChange={e => setDelayedTripsFilter(e.target.value)} 
              className="bg-[#1e1f22] text-[#dbdee1] text-sm font-semibold border border-[#313338] rounded-xl px-4 py-2 outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2] transition-all cursor-pointer"
            >
              <option value="All">All Operations</option>
              <option value="Delayed">🚨 Delayed Only</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1e1f22]/60 border-b border-[#313338] text-xs font-bold text-[#949ba4] uppercase tracking-wider">
                  <th className="px-8 py-5">Driver</th>
                  <th className="px-8 py-5">Vehicle</th>
                  <th className="px-8 py-5">Scheduled</th>
                  <th className="px-8 py-5">Delay Tracker</th>
                  <th className="px-8 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#313338] text-base text-[#dbdee1]">
                {tripsLoading ? (
                  <tr><td colSpan={5} className="px-8 py-10 text-center text-[#949ba4] font-medium text-sm">Loading operations...</td></tr>
                ) : widgetTrips.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-10 text-center text-[#949ba4] font-medium text-sm">No active operations found for this filter.</td></tr>
                ) : (
                  widgetTrips.map((trip: Trip) => {
                    const isCurrentlyDelayed = (trip.status === 'READY_TO_START' || trip.status === 'ASSIGNED') && trip.scheduledStartTime && new Date(trip.scheduledStartTime) < new Date() && !trip.actualStartTime;
                    
                    return (
                      <tr key={trip.id} className="hover:bg-[#313338]/40 transition-colors group">
                        <td className="px-8 py-5 font-bold text-[#f2f3f5]">{trip.driver?.name || '—'}</td>
                        <td className="px-8 py-5 font-mono text-sm text-[#949ba4] group-hover:text-[#dbdee1] transition-colors">{trip.vehicle?.registrationNumber || '—'}</td>
                        <td className="px-8 py-5 text-[#949ba4] text-sm group-hover:text-[#dbdee1] transition-colors">{trip.scheduledStartTime ? new Date(trip.scheduledStartTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}</td>
                        <td className="px-8 py-5 font-mono text-sm">
                          {isCurrentlyDelayed ? <span className="text-[#f23f42] font-bold">+{formatDelay(trip.scheduledStartTime as string)}</span> : <span className="text-[#4f545c]">—</span>}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <StatusBadge status={isCurrentlyDelayed ? 'DELAYED' : trip.status} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Driver Recent Trips */}
      {!isAdmin && (
        <div className="flex flex-col bg-[#2b2d31] rounded-2xl border border-[#313338] shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <div className="px-8 py-6 border-b border-[#313338]">
            <h2 className="text-lg font-bold text-[#f2f3f5]">Recent Operational History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1e1f22]/60 border-b border-[#313338] text-xs font-bold text-[#949ba4] uppercase tracking-wider">
                  <th className="px-8 py-5">Operation ID</th>
                  <th className="px-8 py-5">Vehicle Assigned</th>
                  <th className="px-8 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#313338] text-base text-[#dbdee1]">
                {isLoading ? (
                  <tr><td colSpan={3} className="px-8 py-10 text-center text-[#949ba4] font-medium text-sm">Loading operational history...</td></tr>
                ) : recentTrips.length === 0 ? (
                  <tr><td colSpan={3} className="px-8 py-10 text-center text-[#949ba4] font-medium text-sm">No recent operations found.</td></tr>
                ) : (
                  recentTrips.map((trip: any) => (
                    <tr key={trip.id} className="hover:bg-[#313338]/40 transition-colors group">
                      <td className="px-8 py-5 font-mono text-sm text-[#949ba4] group-hover:text-[#dbdee1] transition-colors">{trip.id.substring(0,8).toUpperCase()}</td>
                      <td className="px-8 py-5 font-bold text-[#f2f3f5]">{trip.vehicle.registrationNumber}</td>
                      <td className="px-8 py-5 text-right"><StatusBadge status={trip.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon, color }: { title: string; value: any; icon?: React.ReactNode; color?: string }) {
  return (
    <div className="relative bg-[#2b2d31] border border-[#313338] rounded-2xl p-6 flex flex-col justify-between shadow-lg hover:-translate-y-1 hover:shadow-xl hover:border-[#4f545c] transition-all duration-300 overflow-hidden group">
      {color && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 group-hover:w-2" style={{ backgroundColor: color }}></div>
      )}
      <div className={`flex items-center justify-between mb-6 ${color ? 'ml-2' : ''}`}>
        <span className="text-xs font-bold text-[#949ba4] uppercase tracking-wider">{title}</span>
        {icon && <span className="text-[#4f545c] transition-colors duration-300 group-hover:text-[#dbdee1]">{icon}</span>}
      </div>
      <div className={`text-4xl font-bold text-[#f2f3f5] tracking-tight ${color ? 'ml-2' : ''}`}>
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let color = 'text-[#dbdee1] bg-[#4f545c]';
  let label = status.replace(/_/g, ' ');

  if (status === 'IN_PROGRESS') color = 'text-white bg-[#5865f2] shadow-[0_0_10px_rgba(88,101,242,0.4)]';
  else if (status === 'READY_TO_START') color = 'text-[#1e1f22] bg-[#f0b232] shadow-[0_0_10px_rgba(240,178,50,0.4)]';
  else if (status === 'ASSIGNED') color = 'text-white bg-[#23a559] shadow-[0_0_10px_rgba(35,165,89,0.4)]';
  else if (status === 'COMPLETED') color = 'text-white bg-[#23a559]';
  else if (status === 'CANCELLED') color = 'text-white bg-[#f23f42] shadow-[0_0_10px_rgba(242,63,66,0.4)]';
  else if (status === 'DELAYED') color = 'text-white bg-[#f23f42] shadow-[0_0_10px_rgba(242,63,66,0.4)] animate-pulse';

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider uppercase ${color}`}>
      {label}
    </span>
  );
}
