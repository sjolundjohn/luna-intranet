import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const currentPath = router.pathname;

  const navItems = [
    { name: 'Overview', path: '/clinical-trial', icon: 'home' },
    { name: 'Participants', path: '/clinical-trial/participants', icon: 'users' },
    { name: 'Reports', path: '/clinical-trial/reports', icon: 'file' },
    { name: 'Settings', path: '/clinical-trial/settings', icon: 'settings' }
  ];

  const isActive = (path) => {
    if (path === '/clinical-trial') {
      return currentPath === '/clinical-trial';
    }
    return currentPath.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-48 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-4 border-b border-gray-100">
          <Link href="/clinical-trial" className="flex items-center gap-2">
            <div className="w-8 h-8 relative">
              <svg viewBox="0 0 40 40" className="w-full h-full">
                <path
                  d="M20 5 C10 5, 5 15, 5 20 C5 30, 15 35, 20 35 C15 30, 12 25, 12 20 C12 12, 18 8, 20 5"
                  fill="#68D2DF"
                />
              </svg>
            </div>
            <span className="font-semibold text-navy">Luna Health</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <NavIcon name={item.icon} active={isActive(item.path)} />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Back to Intranet */}
        <div className="p-3 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Intranet
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-48">
        <div className="p-8">
          {children}
        </div>
      </main>

      <style jsx global>{`
        .text-navy {
          color: #041E42;
        }
        .bg-navy {
          background-color: #041E42;
        }
        .text-teal-700 {
          color: #0D9488;
        }
        .bg-teal-50 {
          background-color: #F0FDFA;
        }
        .border-teal {
          border-color: #68D2DF;
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes countUp {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes drawLine {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }

        .animate-countUp {
          animation: countUp 0.8s ease-out forwards;
        }

        /* Card hover effect */
        .card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}

function NavIcon({ name, active }) {
  const color = active ? '#0D9488' : '#6B7280';

  const icons = {
    home: (
      <svg className="w-5 h-5" fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    users: (
      <svg className="w-5 h-5" fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    file: (
      <svg className="w-5 h-5" fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    settings: (
      <svg className="w-5 h-5" fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  };

  return icons[name] || null;
}
