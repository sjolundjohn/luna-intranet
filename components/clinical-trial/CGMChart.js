import { useEffect, useRef, useState } from 'react';

export default function CGMChart({
  cgmData,
  insulinEvents,
  highlightSession = null,
  onHover = null
}) {
  const canvasRef = useRef(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Chart dimensions
  const margin = { top: 30, right: 80, bottom: 40, left: 50 };
  const width = 900;
  const height = 320;
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Glucose range
  const minGlucose = 40;
  const maxGlucose = 400;

  // Animation on mount
  useEffect(() => {
    let start = null;
    const duration = 1500;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [cgmData]);

  // Draw chart
  useEffect(() => {
    if (!canvasRef.current || !cgmData || cgmData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Helper functions
    const xScale = (time) => {
      const startTime = cgmData[0].time.getTime();
      const endTime = cgmData[cgmData.length - 1].time.getTime();
      return margin.left + ((time.getTime() - startTime) / (endTime - startTime)) * chartWidth;
    };

    const yScale = (glucose) => {
      return margin.top + chartHeight - ((glucose - minGlucose) / (maxGlucose - minGlucose)) * chartHeight;
    };

    // Draw Luna session background (10pm - 10am)
    cgmData.forEach((point, i) => {
      const hour = point.time.getHours();
      if (hour >= 22 || hour < 10) {
        const x = xScale(point.time);
        if (i === 0 || (cgmData[i-1].time.getHours() < 22 && cgmData[i-1].time.getHours() >= 10)) {
          // Start of session
          ctx.fillStyle = 'rgba(104, 210, 223, 0.15)';
          let endX = x;
          for (let j = i; j < cgmData.length; j++) {
            const h = cgmData[j].time.getHours();
            if (h >= 10 && h < 22) {
              endX = xScale(cgmData[j].time);
              break;
            }
            endX = xScale(cgmData[j].time);
          }
          ctx.fillRect(x, margin.top, endX - x, chartHeight);

          // Session label
          ctx.fillStyle = '#041E42';
          ctx.font = '11px Inter, system-ui, sans-serif';
          ctx.fillText('Luna Active Session', x + 10, margin.top + 20);
          ctx.fillStyle = '#666';
          ctx.font = '10px Inter, system-ui, sans-serif';
          ctx.fillText('10:00 PM - 10:00 AM', x + 10, margin.top + 34);
        }
      }
    });

    // Highlight selected session
    if (highlightSession) {
      const startX = xScale(highlightSession.startDateTime);
      const endX = xScale(highlightSession.endDateTime);
      ctx.fillStyle = 'rgba(104, 210, 223, 0.3)';
      ctx.fillRect(startX, margin.top, endX - startX, chartHeight);
      ctx.strokeStyle = '#68D2DF';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(startX, margin.top, endX - startX, chartHeight);
      ctx.setLineDash([]);
    }

    // Draw target range bands
    // Below range (red) - < 70
    const y70 = yScale(70);
    const yBottom = yScale(minGlucose);
    ctx.fillStyle = 'rgba(244, 67, 54, 0.08)';
    ctx.fillRect(margin.left, y70, chartWidth, yBottom - y70);

    // In range (green) - 70-180
    const y180 = yScale(180);
    ctx.fillStyle = 'rgba(76, 175, 80, 0.08)';
    ctx.fillRect(margin.left, y180, chartWidth, y70 - y180);

    // Above range (orange) - > 180
    ctx.fillStyle = 'rgba(255, 152, 0, 0.08)';
    ctx.fillRect(margin.left, margin.top, chartWidth, y180 - margin.top);

    // Draw grid lines
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    [70, 180, 250, 400].forEach(glucose => {
      const y = yScale(glucose);
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(width - margin.right, y);
      ctx.stroke();

      // Y-axis labels
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(glucose.toString(), margin.left - 10, y + 4);
    });

    // Also draw 40
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('40', margin.left - 10, yScale(40) + 4);

    // Time labels on X-axis
    const timeLabels = [];
    let lastHour = -1;
    cgmData.forEach((point, i) => {
      const hour = point.time.getHours();
      if (hour !== lastHour && (hour % 6 === 0 || hour === 12)) {
        timeLabels.push({ time: point.time, x: xScale(point.time) });
        lastHour = hour;
      }
    });

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    timeLabels.forEach(label => {
      const hour = label.time.getHours();
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      ctx.fillText(`${displayHour} ${ampm}`, label.x, height - margin.bottom + 20);
    });

    // Draw glucose line with animation
    const pointsToDraw = Math.floor(cgmData.length * animationProgress);

    ctx.beginPath();
    ctx.strokeStyle = '#041E42';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    for (let i = 0; i < pointsToDraw; i++) {
      const point = cgmData[i];
      const x = xScale(point.time);
      const y = yScale(point.glucose);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw insulin events
    if (insulinEvents && animationProgress > 0.5) {
      insulinEvents.forEach(event => {
        const x = xScale(event.time);
        // Find closest glucose value
        const closestPoint = cgmData.reduce((closest, point) => {
          const diff = Math.abs(point.time.getTime() - event.time.getTime());
          const closestDiff = Math.abs(closest.time.getTime() - event.time.getTime());
          return diff < closestDiff ? point : closest;
        });
        const y = yScale(closestPoint.glucose);

        // Draw dot
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#68D2DF';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    // Draw hovered point tooltip
    if (hoveredPoint) {
      const x = xScale(hoveredPoint.time);
      const y = yScale(hoveredPoint.glucose);

      // Tooltip background
      const tooltipText = `${hoveredPoint.glucose} mg/dL`;
      const timeText = hoveredPoint.time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

      ctx.font = 'bold 12px Inter, system-ui, sans-serif';
      const textWidth = Math.max(ctx.measureText(tooltipText).width, ctx.measureText(timeText).width);

      const tooltipX = x - textWidth / 2 - 10;
      const tooltipY = y - 50;

      ctx.fillStyle = '#041E42';
      ctx.beginPath();
      ctx.roundRect(tooltipX, tooltipY, textWidth + 20, 40, 6);
      ctx.fill();

      // Tooltip arrow
      ctx.beginPath();
      ctx.moveTo(x - 6, tooltipY + 40);
      ctx.lineTo(x, tooltipY + 48);
      ctx.lineTo(x + 6, tooltipY + 40);
      ctx.fill();

      // Tooltip text
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tooltipText, x, tooltipY + 18);
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.fillText(timeText, x, tooltipY + 32);

      // Highlight point
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#041E42';
      ctx.fill();
    }

  }, [cgmData, insulinEvents, animationProgress, hoveredPoint, highlightSession]);

  // Handle mouse move for tooltip
  const handleMouseMove = (e) => {
    if (!canvasRef.current || !cgmData || cgmData.length === 0) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if within chart area
    if (mouseX < margin.left || mouseX > width - margin.right ||
        mouseY < margin.top || mouseY > height - margin.bottom) {
      setHoveredPoint(null);
      return;
    }

    // Find closest point
    const startTime = cgmData[0].time.getTime();
    const endTime = cgmData[cgmData.length - 1].time.getTime();
    const timeAtMouse = startTime + ((mouseX - margin.left) / chartWidth) * (endTime - startTime);

    const closestPoint = cgmData.reduce((closest, point) => {
      const diff = Math.abs(point.time.getTime() - timeAtMouse);
      const closestDiff = Math.abs(closest.time.getTime() - timeAtMouse);
      return diff < closestDiff ? point : closest;
    });

    setHoveredPoint(closestPoint);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700">A</div>
          <h3 className="text-lg font-semibold text-gray-900">CGM Glucose Trace</h3>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-navy"></div>
            <span className="text-gray-600">Glucose trace</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal-400"></div>
            <span className="text-gray-600">Insulin Event</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="cursor-crosshair"
        style={{ maxWidth: '100%' }}
      />

      <style jsx>{`
        .bg-navy {
          background-color: #041E42;
        }
      `}</style>
    </div>
  );
}
