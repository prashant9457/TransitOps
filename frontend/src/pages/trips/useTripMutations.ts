import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';

const TRIP_KEYS = ['trips', 'vehicles', 'drivers', 'dashboard-metrics'];

function invalidateAll(qc: ReturnType<typeof useQueryClient>, keys: string[]) {
  keys.forEach(k => qc.invalidateQueries({ queryKey: [k] }));
}

export function useTripMutations() {
  const queryClient = useQueryClient();

  const createTrip = useMutation({
    mutationFn: (data: any) => api.post('/trips', data),
    onSuccess: () => {
      toast.success('Trip created and assigned successfully!');
      invalidateAll(queryClient, ['trips']);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create trip'),
  });

  const dispatch = useMutation({
    mutationFn: (id: string) => api.post(`/trips/${id}/dispatch`),
    onSuccess: () => {
      toast.success('Trip dispatched! Ready for driver.');
      invalidateAll(queryClient, ['trips', 'vehicles', 'drivers']);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to dispatch trip'),
  });

  const start = useMutation({
    mutationFn: (id: string) => api.post(`/trips/${id}/start`),
    onSuccess: () => {
      toast.success('Journey started successfully! Drive safely.');
      invalidateAll(queryClient, ['trips']);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to start journey'),
  });

  const complete = useMutation({
    mutationFn: (id: string) => api.post(`/trips/${id}/complete`),
    onSuccess: () => {
      toast.success('Trip marked as completed!');
      invalidateAll(queryClient, ['trips', 'vehicles', 'drivers']);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to complete trip'),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => api.post(`/trips/${id}/cancel`),
    onSuccess: () => {
      toast.success('Trip cancelled successfully!');
      invalidateAll(queryClient, ['trips', 'vehicles', 'drivers']);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to cancel trip'),
  });

  const log = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.post(`/trips/${id}/log`, data),
    onSuccess: () => {
      toast.success('Post-trip data logged successfully!');
      invalidateAll(queryClient, ['trips', 'vehicles']);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to log trip data'),
  });

  const claim = useMutation({
    mutationFn: (id: string) => api.post(`/trips/${id}/claim`),
    onSuccess: () => {
      toast.success('Bonus trip claimed successfully! It is now assigned to you.');
      invalidateAll(queryClient, ['trips', 'vehicles', 'drivers']);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to claim trip'),
  });

  const accept = useMutation({
    mutationFn: (id: string) => api.post(`/trips/${id}/accept`),
    onSuccess: () => {
      toast.success('Trip accepted! Awaiting dispatch.');
      invalidateAll(queryClient, ['trips']);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to accept trip'),
  });

  const midTripExpense = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.post(`/trips/${id}/expense`, data),
    onSuccess: () => {
      toast.success('Expense logged successfully!');
      invalidateAll(queryClient, ['trips', 'dashboard-metrics']);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to log expense'),
  });

  return { createTrip, dispatch, start, complete, cancel, log, claim, accept, midTripExpense };
}
