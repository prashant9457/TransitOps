import type { Trip } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  IN_PROGRESS: 'bg-[#5865f2]/20 text-[#5865f2]',
  READY_TO_START: 'bg-[#f0b232]/20 text-[#f0b232]',
  ASSIGNED: 'bg-[#23a559]/20 text-[#23a559]',
  CANCELLED: 'bg-[#f23f42]/20 text-[#f23f42]',
};

const DOT_COLORS: Record<string, string> = {
  COMPLETED: 'bg-[#23a559] ring-[#23a559]/30',
  CANCELLED: 'bg-[#f23f42] ring-[#f23f42]/30',
};

interface TripRowProps {
  trip: Trip;
  isLast: boolean;
  isDriver: boolean;
  canDispatch: boolean;
  expandedTripId: string | null;
  onToggleExpand: (id: string) => void;
  onAccept: (id: string) => void;
  onClaim: (id: string) => void;
  onDispatch: (id: string) => void;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
  onLogExpense: (id: string) => void;
  onLogFinal: (id: string) => void;
  isPending: Record<string, boolean>;
}

export function TripRow({
  trip, isLast, isDriver, canDispatch, expandedTripId,
  onToggleExpand, onAccept, onClaim, onDispatch, onStart, onComplete, onCancel,
  onLogExpense, onLogFinal, isPending
}: TripRowProps) {
  const isDelayed = (trip.status === 'READY_TO_START' || trip.status === 'ASSIGNED')
    && trip.scheduledStartTime && new Date(trip.scheduledStartTime) < new Date() && !trip.actualStartTime;

  const dotColor = DOT_COLORS[trip.status] || 'bg-[#5865f2] ring-[#5865f2]/30 animate-pulse';
  const statusBadge = STATUS_COLORS[trip.status] || 'bg-[#4f545c]/30 text-[#dbdee1]';

  const timelineSteps = [
    { label: 'Assigned', active: true },
    { label: 'Accepted', active: !!trip.driverAcceptedAt || trip.status !== 'ASSIGNED' },
    { label: 'Dispatched', active: !!trip.dispatchedAt || trip.status === 'IN_PROGRESS' || trip.status === 'COMPLETED' },
    { label: 'Maint', active: !!trip.maintenanceRequired, isWarning: true },
    { label: 'Reached', active: trip.status === 'COMPLETED' },
    { label: 'Logged', active: !!trip.reportsLogged },
  ];

  return (
    <div key={trip.id} className={`p-4 flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between hover:bg-[#313338]/40 transition-colors ${!isLast ? 'border-b border-[#313338]' : ''}`}>
      {/* Left: Info */}
      <div className="flex items-start gap-4 flex-1 cursor-pointer" onClick={() => onToggleExpand(trip.id)}>
        <div className="mt-1.5 flex shrink-0">
          <div className={`w-2.5 h-2.5 rounded-full ring-2 ${dotColor}`}></div>
        </div>
        <div className="flex flex-col w-full">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[15px] tracking-tight">{trip.source} → {trip.destination}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusBadge}`}>
              {trip.status.replace(/_/g, ' ')}
            </span>
            {isDelayed && <span className="bg-[#f23f42]/20 text-[#f23f42] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-[#f23f42]/30">Delayed</span>}
            {trip.isOpenToAll && trip.status === 'ASSIGNED' && <span className="bg-[#f0b232]/20 text-[#f0b232] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-[#f0b232]/30 shadow-[0_0_10px_rgba(240,178,50,0.2)]">Bonus Trip</span>}
          </div>
          <div className="text-xs text-[#949ba4] mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-mono bg-[#1e1f22] px-1.5 py-0.5 rounded text-[#dbdee1] border border-[#313338]">{trip.id.substring(0, 7).toUpperCase()}</span>
            <span>Vehicle: <span className="text-[#dbdee1]">{trip.vehicle?.registrationNumber || 'Unassigned'}</span></span>
            <span>Driver: <span className={trip.isOpenToAll && trip.status === 'ASSIGNED' ? 'text-[#f0b232] font-semibold' : 'text-[#dbdee1]'}>{trip.isOpenToAll && trip.status === 'ASSIGNED' ? 'OPEN TO ALL' : (trip.driver?.name || 'Unassigned')}</span></span>
            <span>Distance: <span className="text-[#dbdee1]">{trip.plannedDistance}km</span></span>
            <span className="text-[#4f545c]">|</span>
            <span>Start: {trip.scheduledStartTime ? new Date(trip.scheduledStartTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Middle: Timeline */}
      <div className="flex-1 w-full xl:w-auto px-6 py-2 bg-[#1e1f22]/50 rounded-lg border border-[#313338]/50 flex justify-between items-center relative hidden md:flex shrink-0 min-w-[350px] max-w-[500px]">
        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-[#313338] z-0"></div>
        {timelineSteps.map((step, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 z-10">
            <div className={`w-2.5 h-2.5 rounded-full ring-4 ring-[#2b2d31] ${step.active ? (step.isWarning ? 'bg-[#f0b232]' : 'bg-[#5865f2]') : 'bg-[#313338]'}`}></div>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${step.active ? (step.isWarning ? 'text-[#f0b232]' : 'text-[#5865f2]') : 'text-[#949ba4]'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 xl:min-w-[220px] justify-end shrink-0 w-full xl:w-auto mt-2 xl:mt-0 pt-3 xl:pt-0 border-t border-[#313338] xl:border-none flex-wrap">
        {isDriver && trip.status === 'ASSIGNED' && !trip.isOpenToAll && !trip.driverAcceptedAt && (
          <button onClick={() => onAccept(trip.id)} disabled={isPending.accept} className="bg-[#23a559] hover:bg-[#1c8446] text-white px-4 py-1.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 shadow-lg">Accept Trip</button>
        )}
        {isDriver && trip.isOpenToAll && trip.status === 'ASSIGNED' && (
          <button onClick={() => onClaim(trip.id)} disabled={isPending.claim} className="bg-[#f0b232] hover:bg-[#d69f2c] text-[#1e1f22] px-4 py-1.5 rounded-md text-sm font-bold transition-colors shadow-[0_0_15px_rgba(240,178,50,0.3)] disabled:opacity-50 animate-pulse hover:animate-none">
            {isPending.claim ? 'Claiming...' : 'Claim Bonus Trip!'}
          </button>
        )}
        {isDriver && trip.status === 'ASSIGNED' && trip.driverAcceptedAt && (
          <button onClick={() => onDispatch(trip.id)} disabled={isPending.dispatch} className="bg-[#f0b232] hover:bg-[#d69f2c] text-[#1e1f22] px-4 py-1.5 rounded-md text-sm font-bold transition-colors disabled:opacity-50 shadow-lg">Dispatch</button>
        )}
        {isDriver && trip.status === 'READY_TO_START' && (
          <button onClick={() => onStart(trip.id)} disabled={isPending.start} className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-4 py-1.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 shadow-lg">Depart (Start Journey)</button>
        )}
        {isDriver && (trip.status === 'IN_PROGRESS' || trip.status === 'READY_TO_START') && (
          <button onClick={() => onLogExpense(trip.id)} className="bg-[#313338] hover:bg-[#4f545c] text-[#dbdee1] border border-[#4f545c] px-3 py-1.5 rounded-md text-sm font-semibold transition-colors">Log Expense</button>
        )}
        {isDriver && (trip.status === 'IN_PROGRESS' || trip.status === 'READY_TO_START') && (
          <button onClick={() => onComplete(trip.id)} disabled={isPending.complete} className="bg-[#23a559]/20 hover:bg-[#23a559]/30 text-[#23a559] px-4 py-1.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 border border-[#23a559]/30">Reached (Complete)</button>
        )}
        {isDriver && trip.status === 'COMPLETED' && !trip.reportsLogged && (
          <button onClick={() => onLogFinal(trip.id)} className="bg-[#23a559] hover:bg-[#1c8446] text-white px-4 py-1.5 rounded-md text-sm font-bold transition-colors shadow-lg">Log Final Data</button>
        )}
        {canDispatch && trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED' && (
          <button onClick={() => onCancel(trip.id)} disabled={isPending.cancel} className="bg-[#f23f42]/10 hover:bg-[#f23f42]/20 text-[#f23f42] px-3 py-1.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-50">Cancel</button>
        )}
      </div>

      {/* Expanded Expenses */}
      {expandedTripId === trip.id && (
        <div className={`w-full bg-[#2b2d31] p-4 border-t border-[#313338] ${!isLast ? 'border-b' : ''}`}>
          <h3 className="text-sm font-semibold text-[#f2f3f5] mb-3">Expenses Log</h3>
          {trip.expenses && trip.expenses.length > 0 ? (
            <div className="overflow-x-auto rounded border border-[#313338]">
              <table className="w-full text-left text-sm text-[#dbdee1]">
                <thead className="bg-[#1e1f22] text-[#949ba4] text-xs uppercase font-bold">
                  <tr>
                    <th className="px-4 py-2 border-b border-[#313338]">Date</th>
                    <th className="px-4 py-2 border-b border-[#313338]">Type</th>
                    <th className="px-4 py-2 border-b border-[#313338]">Description</th>
                    <th className="px-4 py-2 border-b border-[#313338] text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {trip.expenses.map((exp: any) => (
                    <tr key={exp.id} className="border-b border-[#313338] hover:bg-[#313338]/40">
                      <td className="px-4 py-2 whitespace-nowrap">{new Date(exp.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2 font-mono text-[11px]">{exp.type}</td>
                      <td className="px-4 py-2 text-[#949ba4]">{exp.description}</td>
                      <td className="px-4 py-2 text-right font-semibold text-[#f0b232]">${exp.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#1e1f22]">
                    <td colSpan={3} className="px-4 py-2 text-right font-bold text-[#f2f3f5]">Total Expenses:</td>
                    <td className="px-4 py-2 text-right font-bold text-[#23a559]">
                      ${trip.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-[#949ba4] italic">No expenses logged for this trip yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
