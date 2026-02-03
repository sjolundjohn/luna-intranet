import { useEffect, useState } from 'react';

export default function MetricsPanel({ metrics }) {
  const [animatedValues, setAnimatedValues] = useState({
    tir: 0, tbr: 0, tar: 0, gmi: 0, cv: 0, avgGlucose: 0
  });

  // Animate numbers on mount
  useEffect(() => {
    const duration = 800;
    const start = Date.now();

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedValues({
        tir: Math.round(metrics.tir * eased),
        tbr: Math.round(metrics.tbr * eased),
        tar: Math.round(metrics.tar * eased),
        gmi: (metrics.gmi * eased).toFixed(1),
        cv: Math.round(metrics.cv * eased),
        avgGlucose: Math.round(metrics.avgGlucose * eased)
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [metrics]);

  const metricCards = [
    {
      label: 'Time in Range (70-180)',
      value: animatedValues.tir,
      unit: '%',
      target: '>70%',
      color: 'green',
      icon: '⏱',
      progress: animatedValues.tir,
      progressMax: 100
    },
    {
      label: 'Time Below Range (<70)',
      value: animatedValues.tbr,
      unit: '%',
      target: '<4%',
      color: 'red',
      icon: '↓',
      progress: animatedValues.tbr,
      progressMax: 10
    },
    {
      label: 'Time Above Range (>180)',
      value: animatedValues.tar,
      unit: '%',
      target: '<25%',
      color: 'orange',
      icon: '↑',
      progress: animatedValues.tar,
      progressMax: 50
    },
    {
      label: 'GMI (Estimated A1C)',
      value: animatedValues.gmi,
      unit: '%',
      target: null,
      color: 'blue',
      icon: '🩸',
      progress: null
    },
    {
      label: 'CV (Variability)',
      value: animatedValues.cv,
      unit: '%',
      target: '<36%',
      color: 'purple',
      icon: '📈',
      progress: animatedValues.cv,
      progressMax: 50
    },
    {
      label: 'Average Glucose',
      value: animatedValues.avgGlucose,
      unit: 'mg/dL',
      target: null,
      color: 'teal',
      icon: '◎',
      progress: null
    }
  ];

  const colorMap = {
    green: { bg: 'bg-green-50', text: 'text-green-600', bar: 'bg-green-400', border: 'border-green-200' },
    red: { bg: 'bg-red-50', text: 'text-red-500', bar: 'bg-red-400', border: 'border-red-200' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-500', bar: 'bg-orange-400', border: 'border-orange-200' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', bar: 'bg-blue-400', border: 'border-blue-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', bar: 'bg-purple-400', border: 'border-purple-200' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-600', bar: 'bg-teal-400', border: 'border-teal-200' }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700">B</div>
        <h3 className="text-lg font-semibold text-gray-900">Glycemic Metrics Panel</h3>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-6 gap-4">
        {metricCards.map((metric, index) => {
          const colors = colorMap[metric.color];
          return (
            <div
              key={index}
              className={`p-4 rounded-xl ${colors.bg} border ${colors.border} transition-all duration-200 hover:shadow-md`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm">{metric.icon}</span>
                <span className="text-xs text-gray-600 font-medium leading-tight">{metric.label}</span>
              </div>

              <div className={`text-3xl font-bold ${colors.text} mb-1`}>
                {metric.value}
                <span className="text-lg font-normal ml-0.5">{metric.unit}</span>
              </div>

              {metric.target && (
                <div className="text-xs text-gray-500">
                  Target {metric.target}
                </div>
              )}

              {metric.progress !== null && (
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colors.bar} rounded-full transition-all duration-700`}
                    style={{ width: `${Math.min((metric.progress / metric.progressMax) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
