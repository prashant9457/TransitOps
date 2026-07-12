import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const res = await api.get('/dashboard/metrics');
      return res.data;
    },
  });

  const m = data?.metrics;
  const recentTrips = data?.recentTrips || [];

  return (
    <div className="flex flex-col gap-6 text-[#f2f3f5] min-h-full">
      {/* Filters Section */}
      <div>
        <div className="text-xs font-bold text-[#949ba4] uppercase tracking-wider mb-3">Filters</div>
        <div className="flex flex-wrap gap-4">
          <select className="bg-[#1e1f22] text-[#dbdee1] border border-[#313338] rounded-md px-4 py-2 focus:outline-none focus:border-[#5865f2] w-48 text-sm">
            <option>Vehicle Type: All</option>
          </select>
          <select className="bg-[#1e1f22] text-[#dbdee1] border border-[#313338] rounded-md px-4 py-2 focus:outline-none focus:border-[#5865f2] w-48 text-sm">
            <option>Status: All</option>
          </select>
          <select className="bg-[#1e1f22] text-[#dbdee1] border border-[#313338] rounded-md px-4 py-2 focus:outline-none focus:border-[#5865f2] w-48 text-sm">
            <option>Region: All</option>
          </select>
        </div>
      </div>

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

      {/* Bottom Layout */}
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
                  <th className="px-5 py-4 font-medium">Driver</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium text-right">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#313338] text-sm text-[#dbdee1]">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-[#949ba4]">Loading trips...</td>
                  </tr>
                ) : recentTrips.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-[#949ba4]">No recent trips.</td>
                  </tr>
                ) : (
                  recentTrips.map((trip: any) => (
                    <tr key={trip.id} className="hover:bg-[#2b2d31]/50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs">{trip.id.substring(0,8).toUpperCase()}</td>
                      <td className="px-5 py-4">{trip.vehicle.registrationNumber}</td>
                      <td className="px-5 py-4">{trip.driver.name}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={trip.status} />
                      </td>
                      <td className="px-5 py-4 text-right text-[#949ba4]">
                        {trip.status === 'DRAFT' ? 'Awaiting vehicle' : trip.status === 'COMPLETED' ? '—' : 'Calculated'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Status */}
        <div className="flex flex-col">
          <h2 className="text-sm font-bold text-[#949ba4] uppercase tracking-wider mb-4">Vehicle Status</h2>
          <div className="space-y-5 mt-2">
            <StatusBar 
              label="Available" 
              count={m?.availableVehicles} 
              total={m?.totalVehicles} 
              color="bg-[#23a559]" 
            />
            <StatusBar 
              label="On Trip" 
              count={m?.activeVehicles} 
              total={m?.totalVehicles} 
              color="bg-[#5865f2]" 
            />
            <StatusBar 
              label="In Shop" 
              count={m?.vehiclesInShop} 
              total={m?.totalVehicles} 
              color="bg-[#f0b232]" 
            />
            <StatusBar 
              label="Retired" 
              count={m?.retiredVehicles} 
              total={m?.totalVehicles} 
              color="bg-[#f23f42]" 
            />
          </div>
        </div>
      </div>
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
  let bgColor = 'bg-[#4f545c] text-[#f2f3f5]'; // DRAFT / Default (Gray)
  let label = status;

  if (status === 'DISPATCHED') {
    bgColor = 'bg-[#5865f2] text-white'; // Blue
    label = 'Dispatched';
  } else if (status === 'ON_TRIP') {
    bgColor = 'bg-[#5865f2] text-white'; // Blue
    label = 'On Trip';
  } else if (status === 'COMPLETED') {
    bgColor = 'bg-[#23a559] text-white'; // Green
    label = 'Completed';
  } else if (status === 'DRAFT') {
    bgColor = 'bg-[#949ba4] text-white'; // Gray
    label = 'Draft';
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold ${bgColor}`}>
      {label}
    </span>
  );
}

function StatusBar({ label, count = 0, total = 0, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div className="flex items-center gap-4">
      <div className="w-24 text-sm text-[#dbdee1] font-medium">{label}</div>
      <div className="flex-1 h-3 bg-[#1e1f22] rounded-full overflow-hidden border border-[#313338]">
        <div 
          className={`h-full ${color} rounded-r-full transition-all duration-500`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
