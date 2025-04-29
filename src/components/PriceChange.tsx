import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface PriceChangeProps {
  value: number;
  format?: 'percent' | 'currency';
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'text-xs gap-0.5',
  md: 'text-sm gap-1',
  lg: 'text-base gap-1.5'
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
};

export const PriceChange = ({
  value,
  format = 'percent',
  showIcon = true,
  size = 'md'
}: PriceChangeProps) => {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  const formattedValue = format === 'percent'
    ? `${Math.abs(value).toFixed(2)}%`
    : `$${Math.abs(value).toLocaleString()}`;

  const colorClass = isNeutral
    ? 'text-[var(--trading-neutral)]'
    : isPositive
      ? 'text-[var(--trading-profit)]'
      : 'text-[var(--trading-loss)]';

  const bgColorClass = isNeutral
    ? 'bg-[var(--trading-neutral)]/10'
    : isPositive
      ? 'bg-[var(--trading-profit)]/10'
      : 'bg-[var(--trading-loss)]/10';

  return (
    <div className={`
      inline-flex items-center px-2 py-1 rounded-lg
      ${sizeClasses[size]}
      ${bgColorClass}
      ${colorClass}
    `}>
      {showIcon && (
        isPositive ? (
          <ArrowUpIcon className={iconSizes[size]} />
        ) : isNeutral ? (
          <span className={`${iconSizes[size]} block`}>−</span>
        ) : (
          <ArrowDownIcon className={iconSizes[size]} />
        )
      )}
      <span className="font-medium">
        {isPositive ? '+' : ''}{formattedValue}
      </span>
    </div>
  );
};

export default PriceChange; 