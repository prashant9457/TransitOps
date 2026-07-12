import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const logSchema = z.object({
  endingOdometer: z.coerce.number().min(0, 'Ending odometer must be positive'),
  fuelLiters: z.coerce.number().min(0).optional(),
  fuelCost: z.coerce.number().min(0).optional(),
  miscCost: z.coerce.number().min(0).optional(),
  maintenanceRequired: z.boolean(),
  maintenanceIssue: z.string().optional(),
}).refine((data) => !data.maintenanceRequired || (data.maintenanceIssue && data.maintenanceIssue.length > 3), {
  message: "Maintenance issue description is required if maintenance is needed",
  path: ["maintenanceIssue"],
});

type LogFormData = z.infer<typeof logSchema>;

interface PostTripLogFormProps {
  onSubmit: (data: LogFormData) => void;
  isLoading: boolean;
  vehicleOdometer: number;
}

export function PostTripLogForm({ onSubmit, isLoading, vehicleOdometer }: PostTripLogFormProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<LogFormData>({
    resolver: zodResolver(logSchema),
    defaultValues: {
      endingOdometer: vehicleOdometer,
      fuelLiters: 0,
      fuelCost: 0,
      miscCost: 0,
      maintenanceRequired: false,
      maintenanceIssue: '',
    }
  });

  const maintenanceRequired = watch('maintenanceRequired');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-[#dbdee1]">
      <div>
        <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wide mb-2">Ending Odometer (km)</label>
        <input 
          type="number"
          {...register('endingOdometer')} 
          className="w-full bg-[#1e1f22] text-[#f2f3f5] text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5865f2] border border-transparent focus:border-[#5865f2] transition-all" 
        />
        {errors.endingOdometer && <p className="text-[#f23f42] text-xs mt-1">{errors.endingOdometer.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wide mb-2">Fuel Consumed (L)</label>
          <input 
            type="number"
            step="0.1"
            {...register('fuelLiters')} 
            className="w-full bg-[#1e1f22] text-[#f2f3f5] text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5865f2] border border-transparent focus:border-[#5865f2] transition-all" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wide mb-2">Fuel Cost ($)</label>
          <input 
            type="number"
            step="0.01"
            {...register('fuelCost')} 
            className="w-full bg-[#1e1f22] text-[#f2f3f5] text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5865f2] border border-transparent focus:border-[#5865f2] transition-all" 
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wide mb-2">Misc. Expenses (Tolls, etc) ($)</label>
        <input 
          type="number"
          step="0.01"
          {...register('miscCost')} 
          className="w-full bg-[#1e1f22] text-[#f2f3f5] text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5865f2] border border-transparent focus:border-[#5865f2] transition-all" 
        />
      </div>

      <div className="border-t border-[#313338] pt-4 mt-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            {...register('maintenanceRequired')}
            className="w-4 h-4 rounded bg-[#1e1f22] border-[#313338] text-[#5865f2] focus:ring-[#5865f2]"
          />
          <span className="text-sm font-semibold text-[#f0b232]">Request Vehicle Maintenance</span>
        </label>
      </div>

      {maintenanceRequired && (
        <div className="mt-3">
          <label className="block text-xs font-bold text-[#949ba4] uppercase tracking-wide mb-2">Describe the Issue</label>
          <textarea
            {...register('maintenanceIssue')}
            rows={3}
            className="w-full bg-[#1e1f22] text-[#f2f3f5] text-sm rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#f0b232] border border-transparent focus:border-[#f0b232] transition-all resize-none custom-scrollbar"
            placeholder="What went wrong? e.g. Brakes squeaking loudly..."
          ></textarea>
          {errors.maintenanceIssue && <p className="text-[#f23f42] text-xs mt-1">{errors.maintenanceIssue.message}</p>}
        </div>
      )}

      <div className="pt-4 flex justify-end">
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-[#23a559] hover:bg-[#1c8446] text-white px-6 py-2.5 rounded-md font-medium text-sm transition-colors disabled:opacity-50 w-full"
        >
          {isLoading ? 'Submitting Log...' : 'Submit Post-Trip Log'}
        </button>
      </div>
    </form>
  );
}
