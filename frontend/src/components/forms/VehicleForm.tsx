import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';

const vehicleSchema = z.object({
  registrationNumber: z.string().min(2, 'Registration number is required'),
  model: z.string().min(2, 'Model is required'),
  type: z.string().min(2, 'Type is required'),
  capacity: z.coerce.number().min(1, 'Capacity must be greater than 0'),
  odometer: z.coerce.number().min(0, 'Odometer cannot be negative'),
  acquisitionCost: z.coerce.number().min(0, 'Cost cannot be negative'),
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED']).optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface VehicleFormProps {
  initialData?: any;
  onSubmit: (data: VehicleFormData) => void;
  isLoading: boolean;
}

export function VehicleForm({ initialData, onSubmit, isLoading }: VehicleFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      registrationNumber: '',
      model: '',
      type: '',
      capacity: 0,
      odometer: 0,
      acquisitionCost: 0,
      status: 'AVAILABLE',
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-[#dbdee1]">
      <div>
        <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wide mb-2">Registration Number</label>
        <input 
          {...register('registrationNumber')} 
          disabled={!!initialData}
          className="w-full bg-[#1e1f22] text-[#f2f3f5] text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5865f2] border border-transparent focus:border-[#5865f2] transition-all disabled:opacity-50" 
          placeholder="e.g. CA-1001"
        />
        {errors.registrationNumber && <p className="text-[#f23f42] text-xs mt-1">{errors.registrationNumber.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wide mb-2">Model</label>
          <input 
            {...register('model')} 
            disabled={!!initialData}
            className="w-full bg-[#1e1f22] text-[#f2f3f5] text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5865f2] border border-transparent focus:border-[#5865f2] transition-all disabled:opacity-50" 
            placeholder="e.g. Volvo FH16"
          />
          {errors.model && <p className="text-[#f23f42] text-xs mt-1">{errors.model.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wide mb-2">Type</label>
          <select 
            {...register('type')} 
            disabled={!!initialData}
            className="w-full bg-[#1e1f22] text-[#f2f3f5] text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5865f2] border border-transparent focus:border-[#5865f2] transition-all disabled:opacity-50"
          >
            <option value="">Select Type</option>
            <option value="Heavy Truck">Heavy Truck</option>
            <option value="Light Truck">Light Truck</option>
            <option value="Van">Van</option>
          </select>
          {errors.type && <p className="text-[#f23f42] text-xs mt-1">{errors.type.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wide mb-2">Capacity (kg)</label>
          <input 
            type="number"
            {...register('capacity')} 
            className="w-full bg-[#1e1f22] text-[#f2f3f5] text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5865f2] border border-transparent focus:border-[#5865f2] transition-all" 
          />
          {errors.capacity && <p className="text-[#f23f42] text-xs mt-1">{errors.capacity.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wide mb-2">Odometer (km)</label>
          <input 
            type="number"
            {...register('odometer')} 
            disabled={!!initialData}
            className="w-full bg-[#1e1f22] text-[#f2f3f5] text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5865f2] border border-transparent focus:border-[#5865f2] transition-all disabled:opacity-50" 
          />
          {errors.odometer && <p className="text-[#f23f42] text-xs mt-1">{errors.odometer.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wide mb-2">Cost ($)</label>
          <input 
            type="number"
            {...register('acquisitionCost')} 
            className="w-full bg-[#1e1f22] text-[#f2f3f5] text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5865f2] border border-transparent focus:border-[#5865f2] transition-all" 
          />
          {errors.acquisitionCost && <p className="text-[#f23f42] text-xs mt-1">{errors.acquisitionCost.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wide mb-2">Status (Live)</label>
          <div className="w-full bg-[#1e1f22]/50 text-[#949ba4] text-sm rounded-md px-3 py-2.5 border border-[#313338] italic">
            Managed by Operations Live Board
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-6 py-2.5 rounded-md font-medium text-sm transition-colors disabled:opacity-50 w-full sm:w-auto"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Vehicle' : 'Create Vehicle'}
        </button>
      </div>
    </form>
  );
}
