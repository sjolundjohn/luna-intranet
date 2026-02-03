import { useEffect, useState } from 'react';

export default function SleepData({ sleepData }) {
  const [animatedValues, setAnimatedValues] = useState({
    efficiency: 0,
    hrv: 0,
    restingHr: 0,
    readinessScore: 0
  });

  // Animate numbers
  useEffect(() => {
    const duration = 800;
    const start = Date.now();

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedValues({
        efficiency: Math.round(sleepData.efficiency * eased),
        hrv: Math.round(sleepData.hrv * eased),
        restingHr: Math.round(sleepData.restingHr * eased),
        readinessScore: Math.round(sleepData.readinessScore * eased)
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [sleepData]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-gray-900">Sleep Data Integration (Oura)</h3>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <div className="text-xs text-gray-500 mb-1">Sleep Duration:</div>
          <div className="text-2xl font-bold text-gray-900">{sleepData.duration}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Efficiency:</div>
          <div className="text-2xl font-bold text-gray-900">{animatedValues.efficiency}%</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">HRV:</div>
          <div className="text-2xl font-bold text-gray-900">{animatedValues.hrv} <span className="text-sm font-normal">ms</span></div>
        </div>
      </div>

      {/* Sleep Stage Chart */}
      <div className="mb-6">
        <SleepStageChart data={sleepData.hourlyData} stages={sleepData.stages} />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">Resting HR:</span>
          <span className="text-lg font-bold text-gray-900">{animatedValues.restingHr} <span className="text-sm font-normal">bpm</span></span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">Readiness Score:</span>
          <span className={`text-lg font-bold ${
            sleepData.readinessScore >= 85 ? 'text-green-600' :
            sleepData.readinessScore >= 70 ? 'text-orange-500' : 'text-red-500'
          }`}>{animatedValues.readinessScore}</span>
        </div>
      </div>

      {/* Sleep Stage Legend */}
      <div className="flex items-center justify-end gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-indigo-800"></div>
          <span className="text-gray-600">Deep ({sleepData.stages.deep}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-teal-500"></div>
          <span className="text-gray-600">REM ({sleepData.stages.rem}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-300"></div>
          <span className="text-gray-600">Light ({sleepData.stages.light}%)</span>
        </div>
      </div>
    </div>
  );
}

function SleepStageChart({ data, stages }) {
  if (!data || data.length === 0) return null;

  const maxHeight = 60;

  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((hour, index) => {
        const total = hour.deep + hour.rem + hour.light;
        const deepHeight = (hour.deep / total) * maxHeight;
        const remHeight = (hour.rem / total) * maxHeight;
        const lightHeight = (hour.light / total) * maxHeight;

        return (
          <div
            key={index}
            className="flex-1 flex flex-col"
            style={{
              animation: 'growUp 0.5s ease-out forwards',
              animationDelay: `${index * 50}ms`,
              opacity: 0,
              transform: 'scaleY(0)'
            }}
          >
            <div className="bg-blue-300 rounded-t-sm" style={{ height: `${lightHeight}px` }} title={`Light: ${hour.light}%`}></div>
            <div className="bg-teal-500" style={{ height: `${remHeight}px` }} title={`REM: ${hour.rem}%`}></div>
            <div className="bg-indigo-800 rounded-b-sm" style={{ height: `${deepHeight}px` }} title={`Deep: ${hour.deep}%`}></div>
          </div>
        );
      })}
      <style jsx>{`
        @keyframes growUp {
          from {
            opacity: 0;
            transform: scaleY(0);
          }
          to {
            opacity: 1;
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  );
}
