import { FileText } from 'lucide-react';

export default function PlaceholderPage({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex flex-col gap-6 h-full min-h-[400px]">
      <header>
        <h1 className="text-2xl font-semibold text-[#f2f3f5]">{title}</h1>
        <p className="text-sm text-[#949ba4] mt-1">{description}</p>
      </header>

      <div className="flex-1 bg-[#2b2d31] rounded-lg border border-[#1e1f22] flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-[#1e1f22] flex items-center justify-center mb-4 text-[#5865f2]">
          <FileText size={32} />
        </div>
        <h3 className="text-lg font-medium text-[#f2f3f5] mb-2">{title} Module</h3>
        <p className="text-[#949ba4] max-w-md">
          This section is currently under construction. Future updates will bring real-time data tracking and management capabilities here.
        </p>
      </div>
    </div>
  );
}
