import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/axios';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/Modal';
import { DriverForm } from '@/components/forms/DriverForm';

import { useAuth } from '@/contexts/AuthContext';

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  contactNumber: string;
  safetyScore: number;
  status: string;
}

export default function Drivers() {
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const { data: drivers, isLoading } = useQuery<Driver[]>({
    queryKey: ['drivers'],
    queryFn: async () => {
      const { data } = await api.get('/drivers');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/drivers', data),
    onMutate: async (newDriver) => {
      await queryClient.cancelQueries({ queryKey: ['drivers'] });
      const previousDrivers = queryClient.getQueryData(['drivers']);
      queryClient.setQueryData(['drivers'], (old: any) => [{...newDriver, id: 'temp'}, ...(old || [])]);
      return { previousDrivers };
    },
    onSuccess: () => {
      toast.success('Driver created successfully');
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (err: any, _, context) => {
      queryClient.setQueryData(['drivers'], context?.previousDrivers);
      toast.error(err.response?.data?.message || 'Failed to create driver');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.patch(`/drivers/${id}`, data),
    onSuccess: () => {
      toast.success('Driver updated successfully');
      setIsModalOpen(false);
      setEditingDriver(null);
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update driver');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/drivers/${id}`),
    onSuccess: () => {
      toast.success('Driver deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete driver');
    }
  });

  const handleOpenEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingDriver(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredDrivers = drivers?.filter(d => 
    (d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter ? d.status === statusFilter : true)
  );

  const canEdit = role === 'ADMIN' || role === 'FLEET_MANAGER' || role === 'SAFETY_OFFICER';
  const canDelete = role === 'ADMIN';
  const canAdd = role === 'ADMIN' || role === 'FLEET_MANAGER';

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#f2f3f5]">Drivers</h1>
          <p className="text-sm text-[#949ba4] mt-1">Manage driver profiles, licenses, and safety scores.</p>
        </div>
        {canAdd && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <Plus size={16} /> Add Driver
          </button>
        )}
      </header>

      <div className="bg-[#2b2d31] rounded-lg border border-[#1e1f22] overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#1e1f22] flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#2b2d31]">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#949ba4]" size={16} />
              <input 
                type="text" 
                placeholder="Search name or license..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1e1f22] text-[#f2f3f5] text-sm rounded-md pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#5865f2] border border-transparent focus:border-[#5865f2] transition-all placeholder:text-[#80848e]"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#1e1f22] text-[#f2f3f5] text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#5865f2] border border-transparent focus:border-[#5865f2]"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ON_TRIP">On Trip</option>
              <option value="OFF_DUTY">Off Duty</option>
            </select>
          </div>
          <div className="text-[#949ba4] text-sm font-medium">
            {filteredDrivers?.length || 0} drivers
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e1f22] bg-[#1e1f22]/50">
                <th className="px-5 py-3 text-xs font-semibold text-[#949ba4] uppercase tracking-wider">Driver Info</th>
                <th className="px-5 py-3 text-xs font-semibold text-[#949ba4] uppercase tracking-wider">License</th>
                <th className="px-5 py-3 text-xs font-semibold text-[#949ba4] uppercase tracking-wider">Contact</th>
                <th className="px-5 py-3 text-xs font-semibold text-[#949ba4] uppercase tracking-wider">Safety Score</th>
                <th className="px-5 py-3 text-xs font-semibold text-[#949ba4] uppercase tracking-wider">Status</th>
                {(canEdit || canDelete) && <th className="px-5 py-3 text-xs font-semibold text-[#949ba4] uppercase tracking-wider text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1f22]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[#949ba4]">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-[#5865f2] border-t-transparent animate-spin"></div>
                      Loading drivers...
                    </div>
                  </td>
                </tr>
              ) : filteredDrivers?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 flex-col items-center justify-center text-center text-[#949ba4]">
                    <div className="text-[#80848e] mb-2 text-lg">No drivers found.</div>
                    <p className="text-sm">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredDrivers?.map((driver) => {
                  const expiryDate = new Date(driver.licenseExpiry);
                  const isExpiringSoon = expiryDate.getTime() - new Date().getTime() < 1000 * 60 * 60 * 24 * 30 * 3; // 3 months

                  return (
                    <tr key={driver.id} className="hover:bg-[#313338]/50 transition-colors group">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1e1f22] border border-[#313338] flex items-center justify-center text-xs font-bold text-[#f2f3f5]">
                            {driver.name.charAt(0)}
                          </div>
                          <div className="text-sm font-medium text-[#f2f3f5]">{driver.name}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#dbdee1]">{driver.licenseNumber}</div>
                        <div className={`text-xs ${isExpiringSoon ? 'text-[#f23f42]' : 'text-[#80848e]'}`}>
                          Exp: {expiryDate.toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#dbdee1]">{driver.contactNumber}</div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-[#1e1f22] rounded-full h-1.5 max-w-[60px]">
                            <div 
                              className={`h-1.5 rounded-full ${driver.safetyScore >= 90 ? 'bg-[#23a559]' : driver.safetyScore >= 75 ? 'bg-[#f0b232]' : 'bg-[#f23f42]'}`} 
                              style={{ width: `${driver.safetyScore}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-[#dbdee1]">{driver.safetyScore}/100</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          driver.status === 'AVAILABLE' ? 'bg-[#23a559]/10 text-[#23a559] border-[#23a559]/20' :
                          driver.status === 'ON_TRIP' ? 'bg-[#5865f2]/10 text-[#5865f2] border-[#5865f2]/20' :
                          driver.status === 'OFF_DUTY' ? 'bg-[#949ba4]/10 text-[#949ba4] border-[#949ba4]/20' :
                          'bg-[#f23f42]/10 text-[#f23f42] border-[#f23f42]/20'
                        }`}>
                          {driver.status.replace('_', ' ')}
                        </span>
                      </td>
                      {(canEdit || canDelete) && (
                        <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            {canEdit && (
                              <button 
                                onClick={() => handleOpenEdit(driver)}
                                className="text-[#949ba4] hover:text-[#f2f3f5] transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                            {canDelete && (
                              <button 
                                onClick={() => handleDelete(driver.id)}
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
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingDriver ? "Edit Driver" : "Add Driver"}
      >
        <DriverForm 
          initialData={editingDriver}
          onSubmit={(data) => {
            if (editingDriver) {
              updateMutation.mutate({ id: editingDriver.id, data });
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
