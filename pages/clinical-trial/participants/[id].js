import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import DashboardLayout from '../../../components/clinical-trial/DashboardLayout';
import CGMChart from '../../../components/clinical-trial/CGMChart';
import MetricsPanel from '../../../components/clinical-trial/MetricsPanel';
import SessionTable from '../../../components/clinical-trial/SessionTable';
import SleepData from '../../../components/clinical-trial/SleepData';
import {
  generateCGMData,
  generateInsulinEvents,
  calculateMetrics,
  generateSessionHistory,
  generateSleepData
} from '../../../lib/mockData';

export default function ParticipantDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [cgmData, setCgmData] = useState([]);
  const [insulinEvents, setInsulinEvents] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sleepData, setSleepData] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [dateRange, setDateRange] = useState('24h');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Load mock data
  useEffect(() => {
    if (!id) return;

    // Use participant ID as seed for consistent data per participant
    const seed = parseInt(id.replace('P', '')) || 1;

    const cgm = generateCGMData(selectedDate, dateRange === '24h' ? 1 : dateRange === '7d' ? 7 : 14);
    const insulin = generateInsulinEvents(selectedDate);
    const calculatedMetrics = calculateMetrics(cgm);
    const sessionHistory = generateSessionHistory(14);
    const sleep = generateSleepData(selectedDate);

    setCgmData(cgm);
    setInsulinEvents(insulin);
    setMetrics(calculatedMetrics);
    setSessions(sessionHistory);
    setSleepData(sleep);
  }, [id, selectedDate, dateRange]);

  // Determine participant status
  const participantStatus = 'Active';

  if (!metrics || !sleepData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse text-gray-400">Loading participant data...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fadeIn">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/clinical-trial"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Participant Detail: {id}</h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  participantStatus === 'Active' ? 'bg-green-100 text-green-700' :
                  participantStatus === 'Paused' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    participantStatus === 'Active' ? 'bg-green-500' :
                    participantStatus === 'Paused' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></span>
                  {participantStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="text-sm text-gray-700 bg-transparent focus:outline-none"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="14d">Last 14 Days</option>
              </select>
              <span className="text-sm text-gray-500">
                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* CGM Chart - Full Width */}
        <div className="mb-6" style={{ animationDelay: '100ms' }}>
          <CGMChart
            cgmData={cgmData}
            insulinEvents={insulinEvents}
            highlightSession={selectedSession}
          />
        </div>

        {/* Metrics Panel - Full Width */}
        <div className="mb-6" style={{ animationDelay: '200ms' }}>
          <MetricsPanel metrics={metrics} />
        </div>

        {/* Session History + Sleep Data - Side by Side */}
        <div className="grid grid-cols-5 gap-6" style={{ animationDelay: '300ms' }}>
          <div className="col-span-3">
            <SessionTable
              sessions={sessions}
              selectedSession={selectedSession}
              onSelectSession={setSelectedSession}
            />
          </div>
          <div className="col-span-2">
            <SleepData sleepData={sleepData} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
