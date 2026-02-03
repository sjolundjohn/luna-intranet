import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../components/clinical-trial/DashboardLayout';
import { generateParticipants, getStudySummary } from '../../lib/mockData';

export default function ClinicalTrialOverview() {
  const [participants, setParticipants] = useState([]);
  const [summary, setSummary] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const data = generateParticipants(12);
    setParticipants(data);
    setSummary(getStudySummary(data));
  }, []);

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="animate-fadeIn">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Study Overview</h1>
          <p className="text-gray-500">Luna Automated Insulin Delivery Clinical Trial</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-4 gap-6 mb-8">
            <SummaryCard
              label="Total Participants"
              value={summary.totalParticipants}
              icon="👥"
              color="blue"
              delay={0}
            />
            <SummaryCard
              label="Average TIR"
              value={`${summary.avgTir}%`}
              subValue="Study-wide"
              icon="🎯"
              color="green"
              delay={100}
            />
            <SummaryCard
              label="Device Compliance"
              value={`${summary.deviceCompliance}%`}
              subValue="CGM + Luna"
              icon="📱"
              color="purple"
              delay={200}
            />
            <SummaryCard
              label="Sessions This Week"
              value={summary.sessionsThisWeek}
              icon="🌙"
              color="teal"
              delay={300}
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search participants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-xs px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>

        {/* Participants Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Participant ID</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">7-Day TIR</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">CGM Wear</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Last Session</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm"></th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((participant, index) => (
                <tr
                  key={participant.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  style={{
                    animation: 'fadeInRow 0.3s ease-out forwards',
                    animationDelay: `${index * 50}ms`,
                    opacity: 0
                  }}
                >
                  <td className="py-4 px-6">
                    <span className="font-semibold text-gray-900">{participant.id}</span>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={participant.status} />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${
                        participant.tir7Day >= 70 ? 'text-green-600' :
                        participant.tir7Day >= 50 ? 'text-orange-500' : 'text-red-500'
                      }`}>
                        {participant.tir7Day}%
                      </span>
                      <TrendIndicator trend={participant.tirTrend} />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            participant.cgmWear >= 90 ? 'bg-green-400' :
                            participant.cgmWear >= 70 ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${participant.cgmWear}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{participant.cgmWear}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {participant.lastSessionDate}
                  </td>
                  <td className="py-4 px-6">
                    <Link
                      href={`/clinical-trial/participants/${participant.id}`}
                      className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center gap-1"
                    >
                      View Details
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInRow {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </DashboardLayout>
  );
}

function SummaryCard({ label, value, subValue, icon, color, delay }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const numericValue = parseInt(value) || 0;
    const duration = 800;
    const start = Date.now();

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(Math.round(numericValue * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timeout = setTimeout(() => {
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  const colorMap = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    teal: 'from-teal-500 to-teal-600'
  };

  const isPercentage = typeof value === 'string' && value.includes('%');

  return (
    <div
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 card-hover"
      style={{
        animation: 'fadeIn 0.4s ease-out forwards',
        animationDelay: `${delay}ms`,
        opacity: 0
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colorMap[color]}`}></div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">
        {displayValue}{isPercentage ? '%' : ''}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
      {subValue && <div className="text-xs text-gray-400 mt-1">{subValue}</div>}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    'Active': 'bg-green-100 text-green-700',
    'Paused': 'bg-yellow-100 text-yellow-700',
    'Flagged': 'bg-red-100 text-red-700'
  };

  const dots = {
    'Active': 'bg-green-500',
    'Paused': 'bg-yellow-500',
    'Flagged': 'bg-red-500'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`}></span>
      {status}
    </span>
  );
}

function TrendIndicator({ trend }) {
  if (trend === 'up') {
    return (
      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    );
  }
  if (trend === 'down') {
    return (
      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  );
}
