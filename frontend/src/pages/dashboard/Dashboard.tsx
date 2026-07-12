import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', trips: 40 },
  { name: 'Tue', trips: 30 },
  { name: 'Wed', trips: 20 },
  { name: 'Thu', trips: 27 },
  { name: 'Fri', trips: 18 },
  { name: 'Sat', trips: 23 },
  { name: 'Sun', trips: 34 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm font-medium">Active Vehicles</div>
          <div className="text-3xl font-bold mt-2 text-gray-800">24</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm font-medium">Drivers On Duty</div>
          <div className="text-3xl font-bold mt-2 text-gray-800">18</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm font-medium">Vehicles In Shop</div>
          <div className="text-3xl font-bold mt-2 text-gray-800">3</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm font-medium">Active Trips</div>
          <div className="text-3xl font-bold mt-2 text-gray-800">12</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
          <h3 className="font-semibold text-lg mb-6 text-gray-800">Trips This Week</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} />
              <Bar dataKey="trips" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">Recent Alerts</h3>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
              <span className="font-semibold">Maintenance Required:</span> Vehicle V-1024 due for oil change.
            </div>
            <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-100">
              <span className="font-semibold">Delay Warning:</span> Trip T-892 delayed by 45 minutes due to traffic.
            </div>
            <div className="p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
              <span className="font-semibold">Driver Alert:</span> Driver John Doe logged 10 hours today.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
