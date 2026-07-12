import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import type { Driver, Trip } from '@/types';
import { useState } from 'react';

export default function Dashboard() {
  const { user } = useAuth();
  const [delayedTripsFilter, setDelayedTripsFilter] = useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const res = await api.get('/dashboard/metrics');
      return res.data;
    },
  });

  const { data: drivers, isLoading: driversLoading } = useQuery<Driver[]>({
    queryKey: ['drivers'],
    queryFn: async () => {
      const res = await api.get('/drivers');
      return res.data;
    },
    enabled: user?.role === 'DRIVER', // Only fetch if the user is a driver
  });

  // Admin specifically needs all trips to display delays
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
  
  const myDriverProfile = drivers?.find((d) => d.name.toLowerCase() === user?.name.toLowerCase());
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'FLEET_MANAGER';

  // Calculate Delayed Trips
  let delayedTripsList: Trip[] = [];
  if (isAdmin && allTrips) {
    const now = new Date();
    // A trip is globally considered delayed if it was supposed to start but actualStartTime is NULL
    delayedTripsList = allTrips.filter(t => 
      (t.status === 'READY_TO_START' || t.status === 'ASSIGNED') && 
      t.scheduledStartTime && 
      new Date(t.scheduledStartTime) < now && 
      !t.actualStartTime
    );

    if (delayedTripsFilter !== 'All') {
      if (delayedTripsFilter === 'Delayed') {
        // already handled by default definition above, but if they explicitly ask for delayed
        // wait, the user asked to filter the widget by "All, Delayed, In Progress, Completed, Cancelled"
        // Let's re-evaluate allTrips instead of just delayedTripsList
      }
    }
  }

  let widgetTrips = allTrips || [];
  if (delayedTripsFilter === 'Delayed') {
    const now = new Date();
    widgetTrips = widgetTrips.filter(t => (t.status === 'READY_TO_START' || t.status === 'ASSIGNED') && t.scheduledStartTime && new Date(t.scheduledStartTime) < now && !t.actualStartTime);
  } else if (delayedTripsFilter !== 'All') {
    widgetTrips = widgetTrips.filter(t => t.status.replace('_', ' ') === delayedTripsFilter.toUpperCase() || t.status === delayedTripsFilter.toUpperCase());
  }

  // Sort widget trips by scheduledStartTime descending
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
    <div className="flex flex-col gap-6 text-[#f2f3f5] min-h-full p-6">
      
      {/* Welcome Banner */}
      <div className="bg-[#1e1f22] border border-[#313338] rounded-md p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5865f2]"></div>
        <div className="flex flex-col gap-1 z-10">
          <h1 className="text-2xl font-bold text-[#f2f3f5]">Welcome back, {user?.name}</h1>
          <div className="text-sm text-[#949ba4] font-medium flex items-center gap-2">
            <span>{user?.email}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#313338]"></span>
            <span className="uppercase tracking-wider text-[10px] bg-[#5865f2]/20 text-[#5865f2] px-2 py-0.5 rounded-sm font-bold">
              {user?.role.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Driver Specific Details */}
        {user?.role === 'DRIVER' && (
          <div className="flex-1 max-w-xl bg-[#2b2d31] p-4 rounded-md border border-[#313338] grid grid-cols-2 md:grid-cols-4 gap-4 z-10">
            {driversLoading ? (
              <div className="text-xs text-[#949ba4] col-span-4">Loading driver profile...</div>
            ) : myDriverProfile ? (
              <>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">Status</span>
                  <StatusBadge status={myDriverProfile.status} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">Safety Score</span>
                  <span className={`text-sm font-bold ${myDriverProfile.safetyScore >= 90 ? 'text-[#23a559]' : 'text-[#f0b232]'}`}>
                    {myDriverProfile.safetyScore}/100
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">License</span>
                  <span className="text-sm font-mono text-[#dbdee1]">{myDriverProfile.licenseNumber}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">Expiry</span>
                  <span className="text-sm text-[#dbdee1]">{new Date(myDriverProfile.licenseExpiry).toLocaleDateString()}</span>
                </div>
              </>
            ) : (
              <div className="text-xs text-[#f0b232] col-span-4 font-medium flex items-center gap-2">
                ⚠️ No matching driver profile found in the database for "{user?.name}".
              </div>
            )}
          </div>
        )}
      </div>

      {/* Admin Delayed Trips Warning Banner */}
      {isAdmin && delayedTripsList.length > 0 && (
        <div className="bg-[#f23f42]/10 border border-[#f23f42] rounded-md p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#f23f42] animate-pulse"></div>
            <span className="text-[#f23f42] font-bold text-sm">Action Required: Driver has not started the assigned trip!</span>
          </div>
          <span className="text-[#f23f42] text-xs font-semibold">{delayedTripsList.length} Delayed Trips Detected</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="flex flex-wrap gap-4 mt-2">
        <MetricCard title="ACTIVE VEHICLES" value={isLoading ? '...' : m?.activeVehicles} barColor="bg-[#5865f2]" />
        <MetricCard title="AVAILABLE VEHICLES" value={isLoading ? '...' : m?.availableVehicles} barColor="bg-[#23a559]" />
        <MetricCard title="VEHICLES IN MAINTENANCE" value={isLoading ? '...' : m?.vehiclesInShop} barColor="bg-[#f0b232]" />
        <MetricCard title="ACTIVE TRIPS" value={isLoading ? '...' : m?.activeTrips} barColor="bg-[#5865f2]" />
        <MetricCard title="PENDING TRIPS" value={isLoading ? '...' : m?.pendingTrips} barColor="bg-[#5865f2]/50" />
        <MetricCard title="DRIVERS ON DUTY" value={isLoading ? '...' : m?.driversOnDuty} />
        <MetricCard title="FLEET UTILIZATION" value={isLoading ? '...' : `${m?.fleetUtilization}%`} barColor="bg-[#23a559]" />
      </div>

      {/* Admin Delay Widget */}
      {isAdmin && (
        <div className="mt-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-[#949ba4] uppercase tracking-wider">Delay Detection & Monitoring</h2>
            <select 
              value={delayedTripsFilter} 
              onChange={e => setDelayedTripsFilter(e.target.value)} 
              className="bg-[#1e1f22] text-[#949ba4] text-xs border border-[#313338] rounded-md px-3 py-1.5 outline-none focus:border-[#5865f2]"
            >
              <option value="All">All Operations</option>
              <option value="Delayed">⚠️ Delayed Only</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="bg-[#1e1f22] rounded-lg border border-[#313338] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#313338] text-xs font-semibold text-[#949ba4] uppercase tracking-wider">
                  <th className="px-5 py-4 font-medium">Driver Name</th>
                  <th className="px-5 py-4 font-medium">Vehicle</th>
                  <th className="px-5 py-4 font-medium">Scheduled Time</th>
                  <th className="px-5 py-4 font-medium">Delay Duration</th>
                  <th className="px-5 py-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#313338] text-sm text-[#dbdee1]">
                {tripsLoading ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-[#949ba4]">Loading operations data...</td></tr>
                ) : widgetTrips.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-[#949ba4]">No trips match this filter.</td></tr>
                ) : (
                  widgetTrips.map((trip: Trip) => {
                    const isCurrentlyDelayed = (trip.status === 'READY_TO_START' || trip.status === 'ASSIGNED') && trip.scheduledStartTime && new Date(trip.scheduledStartTime) < new Date() && !trip.actualStartTime;
                    
                    return (
                      <tr key={trip.id} className="hover:bg-[#2b2d31]/50 transition-colors">
                        <td className="px-5 py-4 font-medium">{trip.driver?.name || 'Unassigned'}</td>
                        <td className="px-5 py-4 font-mono text-xs">{trip.vehicle?.registrationNumber || 'Unassigned'}</td>
                        <td className="px-5 py-4">{trip.scheduledStartTime ? new Date(trip.scheduledStartTime).toLocaleString() : 'N/A'}</td>
                        <td className="px-5 py-4 font-mono text-xs">
                          {isCurrentlyDelayed ? <span className="text-[#f23f42] font-bold">+{formatDelay(trip.scheduledStartTime as string)}</span> : '—'}
                        </td>
                        <td className="px-5 py-4 text-right">
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

      {/* Bottom Layout - Legacy Status & Recent */}
      {!isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 flex-1">
          {/* Recent Trips */}
          <div className="lg:col-span-2 flex flex-col">
            <h2 className="text-sm font-bold text-[#949ba4] uppercase tracking-wider mb-4">Recent Trips</h2>
            <div className="bg-[#1e1f22] rounded-lg border border-[#313338] overflow-hidden flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#313338] text-xs font-semibold text-[#949ba4] uppercase tracking-wider">
                    <th className="px-5 py-4 font-medium">Trip</th>
                    <th className="px-5 py-4 font-medium">Vehicle</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#313338] text-sm text-[#dbdee1]">
                  {isLoading ? (
                    <tr><td colSpan={3} className="px-5 py-8 text-center text-[#949ba4]">Loading trips...</td></tr>
                  ) : recentTrips.length === 0 ? (
                    <tr><td colSpan={3} className="px-5 py-8 text-center text-[#949ba4]">No recent trips.</td></tr>
                  ) : (
                    recentTrips.map((trip: any) => (
                      <tr key={trip.id} className="hover:bg-[#2b2d31]/50 transition-colors">
                        <td className="px-5 py-4 font-mono text-xs">{trip.id.substring(0,8).toUpperCase()}</td>
                        <td className="px-5 py-4">{trip.vehicle.registrationNumber}</td>
                        <td className="px-5 py-4"><StatusBadge status={trip.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, barColor }: { title: string; value: any; barColor?: string }) {
  return (
    <div className="bg-[#1e1f22] border border-[#313338] rounded-md p-5 flex flex-col justify-between min-w-[160px] flex-1 relative overflow-hidden">
      {barColor && (
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${barColor}`}></div>
      )}
      <div className={`text-[10px] font-bold text-[#949ba4] uppercase tracking-wider mb-3 ${barColor ? 'ml-2' : ''}`}>
        {title}
      </div>
      <div className={`text-3xl font-light text-[#f2f3f5] ${barColor ? 'ml-2' : ''}`}>
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let bgColor = 'bg-[#4f545c] text-[#f2f3f5]'; // Default
  let label = status.replace(/_/g, ' ');

  if (status === 'IN_PROGRESS') bgColor = 'bg-[#5865f2] text-white';
  else if (status === 'READY_TO_START') bgColor = 'bg-[#f0b232] text-white';
  else if (status === 'ASSIGNED') bgColor = 'bg-[#23a559] text-white';
  else if (status === 'COMPLETED') bgColor = 'bg-[#23a559] text-white';
  else if (status === 'CANCELLED') bgColor = 'bg-[#f23f42] text-white';
  else if (status === 'DELAYED') bgColor = 'bg-[#f23f42] text-white';

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${bgColor}`}>
      {label}
    </span>
  );
}
