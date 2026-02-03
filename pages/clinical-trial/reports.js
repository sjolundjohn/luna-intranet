import DashboardLayout from '../../components/clinical-trial/DashboardLayout';

export default function Reports() {
  return (
    <DashboardLayout>
      <div className="animate-fadeIn">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-500 mb-8">Generate and export clinical trial reports</p>

        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports Coming Soon</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            This section will allow you to generate AGP reports, export data for regulatory submission, and create custom analytics reports.
          </p>
        </div>

        {/* Quick Stats Preview */}
        <div className="grid grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Available Report Types</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                AGP Standard Report
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                Participant Summary
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                Device Compliance Report
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                Safety Events Log
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Export Formats</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                PDF Reports
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                CSV Data Export
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Excel Workbooks
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                JSON API Export
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Scheduled Reports</h4>
            <div className="text-sm text-gray-600">
              <p className="mb-3">Set up automated report delivery to stakeholders.</p>
              <button className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed">
                Configure (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
