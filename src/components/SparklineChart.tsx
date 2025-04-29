import { useEffect, useRef, useState, useCallback } from 'react';

interface SparklineChartProps {
  data?: number[];
  width?: number;
  height?: number;
  color?: string;
  lineWidth?: number;
  showArea?: boolean;
  timestamps?: Date[];
}

interface TooltipData {
  x: number;
  y: number;
  price: number;
  timestamp?: Date;
}

export const SparklineChart = ({
  data = [],
  height = 60,
  color = 'var(--brand-orange)',
  lineWidth = 1.5,
  showArea = true,
  timestamps
}: SparklineChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Format price for tooltip with appropriate precision
  const formatPrice = (price: number) => {
    const precision = price < 1 ? 4 : price < 10 ? 3 : 2;
    return `${price.toFixed(precision)} CC`;
  };

  // Format timestamp for tooltip with improved readability
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return timestamp.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 168) { // 7 days
      return timestamp.toLocaleString('en-US', {
        weekday: 'short',
        hour: '2-digit'
      });
    } else {
      return timestamp.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Handle resize
  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      setContainerWidth(width);
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [updateDimensions]);

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length < 2 || containerWidth === 0) {
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, containerWidth, height);
        ctx.beginPath();
        ctx.strokeStyle = `${color}30`;
        ctx.moveTo(0, height / 2);
        ctx.lineTo(containerWidth, height / 2);
        ctx.stroke();
      }
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up high DPI canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${height}px`;

    // Clear canvas
    ctx.clearRect(0, 0, containerWidth, height);

    // Calculate scaling factors with improved padding
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const valueRange = maxValue - minValue;
    const padding = Math.max(valueRange * 0.1, minValue * 0.01); // Dynamic padding
    const yMin = Math.max(0, minValue - padding); // Ensure we don't go below 0
    const yMax = maxValue + padding;
    const yScale = (height - 20) / ((yMax - yMin) || 1);

    // Draw gradient background
    if (showArea) {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, `${color}15`);
      gradient.addColorStop(1, `${color}05`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, containerWidth, height);
    }

    // Draw grid
    ctx.strokeStyle = 'var(--border)';
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.textAlign = 'right';
    ctx.font = '10px system-ui';
    ctx.lineWidth = 0.5;

    // Draw y-axis grid and labels
    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const y = height - 20 - (i * (height - 20) / ySteps);
      const value = yMin + (i * (yMax - yMin) / ySteps);

      ctx.beginPath();
      ctx.setLineDash([2, 2]);
      ctx.moveTo(0, y);
      ctx.lineTo(containerWidth, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillText(formatPrice(value), 25, y + 4);
    }

    // Draw x-axis timestamps
    if (timestamps && timestamps.length > 1) {
      ctx.textAlign = 'center';
      const xSteps = Math.min(6, timestamps.length - 1);
      for (let i = 0; i <= xSteps; i++) {
        const x = i * (containerWidth / xSteps);
        const index = Math.floor(i * (timestamps.length - 1) / xSteps);
        const timestamp = timestamps[index];

        ctx.beginPath();
        ctx.setLineDash([2, 2]);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height - 20);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillText(formatTimestamp(timestamp), x, height - 5);
      }
    }

    // Draw price line with smooth curve
    ctx.beginPath();
    ctx.moveTo(0, height - 20 - (data[0] - yMin) * yScale);

    const points: { x: number; y: number }[] = [];
    data.forEach((value, index) => {
      const x = index * (containerWidth / (data.length - 1));
      const y = height - 20 - (value - yMin) * yScale;
      points.push({ x, y });
    });

    // Create smooth curve
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.quadraticCurveTo(
      points[points.length - 1].x,
      points[points.length - 1].y,
      points[points.length - 1].x,
      points[points.length - 1].y
    );

    // Draw area if enabled
    if (showArea) {
      ctx.lineTo(points[points.length - 1].x, height - 20);
      ctx.lineTo(0, height - 20);
      ctx.fillStyle = `${color}10`;
      ctx.fill();
    }

    // Style and stroke the line
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Enhanced hover interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * dpr;

      let closest = points[0];
      let minDistance = Infinity;
      let closestIndex = 0;

      points.forEach((point, index) => {
        const distance = Math.abs(point.x * dpr - x);
        if (distance < minDistance) {
          minDistance = distance;
          closest = point;
          closestIndex = index;
        }
      });

      if (minDistance < 50 * dpr) {
        setTooltip({
          x: closest.x,
          y: closest.y,
          price: data[closestIndex],
          timestamp: timestamps?.[closestIndex]
        });
      } else {
        setTooltip(null);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', () => setTooltip(null));

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', () => setTooltip(null));
    };
  }, [data, containerWidth, height, color, lineWidth, showArea, timestamps]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
      />
      {tooltip && (
        <div
          className="absolute z-10 px-3 py-2 text-sm bg-[var(--sidebar-bg)] border border-[var(--accent)] rounded-lg shadow-lg pointer-events-none"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 40}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-medium text-[var(--text)]">{formatPrice(tooltip.price)}</div>
          {tooltip.timestamp && (
            <div className="text-xs text-[var(--text)]/60">{formatTimestamp(tooltip.timestamp)}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SparklineChart; 