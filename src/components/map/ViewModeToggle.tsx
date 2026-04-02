import { useFleetStore } from '../../stores/useFleetStore';
import { ACCENT } from '../../lib/constants';

export default function ViewModeToggle() {
  const viewMode = useFleetStore((s) => s.viewMode);
  const setViewMode = useFleetStore((s) => s.setViewMode);

  const options: { value: 'fleet' | 'individual'; label: string }[] = [
    { value: 'fleet', label: 'Fleet Overview' },
    { value: 'individual', label: 'Individual Tracking' },
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] map-control flex p-1 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setViewMode(opt.value)}
          className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap"
          style={
            viewMode === opt.value
              ? { backgroundColor: ACCENT, color: '#fff' }
              : { backgroundColor: 'transparent', color: '#6b7280' }
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
