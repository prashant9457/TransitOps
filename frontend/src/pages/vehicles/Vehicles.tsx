import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/axios';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/Modal';
import { VehicleForm } from '@/components/forms/VehicleForm';
import { useAuth } from '@/contexts/AuthContext';

interface Vehicle {
  id: string;
  registrationNumber: string;
  model: string;
  type: string;
  capacity: number;
  odometer: number;
  acquisitionCost: number;
  status: string;
}

export default function Vehicles() {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data } = await api.get('/vehicles');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/vehicles', data),
    onMutate: async (newVehicle) => {
      await queryClient.cancelQueries({ queryKey: ['vehicles'] });
      const previousVehicles = queryClient.getQueryData(['vehicles']);
      queryClient.setQueryData(['vehicles'], (old: any) => [{...newVehicle, id: 'temp'}, ...(old || [])]);
      return { previousVehicles };
    },
    onSuccess: () => {
      toast.success('Vehicle created successfully');
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (err: any, _, context) => {
      queryClient.setQueryData(['vehicles'], context?.previousVehicles);
      toast.error(err.response?.data?.message || 'Failed to create vehicle');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.patch(`/vehicles/${id}`, data),
    onSuccess: () => {
      toast.success('Vehicle updated successfully');
      setIsModalOpen(false);
      setEditingVehicle(null);
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update vehicle');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/vehicles/${id}`),
    onSuccess: () => {
      toast.success('Vehicle deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete vehicle');
    }
  });

  const handleOpenEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingVehicle(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredVehicles = vehicles?.filter(v => 
    (v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter && statusFilter !== 'All' ? v.status === statusFilter : true) &&
    (typeFilter && typeFilter !== 'All' ? v.type === typeFilter : true)
  );

  // Extract unique types for the filter dropdown
  const uniqueTypes = Array.from(new Set(vehicles?.map(v => v.type) || []));

  const canEdit = role === 'ADMIN' || role === 'FLEET_MANAGER';
  const canDelete = role === 'ADMIN';

  return (
    <div className="flex flex-col h-full bg-[#1e1f22]">
      {/* Top Toolbar matching wireframe */}
      <div className="flex flex-col sm:flex-row justify-between items-center py-4 px-6 border-b border-[#313338] bg-[#1e1f22]">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          {/* Type Filter */}
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#1e1f22] text-[#dbdee1] border border-[#313338] rounded-md px-3 py-1.5 focus:outline-none focus:border-[#5865f2] w-40 text-sm"
          >
            <option value="All">Type: All</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>Type: {type}</option>
            ))}
          </select>
          
          {/* Status Filter */}
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1e1f22] text-[#dbdee1] border border-[#313338] rounded-md px-3 py-1.5 focus:outline-none focus:border-[#5865f2] w-40 text-sm"
          >
            <option value="All">Status: All</option>
            <option value="AVAILABLE">Status: Available</option>
            <option value="ON_TRIP">Status: On Trip</option>
            <option value="IN_SHOP">Status: In Shop</option>
            <option value="RETIRED">Status: Retired</option>
          </select>

          {/* Search Input */}
          <input 
            type="text" 
            placeholder="Search reg. no..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48 bg-[#1e1f22] text-[#f2f3f5] text-sm border border-[#313338] rounded-md px-3 py-1.5 focus:outline-none focus:border-[#5865f2] transition-all placeholder:text-[#80848e]"
          />
        </div>

        {canEdit && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#d97706] hover:bg-[#b45309] text-white px-5 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors mt-4 sm:mt-0"
          >
            <Plus size={16} /> Add Vehicle
          </button>
        )}
      </div>

      {/* Main Table Content */}
      <div className="flex-1 overflow-x-auto px-6 py-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#313338] text-[10px] font-medium text-[#949ba4] uppercase tracking-wider">
              <th className="py-4 pr-4">REG. NO. (UNIQUE)</th>
              <th className="py-4 px-4">NAME/MODE</th>
              <th className="py-4 px-4">TYPE</th>
              <th className="py-4 px-4">CAPACITY</th>
              <th className="py-4 px-4">ODOMETI</th>
              <th className="py-4 px-4">ACQ. COST</th>
              <th className="py-4 px-4">STATUS</th>
              {(canEdit || canDelete) && <th className="py-4 pl-4 text-right"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#313338] text-sm text-[#dbdee1]">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#949ba4]">Loading vehicles...</td>
              </tr>
            ) : filteredVehicles?.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#949ba4]">No vehicles found.</td>
              </tr>
            ) : (
              filteredVehicles?.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-[#2b2d31]/40 transition-colors group">
                  <td className="py-4 pr-4 font-mono">{vehicle.registrationNumber}</td>
                  <td className="py-4 px-4 uppercase">{vehicle.model}</td>
                  <td className="py-4 px-4 capitalize">{vehicle.type}</td>
                  <td className="py-4 px-4">{vehicle.capacity >= 1000 ? `${(vehicle.capacity / 1000).toFixed(1).replace('.0', '')} Ton` : `${vehicle.capacity} kg`}</td>
                  <td className="py-4 px-4">{vehicle.odometer.toLocaleString()}</td>
                  <td className="py-4 px-4">{vehicle.acquisitionCost ? vehicle.acquisitionCost.toLocaleString() : '—'}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-3 py-1.5 rounded-md text-xs font-medium text-white w-24 text-center ${
                      vehicle.status === 'AVAILABLE' ? 'bg-[#23a559]' :
                      vehicle.status === 'ON_TRIP' ? 'bg-[#5865f2]' :
                      vehicle.status === 'IN_SHOP' ? 'bg-[#d97706]' :
                      'bg-[#f23f42]'
                    }`}>
                      {vehicle.status.replace('_', ' ')}
                    </span>
                  </td>
                  {(canEdit || canDelete) && (
                    <td className="py-4 pl-4 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canEdit && (
                          <button 
                            onClick={() => handleOpenEdit(vehicle)}
                            className="text-[#949ba4] hover:text-[#f2f3f5] transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        {canDelete && (
                          <button 
                            onClick={() => handleDelete(vehicle.id)}
                            disabled={deleteMutation.isPending}
                            className="text-[#949ba4] hover:text-[#f23f42] transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer Rule Text */}
        <div className="mt-8 text-xs font-semibold text-[#d97706]">
          Rule: Registration No. must be unique - Retired/In Shop vehicles are hidden from Trip Dispatcher
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
      >
        <VehicleForm 
          initialData={editingVehicle}
          onSubmit={(data) => {
            if (editingVehicle) {
              updateMutation.mutate({ id: editingVehicle.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  );
}
