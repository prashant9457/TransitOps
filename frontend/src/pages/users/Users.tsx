import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { api } from '@/lib/axios';
import { Search, ChevronUp, ChevronDown, UserPlus, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  licenseNumber: string | null;
  safetyScore: number | null;
  status: string | null;
}

type SortKey = keyof UserData;
type SortOrder = 'asc' | 'desc';

export default function Users() {
  const { role } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [roleFilter, setRoleFilter] = useState('All');

  const { data: users, isLoading, isError } = useQuery<UserData[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data;
    },
    enabled: role === 'ADMIN',
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedAndFilteredUsers = useMemo(() => {
    if (!users) return [];
    
    let filtered = users.filter(u => 
      (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
       (u.licenseNumber && u.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (roleFilter === 'All' ? true : u.role === roleFilter)
    );

    filtered.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (aVal === null) aVal = '';
      if (bVal === null) bVal = '';

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    return filtered;
  }, [users, searchTerm, roleFilter, sortKey, sortOrder]);

  if (role !== 'ADMIN') {
    return <div className="p-6 text-[#f23f42]">Access Denied. Admins only.</div>;
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ChevronUp size={14} className="opacity-0 group-hover:opacity-30" />;
    return sortOrder === 'asc' ? <ChevronUp size={14} className="text-[#5865f2]" /> : <ChevronDown size={14} className="text-[#5865f2]" />;
  };

  const getRoleBadgeColor = (r: string) => {
    switch (r) {
      case 'ADMIN': return 'bg-[#f23f42]/20 text-[#f23f42]';
      case 'FLEET_MANAGER': return 'bg-[#f0b232]/20 text-[#f0b232]';
      case 'SAFETY_OFFICER': return 'bg-[#23a559]/20 text-[#23a559]';
      case 'FINANCIAL_ANALYST': return 'bg-[#00a8fc]/20 text-[#00a8fc]';
      case 'DRIVER': return 'bg-[#5865f2]/20 text-[#5865f2]';
      default: return 'bg-[#313338] text-[#dbdee1]';
    }
  };

  const roles = ['All', 'ADMIN', 'FLEET_MANAGER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST', 'DRIVER'];

  return (
    <div className="flex flex-col gap-6 p-6 h-full text-[#f2f3f5] bg-[#1e1f22]">
      
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Shield className="text-[#5865f2]" size={24}/> Users Directory & Access Management</h1>
          <p className="text-sm text-[#949ba4] mt-1">Manage all internal roles, system access, and combined driver metrics.</p>
        </div>
      </header>

      <div className="bg-[#2b2d31] rounded-lg border border-[#313338] overflow-hidden flex flex-col flex-1 shadow-lg">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#313338] flex flex-col md:flex-row gap-4 justify-between items-center bg-[#2b2d31]">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#949ba4]" size={16} />
              <input 
                type="text" 
                placeholder="Search by name, email, or license..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1e1f22] text-[#f2f3f5] text-sm rounded-md pl-9 pr-4 py-2 focus:outline-none border border-[#313338] focus:border-[#5865f2] transition-colors"
              />
            </div>
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[#1e1f22] text-[#949ba4] text-sm rounded-md px-3 py-2 focus:outline-none border border-[#313338] focus:border-[#5865f2]"
            >
              {roles.map(r => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="text-[#949ba4] text-xs font-bold tracking-wider uppercase">
            {sortedAndFilteredUsers.length} Directory Records
          </div>
        </div>

        {/* Dynamic Table */}
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1e1f22]/80 sticky top-0 z-10 backdrop-blur-sm">
              <tr className="border-b border-[#313338]">
                <th onClick={() => handleSort('name')} className="px-5 py-4 text-[10px] font-bold text-[#949ba4] uppercase tracking-wider cursor-pointer group hover:bg-[#313338]/50 transition-colors">
                  <div className="flex items-center gap-1">User Name <SortIcon column="name" /></div>
                </th>
                <th onClick={() => handleSort('email')} className="px-5 py-4 text-[10px] font-bold text-[#949ba4] uppercase tracking-wider cursor-pointer group hover:bg-[#313338]/50 transition-colors">
                  <div className="flex items-center gap-1">Email <SortIcon column="email" /></div>
                </th>
                <th onClick={() => handleSort('role')} className="px-5 py-4 text-[10px] font-bold text-[#949ba4] uppercase tracking-wider cursor-pointer group hover:bg-[#313338]/50 transition-colors">
                  <div className="flex items-center gap-1">System Role <SortIcon column="role" /></div>
                </th>
                <th onClick={() => handleSort('createdAt')} className="px-5 py-4 text-[10px] font-bold text-[#949ba4] uppercase tracking-wider cursor-pointer group hover:bg-[#313338]/50 transition-colors">
                  <div className="flex items-center gap-1">Joined Date <SortIcon column="createdAt" /></div>
                </th>
                <th onClick={() => handleSort('licenseNumber')} className="px-5 py-4 text-[10px] font-bold text-[#949ba4] uppercase tracking-wider cursor-pointer group hover:bg-[#313338]/50 transition-colors">
                  <div className="flex items-center gap-1">Driver License <SortIcon column="licenseNumber" /></div>
                </th>
                <th onClick={() => handleSort('safetyScore')} className="px-5 py-4 text-[10px] font-bold text-[#949ba4] uppercase tracking-wider cursor-pointer group hover:bg-[#313338]/50 transition-colors">
                  <div className="flex items-center gap-1">Safety Score <SortIcon column="safetyScore" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#313338]">
              {isLoading ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-[#949ba4]">Loading secure directory...</td></tr>
              ) : isError ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-[#f23f42]">Failed to fetch user directory.</td></tr>
              ) : sortedAndFilteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-[#949ba4]">No users found matching filters.</td></tr>
              ) : (
                sortedAndFilteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#313338]/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1e1f22] border border-[#313338] flex items-center justify-center text-xs font-bold text-[#f2f3f5]">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-[#f2f3f5]">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#dbdee1]">{u.email}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeColor(u.role)}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#949ba4]">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-sm font-mono text-[#dbdee1]">{u.licenseNumber || <span className="text-[#4f545c]">N/A</span>}</td>
                    <td className="px-5 py-4">
                      {u.safetyScore !== null ? (
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${u.safetyScore >= 90 ? 'text-[#23a559]' : u.safetyScore >= 75 ? 'text-[#f0b232]' : 'text-[#f23f42]'}`}>
                            {u.safetyScore}
                          </span>
                          <div className="w-16 bg-[#1e1f22] rounded-full h-1">
                            <div className={`h-1 rounded-full ${u.safetyScore >= 90 ? 'bg-[#23a559]' : u.safetyScore >= 75 ? 'bg-[#f0b232]' : 'bg-[#f23f42]'}`} style={{ width: `${u.safetyScore}%` }}></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-[#4f545c] italic">Non-Driver</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
