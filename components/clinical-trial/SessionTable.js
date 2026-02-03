import { useState } from 'react';

export default function SessionTable({ sessions, selectedSession, onSelectSession }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-700">C & D</div>
        <h3 className="text-lg font-semibold text-gray-900">Session History Table</h3>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-80">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-600">Date</th>
              <th className="text-left py-3 px-2 font-medium text-gray-600">Start/End</th>
              <th className="text-left py-3 px-2 font-medium text-gray-600">Total Insulin</th>
              <th className="text-left py-3 px-2 font-medium text-gray-600">Session TIR</th>
              <th className="text-left py-3 px-2 font-medium text-gray-600">Hypo Events</th>
              <th className="text-left py-3 px-2 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session, index) => (
              <tr
                key={session.id}
                onClick={() => onSelectSession(selectedSession?.id === session.id ? null : session)}
                className={`border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                  selectedSession?.id === session.id
                    ? 'bg-teal-50 border-l-4 border-l-teal-400'
                    : 'hover:bg-gray-50'
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeIn 0.3s ease-out forwards'
                }}
              >
                <td className="py-3 px-2 text-gray-900">{session.date}</td>
                <td className="py-3 px-2 text-gray-600">
                  {session.startTime} - {session.endTime}
                </td>
                <td className="py-3 px-2 text-gray-900 font-medium">{session.totalInsulin}u</td>
                <td className="py-3 px-2">
                  <span className={`font-medium ${
                    session.sessionTir >= 70 ? 'text-green-600' :
                    session.sessionTir >= 50 ? 'text-orange-500' : 'text-red-500'
                  }`}>
                    {session.sessionTir}%
                  </span>
                </td>
                <td className="py-3 px-2">
                  {session.hypoEvents === 0 ? (
                    <span className="text-gray-400">0</span>
                  ) : (
                    <span className="text-red-500 font-medium">{session.hypoEvents}</span>
                  )}
                </td>
                <td className="py-3 px-2">
                  <StatusBadge status={session.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedSession && (
        <div className="mt-4 p-3 bg-teal-50 rounded-lg text-sm text-teal-700">
          <span className="font-medium">Selected:</span> Session from {selectedSession.date} is highlighted on the CGM chart above
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
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
  const statusStyles = {
    'Completed': 'bg-green-100 text-green-700',
    'Interrupted': 'bg-yellow-100 text-yellow-700',
    'Device Issue': 'bg-red-100 text-red-700'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status === 'Completed' && (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {status}
    </span>
  );
}
