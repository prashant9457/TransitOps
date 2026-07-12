import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';

const driverSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  licenseNumber: z.string().min(2, 'License is required'),
  licenseCategory: z.string().min(1, 'Category is required'),
  licenseExpiry: z.string().min(1, 'Expiry date is required'),
  contactNumber: z.string().min(5, 'Contact number is required'),
  safetyScore: z.coerce.number().min(0).max(100).optional(),
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY']).optional(),
});

type DriverFormData = z.infer<typeof driverSchema>;

interface DriverFormProps {
  initialData?: any;
  onSubmit: (data: DriverFormData) => void;
  isLoading: boolean;
}

export function DriverForm({ initialData, onSubmit, isLoading }: DriverFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: '',
      licenseNumber: '',
      licenseCategory: '',
      licenseExpiry: '',
      contactNumber: '',
      safetyScore: 100,
      status: 'AVAILABLE',
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        licenseExpiry: new Date(initialData.licenseExpiry).toISOString().split('T')[0]
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-[#dbdee1]">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wide mb-2">Full Name</label>
          <input 
            {...register('name')} 
            className="w-full bg-[#1e1f22] text-[#f2f3f5] text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5865f2] border border-transparent focus:border-[#5865f2] transition-all" 
            placeholder="e.g. John Doe"
          />
          {errors.name && <p className="text-[#f23f42] text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wide mb-2">Contact</label>
          <input 
            {...register('contactNumber')} 
            className="w-full bg-[#1e1f22] text-[#f2f3f5] text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5865f2] border border-transparent focus:border-[#5865f2] transition-all" 
            placeholder="e.g. 555-0101"
          />
          {errors.contactNumber && <p className="text-[#f23f42] text-xs mt-1">{errors.contactNumber.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wide mb-2">License Number</label>
          <input 
            {...register('licenseNumber')} 
            className="w-full bg-[#1e1f22] text-[#f2f3f5] text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5865f2] border border-transparent focus:border-[#5865f2] transition-all" 
          />
          {errors.licenseNumber && <p className="text-[#f23f42] text-xs mt-1">{errors.licenseNumber.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wide mb-2">Category</label>
          <input 
            {...register('licenseCategory')} 
            className="w-full bg-[#1e1f22] text-[#f2f3f5] text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5865f2] border border-transparent focus:border-[#5865f2] transition-all" 
            placeholder="e.g. Class A"
          />
          {errors.licenseCategory && <p className="text-[#f23f42] text-xs mt-1">{errors.licenseCategory.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wide mb-2">Expiry Date</label>
          <input 
            type="date"
            {...register('licenseExpiry')} 
            className="w-full bg-[#1e1f22] text-[#f2f3f5] text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5865f2] border border-transparent focus:border-[#5865f2] transition-all [color-scheme:dark]" 
          />
          {errors.licenseExpiry && <p className="text-[#f23f42] text-xs mt-1">{errors.licenseExpiry.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wide mb-2">Status</label>
          <select 
            {...register('status')} 
            className="w-full bg-[#1e1f22] text-[#f2f3f5] text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5865f2] border border-transparent focus:border-[#5865f2] transition-all"
          >
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="ON_TRIP">ON TRIP</option>
            <option value="OFF_DUTY">OFF DUTY</option>
          </select>
          {errors.status && <p className="text-[#f23f42] text-xs mt-1">{errors.status.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wide mb-2">Safety Score (0-100)</label>
        <input 
          type="number"
          {...register('safetyScore')} 
          className="w-full bg-[#1e1f22] text-[#f2f3f5] text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5865f2] border border-transparent focus:border-[#5865f2] transition-all" 
        />
        {errors.safetyScore && <p className="text-[#f23f42] text-xs mt-1">{errors.safetyScore.message}</p>}
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-6 py-2.5 rounded-md font-medium text-sm transition-colors disabled:opacity-50 w-full sm:w-auto"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Driver' : 'Create Driver'}
        </button>
      </div>
    </form>
  );
}
