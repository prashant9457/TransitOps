import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { Pencil, Check, X, Phone, CreditCard, Tag, CalendarDays, Shield } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery<any>({
    queryKey: ['my-driver-profile'],
    queryFn: async () => (await api.get('/drivers/my-profile')).data,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.patch('/drivers/my-profile', data),
    onSuccess: () => {
      toast.success('Updated successfully');
      queryClient.invalidateQueries({ queryKey: ['my-driver-profile'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => api.patch('/drivers/my-profile/status', { status }),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['my-driver-profile'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update status'),
  });

  if (isLoading) return <div className="p-8 text-[#949ba4] text-base font-medium">Loading profile...</div>;
  if (!profile) return <div className="p-8 text-[#949ba4] text-base font-medium">No driver profile found for "{user?.name}".</div>;

  const canToggleStatus = profile.status === 'AVAILABLE' || profile.status === 'OFF_DUTY';
  const isAvailable = profile.status === 'AVAILABLE';
  const licenseExpired = new Date(profile.licenseExpiry) < new Date();
  const licenseExpiring = !licenseExpired && new Date(profile.licenseExpiry) < new Date(Date.now() + 30 * 86400000);

  return (
    <div className="flex flex-col gap-10 text-[#f2f3f5] min-h-full max-w-5xl">

      {/* Header */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-4xl font-bold tracking-tight text-[#f2f3f5] mb-2">Driver Profile</h1>
        <p className="text-base font-medium text-[#949ba4]">Manage your personal and credential information</p>
      </div>

      {/* Identity Card */}
      <div className="bg-[#2b2d31] rounded-2xl border border-[#313338] shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="px-8 py-8 flex items-center gap-6 border-b border-[#313338]">
          <div className="w-20 h-20 rounded-2xl bg-[#313338] flex items-center justify-center text-3xl font-bold text-[#949ba4] shrink-0 border border-[#4f545c] shadow-inner transition-transform duration-300 hover:scale-105 hover:rotate-3">
            {profile.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#f2f3f5]">{profile.name}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-[#949ba4] font-mono bg-[#1e1f22] px-3 py-1 rounded-lg border border-[#313338]">{profile.id?.substring(0, 8).toUpperCase()}</span>
              <span className="text-[#4f545c] text-xl">·</span>
              <span className="text-sm font-medium text-[#949ba4]">{user?.email}</span>
            </div>
          </div>

          {/* Status Toggle */}
          {canToggleStatus && (
            <button
              onClick={() => statusMutation.mutate(isAvailable ? 'OFF_DUTY' : 'AVAILABLE')}
              disabled={statusMutation.isPending}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 border shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 ${
                isAvailable
                  ? 'bg-[#23a559] text-white border-[#23a559] shadow-[0_0_15px_rgba(35,165,89,0.4)]'
                  : 'bg-[#313338] text-[#949ba4] border-[#4f545c] hover:bg-[#4f545c]/50'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full shadow-inner ${isAvailable ? 'bg-white' : 'bg-[#949ba4]'}`}></span>
              {isAvailable ? 'Duty Available' : 'Off Duty'}
            </button>
          )}
          {!canToggleStatus && (
            <span className="flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-bold bg-[#5865f2] text-white shadow-[0_0_15px_rgba(88,101,242,0.4)]">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
              {profile.status.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 divide-x divide-[#313338] border-b border-[#313338] bg-[#1e1f22]/30">
          <Stat label="Total Trips" value={profile.totalTrips ?? 0} />
          <Stat label="Active" value={profile.activeTrips ?? 0} />
          <Stat label="Completed" value={profile.completedTrips ?? 0} />
          <Stat label="Cancelled" value={profile.cancelledTrips ?? 0} />
        </div>

        {/* Safety Score */}
        <div className="px-8 py-6 border-b border-[#313338] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-[#949ba4]" />
            <span className="text-sm text-[#949ba4] uppercase tracking-wider font-bold">Driver Safety Score</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-48 h-2.5 bg-[#313338] rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${profile.safetyScore}%`,
                  backgroundColor: profile.safetyScore >= 90 ? '#23a559' : profile.safetyScore >= 70 ? '#f0b232' : '#f23f42',
                  boxShadow: '0 0 10px currentColor'
                }}
              />
            </div>
            <span className="text-lg font-bold font-mono text-[#dbdee1] w-12 text-right">{profile.safetyScore}</span>
          </div>
        </div>
      </div>

      {/* Editable Fields */}
      <div className="bg-[#2b2d31] rounded-2xl border border-[#313338] shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
        <div className="px-8 py-6 border-b border-[#313338] bg-[#1e1f22]/30">
          <h3 className="text-sm font-bold text-[#949ba4] uppercase tracking-wider">Credential Information</h3>
        </div>

        <EditableField
          icon={<Phone size={18} />} label="Contact Number"
          value={profile.contactNumber} fieldKey="contactNumber"
          onSave={(v) => updateMutation.mutate({ contactNumber: v })}
          isPending={updateMutation.isPending} mono
        />
        <EditableField
          icon={<CreditCard size={18} />} label="License Number"
          value={profile.licenseNumber} fieldKey="licenseNumber"
          onSave={(v) => updateMutation.mutate({ licenseNumber: v })}
          isPending={updateMutation.isPending} mono
        />
        <EditableField
          icon={<Tag size={18} />} label="License Category"
          value={profile.licenseCategory} fieldKey="licenseCategory"
          onSave={(v) => updateMutation.mutate({ licenseCategory: v })}
          isPending={updateMutation.isPending}
        />
        <EditableField
          icon={<CalendarDays size={18} />} label="License Expiry"
          value={profile.licenseExpiry?.split('T')[0]} fieldKey="licenseExpiry"
          displayValue={new Date(profile.licenseExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          onSave={(v) => updateMutation.mutate({ licenseExpiry: v })}
          isPending={updateMutation.isPending} type="date"
          warn={licenseExpired ? 'Expired' : licenseExpiring ? 'Expiring soon' : undefined}
        />
      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────── */

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-8 py-6 flex flex-col gap-2 hover:bg-[#313338]/30 transition-colors">
      <span className="text-xs text-[#949ba4] uppercase tracking-wider font-bold">{label}</span>
      <span className="text-3xl font-bold text-[#dbdee1] font-mono">{value}</span>
    </div>
  );
}

function EditableField({ icon, label, value, displayValue, fieldKey, onSave, isPending, mono, type = 'text', warn }: {
  icon: React.ReactNode; label: string; value: string; displayValue?: string; fieldKey: string;
  onSave: (value: string) => void; isPending: boolean; mono?: boolean; type?: string; warn?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); }, [value]);

  const handleSave = () => {
    if (draft === value) { setEditing(false); return; }
    onSave(draft);
    setEditing(false);
  };

  const handleCancel = () => { setDraft(value); setEditing(false); };

  return (
    <div className="flex items-center gap-6 px-8 py-5 border-b border-[#313338] last:border-b-0 hover:bg-[#313338]/20 transition-all duration-300 group">
      <span className="text-[#4f545c] shrink-0 group-hover:text-[#5865f2] transition-colors">{icon}</span>
      <span className="text-sm text-[#949ba4] uppercase tracking-wider font-bold w-48 shrink-0">{label}</span>

      <div className="flex-1 flex items-center gap-3">
        {editing ? (
          <>
            <input
              type={type} value={draft} onChange={e => setDraft(e.target.value)} autoFocus
              className="flex-1 bg-[#1e1f22] text-[#f2f3f5] text-base font-semibold border border-[#5865f2] rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#5865f2]/50 transition-all font-mono shadow-[0_0_10px_rgba(88,101,242,0.1)]"
            />
            <button onClick={handleSave} disabled={isPending}
              className="p-2.5 rounded-xl bg-[#23a559] hover:bg-[#1c8446] text-white shadow-md transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">
              <Check size={16} strokeWidth={3} />
            </button>
            <button onClick={handleCancel}
              className="p-2.5 rounded-xl bg-[#313338] hover:bg-[#4f545c] text-[#dbdee1] transition-all hover:scale-105">
              <X size={16} strokeWidth={3} />
            </button>
          </>
        ) : (
          <>
            <span className={`text-base font-bold text-[#dbdee1] group-hover:text-[#f2f3f5] transition-colors ${mono ? 'font-mono' : ''}`}>
              {displayValue || value}
            </span>
            {warn && (
              <span className="text-xs font-bold text-white bg-[#f23f42] px-3 py-1 rounded-lg shadow-[0_0_10px_rgba(242,63,66,0.4)] ml-2">
                {warn}
              </span>
            )}
            <button onClick={() => setEditing(true)}
              className="ml-auto p-2.5 rounded-xl text-[#949ba4] bg-[#313338] hover:text-white hover:bg-[#5865f2] hover:shadow-[0_0_15px_rgba(88,101,242,0.4)] transition-all opacity-0 group-hover:opacity-100 transform hover:scale-105">
              <Pencil size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
