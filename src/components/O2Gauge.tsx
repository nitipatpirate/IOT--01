import React from 'react';

interface O2GaugeProps {
  value: number; // e.g. 20.95
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showLabels?: boolean;
}

export const O2Gauge: React.FC<O2GaugeProps> = ({
  value,
  min = 18.0,
  max = 26.0,
  size = 'md',
  label = 'ความเข้มข้น O2',
  showLabels = true,
}) => {
  // Clamp value
  const clampedValue = Math.min(max, Math.max(min, value));
  
  // Calculate percentage (0 to 1)
  const percent = (clampedValue - min) / (max - min);

  // Determine status color
  let color = '#10B981'; // Normal emerald
  let statusText = 'ปกติ (Safe)';
  let bgGlow = 'rgba(16, 185, 129, 0.15)';

  if (value >= 23.5) {
    color = '#EF4444'; // Danger
    statusText = 'อันตราย (O2 Leak)';
    bgGlow = 'rgba(239, 68, 68, 0.25)';
  } else if (value >= 22.5 || value < 19.5) {
    color = '#F59E0B'; // Warning
    statusText = 'เฝ้าระวัง (Warning)';
    bgGlow = 'rgba(245, 158, 11, 0.2)';
  } else if (value > 21.5) {
    color = '#06B6D4'; // Elevated
    statusText = 'เริ่มสูงขึ้น (Notice)';
    bgGlow = 'rgba(6, 182, 212, 0.2)';
  }

  // SVG Gauge geometry (Semi-circle Arc 180 degrees)
  const radius = size === 'lg' ? 95 : size === 'sm' ? 48 : 72;
  const strokeWidth = size === 'lg' ? 14 : size === 'sm' ? 8 : 11;
  const cx = size === 'lg' ? 115 : size === 'sm' ? 60 : 90;
  const cy = size === 'lg' ? 110 : size === 'sm' ? 60 : 88;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percent);

  const containerSizes = {
    sm: 'w-32 h-24',
    md: 'w-48 h-36',
    lg: 'w-64 h-48',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className="flex flex-col items-center justify-center relative">
      {/* Subtle radial glow */}
      <div 
        className="absolute w-36 h-28 rounded-full blur-2xl pointer-events-none transition-colors duration-700"
        style={{ background: bgGlow }}
      />

      <div className={`relative flex items-center justify-center ${containerSizes[size]}`}>
        <svg 
          viewBox={`0 0 ${cx * 2} ${cy + 25}`} 
          className="w-full h-full overflow-visible"
        >
          {/* Background Arc Track */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="currentColor"
            className="text-slate-800/80 dark:text-slate-800/90"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Value Progress Arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          {/* Safety Zone Tick Marker for 20.9% */}
          {size !== 'sm' && (
            <line
              x1={cx}
              y1={cy - radius - 5}
              x2={cx}
              y2={cy - radius + 7}
              stroke="#64748B"
              strokeWidth="2"
              strokeDasharray="2 2"
            />
          )}
        </svg>

        {/* Numeric Readout in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <div className="flex items-baseline space-x-1">
            <span className={`font-mono font-bold tracking-tight text-white dark:text-slate-100 ${textSizes[size]}`}>
              {value.toFixed(2)}
            </span>
            <span className="font-mono text-xs text-brand-400 font-semibold">%</span>
          </div>

          <span 
            className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-medium rounded-full border transition-colors"
            style={{ 
              borderColor: `${color}40`,
              backgroundColor: `${color}15`,
              color: color
            }}
          >
            {statusText}
          </span>
        </div>
      </div>

      {showLabels && (
        <div className="w-full flex justify-between text-[11px] text-slate-400 font-mono px-4 -mt-2">
          <span>{min}%</span>
          <span className="text-slate-300 font-medium">Std 20.9%</span>
          <span>{max}%</span>
        </div>
      )}
    </div>
  );
};
