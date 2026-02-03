import DashboardLayout from '../../components/clinical-trial/DashboardLayout';

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="animate-fadeIn">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-500 mb-8">Configure dashboard preferences and data sources</p>

        <div className="max-w-3xl space-y-6">
          {/* Study Configuration */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Configuration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <div className="font-medium text-gray-900">Study Name</div>
                  <div className="text-sm text-gray-500">Luna AID Clinical Trial - Phase 2</div>
                </div>
                <button className="text-teal-600 text-sm font-medium hover:text-teal-700">Edit</button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <div className="font-medium text-gray-900">Treatment Window</div>
                  <div className="text-sm text-gray-500">10:00 PM - 10:00 AM (Overnight)</div>
                </div>
                <button className="text-teal-600 text-sm font-medium hover:text-teal-700">Edit</button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-gray-900">Target Glucose Range</div>
                  <div className="text-sm text-gray-500">70 - 180 mg/dL (Standard)</div>
                </div>
                <button className="text-teal-600 text-sm font-medium hover:text-teal-700">Edit</button>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Sources</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold text-xs">G7</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Dexcom G7</div>
                    <div className="text-sm text-gray-500">CGM glucose data</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <span className="text-teal-600 font-bold text-xs">🌙</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Luna Insulin System</div>
                    <div className="text-sm text-gray-500">Automated insulin delivery</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-xs">◯</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Oura Ring</div>
                    <div className="text-sm text-gray-500">Sleep and recovery data</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Connected
                </span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">Hypoglycemia Alerts</div>
                  <div className="text-sm text-gray-500">Notify when participant glucose drops below 54 mg/dL</div>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500" />
              </label>
              <label className="flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">Device Disconnection</div>
                  <div className="text-sm text-gray-500">Alert when devices lose connection for more than 2 hours</div>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500" />
              </label>
              <label className="flex items-center justify-between py-3 cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">Daily Summary</div>
                  <div className="text-sm text-gray-500">Receive daily email with study overview</div>
                </div>
                <input type="checkbox" className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500" />
              </label>
            </div>
          </div>

          {/* Demo Mode Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="font-medium text-blue-900">Demo Mode Active</div>
                <div className="text-sm text-blue-700">This dashboard is running with simulated data for demonstration purposes. Settings changes are not persisted.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
